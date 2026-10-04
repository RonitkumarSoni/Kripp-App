// Dry run: node scripts/import-legacy.mjs <backup-folder> <firebase-project-id>
// Apply using an owner OAuth token in local FIREBASE_MIGRATION_ACCESS_TOKEN, with --apply.
// This tool preserves source IDs and never overwrites existing destination documents.
import fs from 'node:fs';
import path from 'node:path';
const [directory, project, flag] = process.argv.slice(2);
if (!directory || !project) throw Error('Usage: node scripts/import-legacy.mjs <backup-folder> <firebase-project-id> [--apply]');
const read = name => JSON.parse(fs.readFileSync(path.join(directory, name + '.json'), 'utf8'));
const manifest = read('manifest'), properties = read('properties'), users = read('users'), saved = read('saved_properties');
const mapPath = path.join(directory, 'verified-uid-map.json');
const uidMap = fs.existsSync(mapPath) ? JSON.parse(fs.readFileSync(mapPath, 'utf8')) : {};
const mapUid = uid => uidMap[uid] || uid || null;
const jobs = properties.map(row => ({ path: 'kribb_properties/' + row.id, data: { ...row, owner_clerk_id: mapUid(row.owner_clerk_id) } }));
for (const user of users) {
 if (!uidMap[user.clerk_id]) throw Error('Verified Firebase UID mapping is required for legacy users; unverified email matching is unsafe.');
 jobs.push({ path: 'kribb_users/' + mapUid(user.clerk_id), data: { email: user.email || '', first_name: user.first_name || '', last_name: user.last_name || '', avatar_url: user.avatar_url || '', is_admin: user.is_admin === true } });
}
for (const row of saved) {
 if (!uidMap[row.user_clerk_id]) throw Error('Verified Firebase UID mapping is required for saved-listing owners.');
 jobs.push({ path: 'kribb_users/' + mapUid(row.user_clerk_id) + '/saved/' + row.property_id, data: { property_id: row.property_id, created_at: row.created_at || manifest.exportedAt } });
}
function typed(value) {
 if (value === null || value === undefined) return { nullValue: null };
 if (typeof value === 'string') return { stringValue: value };
 if (typeof value === 'boolean') return { booleanValue: value };
 if (typeof value === 'number') return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
 if (Array.isArray(value)) return { arrayValue: { values: value.map(typed) } };
 return { mapValue: { fields: fields(value) } };
}
const fields = value => Object.fromEntries(Object.entries(value).map(([k,v]) => [k,typed(v)]));
const canonical = value => JSON.stringify(normalize(value));
function normalize(value) {
 if (Array.isArray(value)) return value.map(normalize);
 if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map(k=>[k,normalize(value[k])]));
 return value;
}
console.log(JSON.stringify({properties: properties.length, users: users.length, saved: saved.length, sourceBackupComplete: manifest.complete === true, apply: flag === '--apply'}));
if (flag === '--apply') {
 const token = process.env.FIREBASE_MIGRATION_ACCESS_TOKEN;
 if (!token) throw Error('Missing owner OAuth token. Never put this token in the app or commit it.');
 const root = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(project)}/databases/(default)/documents/`;
 for (const job of jobs) {
  const url = root + job.path.split('/').map(encodeURIComponent).join('/');
  const payload = { fields: fields(job.data) };
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type':'application/json' };
  const existing = await fetch(url,{headers});
  if (existing.ok) {
   if (canonical((await existing.json()).fields) === canonical(payload.fields)) continue;
   throw Error('Existing destination differs; stopped without overwriting it.');
  }
  if (existing.status !== 404) throw Error(`Destination read failed: HTTP ${existing.status}`);
  const response = await fetch(url+'?currentDocument.exists=false',{method:'PATCH',headers,body:JSON.stringify(payload)});
  if (!response.ok) throw Error(`Import stopped: HTTP ${response.status}`);
  const check = await fetch(url,{headers});
  if (!check.ok || canonical((await check.json()).fields) !== canonical(payload.fields)) throw Error('Imported document verification failed.');
 }
 console.log('All planned documents imported and verified. Full source backup completeness still requires owner verification.');
}
