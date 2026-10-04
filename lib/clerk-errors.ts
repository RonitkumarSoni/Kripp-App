// Preserve Clerk's delivery/quota errors instead of mislabelling them as bad input.
export function clerkErrorMessage(error: unknown, fallback: string): string {
  const response = error as {
    errors?: { code?: string; longMessage?: string; message?: string }[];
    message?: string;
  };
  const detail = response?.errors?.[0];
  if (detail?.code === 'too_many_requests' || detail?.code === 'rate_limit_exceeded') {
    return 'Too many attempts. Please wait before requesting another code.';
  }
  const message = detail?.longMessage || detail?.message || response?.message || fallback;
  // Include the provider's error code so delivery failures can be traced in the dashboard.
  return detail?.code ? `${message} (${detail.code})` : message;
}
