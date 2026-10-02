# APK email verification

The checked-in preview and production EAS profiles both use the same Clerk
development (`pk_test_`) instance as the local `.env`. Android has INTERNET
permission. Neither finding proves that an installed APK uses this exact config.

Fixed in the custom login flow:
- Supply the supported email factor's `emailAddressId` when requesting an OTP.
- Prepare and verify a second-factor email code when Clerk requires device trust
  (`needs_client_trust` or the legacy `needs_second_factor` response).
- Allow login OTP resend and preserve delivery errors on screen.
- Prevent concurrent signup resend requests and avoid labelling arbitrary Clerk
  errors as invalid email/password input.

## Verify delivery in Clerk

1. Select the development instance matching the publishable key in `eas.json`.
2. Check email delivery/usage and failed requests for the time of the failed signup.
   Clerk documents a 100-email/month development limit when Clerk delivers the
   messages, with exceptions including paid subscriptions. Exhaustion is a
   possibility, not a confirmed diagnosis for this app.
3. Confirm signup email verification uses email codes and Clerk email delivery is
   enabled. If delivery is disabled, a custom `email.created` webhook sender is
   required; this app does not send emails itself.
4. Check Gmail Spam and All Mail. Addresses containing `+clerk_test` do not receive
   real verification emails.

## Release and validate

For public distribution, configure a Clerk production instance, finish its domain
setup, and replace the production profile's development publishable key with that
instance's actual `pk_live_` key. Align backend token validation/integrations with
the same instance. Development users do not automatically become production users.
Do not put a Clerk secret key in the mobile app. Merely editing `.env` will not
replace the explicitly configured key in `eas.json`.

Build the updated test APK with `eas build --platform android --profile preview`.
Install the new artifact, register a real email, verify its code, sign out, then
sign in from a fresh installation to exercise device verification. Check resend
and invalid-code errors. JavaScript changes do not update an already downloaded
APK in this project (native Expo Updates is disabled).

Actual Gmail delivery and installed-device authentication still require this
end-to-end check; TypeScript validation alone cannot verify either.

References:
- https://clerk.com/docs/guides/development/testing/test-emails-and-phones
- https://clerk.com/docs/guides/secure/device-trust
- https://clerk.com/docs/guides/development/troubleshooting/email-deliverability
