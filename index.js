// ============================================================
// POLYFILLS - Ye sab se PEHLE chalte hain, kisi bhi library se pehle
// React Native (Hermes) mein DOMException nahi hota
// lekin @supabase/supabase-js internally ise use karta hai
// Agar ye polyfill na ho toh phone par:
//   "ReferenceError: Property 'DOMException' doesn't exist"
// error aata hai. Ab KABHI nahi aayega.
// ============================================================
if (typeof globalThis.DOMException === "undefined") {
  globalThis.DOMException = class DOMException extends Error {
    constructor(message, name) {
      super(message);
      this.name = name || "DOMException";
    }
  };
}

// Ab actual app entry point load karo
import "expo-router/entry";
