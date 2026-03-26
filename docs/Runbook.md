# JoGEDA Conference Ops Runbook
## Quick troubleshooting (Organisers + Ops)

**Last updated**: 2026-03-26

---

## 1) First-response checklist (always do these first)
- **Refresh the dashboard** (and hard refresh browser if needed).
- Confirm you’re on the correct environment/domain (staging vs production).
- Confirm the device has network access to Supabase Functions URL.
- If using the scanner: confirm the browser has camera permissions.

---

## 2) QR scanner problems

### 2.1 “Camera unavailable” / permission denied
Likely causes:
- Browser permission not granted
- Page not served over HTTPS (mobile browsers often restrict camera on non-HTTPS)
- Another tab/app is using the camera

What to do:
- Re-open the site and approve camera permissions
- Close other apps using the camera (Zoom/Meet/Camera)
- Try Safari on iOS, Chrome on Android

### 2.2 Scanner opens but does not detect codes
Likely causes:
- Low light / glare / poor focus
- QR too small or too far

What to do:
- Improve lighting, hold QR steady, fill more of the frame
- Increase screen brightness if scanning off a phone screen

---

## 3) Dashboard cannot load attendees

### 3.1 “Supabase functions base URL is not configured.”
Cause:
- Missing `VITE_SUPABASE_FUNCTIONS_URL` in frontend runtime env.

Fix:
- Set `VITE_SUPABASE_FUNCTIONS_URL` and redeploy the frontend.

### 3.2 “Failed to load attendees”
Cause:
- `list-attendees` function failing, or wrong `VITE_CONFERENCE_CODE`.

Fix:
- Confirm `VITE_CONFERENCE_CODE` matches the conference code used during registrations.
- Check the Edge Function logs for `list-attendees`.

---

## 4) Registration mirroring failures

### 4.1 Error: “Invalid payload. Expected multipart or JSON with { xsPayload, extended }.”
Cause:
- Deployed `mirror-registration` is older than the frontend (expects JSON only), or vice versa.

Fix:
- Redeploy `mirror-registration` to match the current code in `supabase/functions/mirror-registration/index.ts`.

### 4.2 Headshot not appearing in Preview
Causes:
- Delegate did not grant `photo_consent`
- Delegate did not upload a headshot file
- Storage upload failed at time of registration

Fix:
- Confirm the attendee row has `photo_consent=true` and `headshot_path` present (returned by `list-attendees`).
- Check Edge Function logs for `mirror-registration` storage upload errors.

---

## 5) Verify / Check-in actions fail

### 5.1 Verify error: “There is no user record corresponding to the provided identifier.”
Most common cause:
- XS environment mismatch (frontend created the user in one environment, the function is calling another).

Fix:
- Align **frontend** `VITE_BASE_URL` with Edge Function secret **`BASE_URL`**.
- Confirm `ADMIN_API_KEY` matches that same XS environment.

### 5.2 Check-in not reflecting as Confirmed
Causes:
- `checkin-attendee` function not deployed or failing
- Attendee list not refreshed

Fix:
- Refresh list after check-in.
- Confirm `checkin-attendee` returns `ok: true` and updates `checked_in`.

---

## 6) Exports failing

### 6.1 “Export Failed”
Causes:
- `export-attendees` failing server-side
- Function deployed without required secrets

Fix:
- Check Edge Function logs for `export-attendees`.
- Confirm `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` secrets exist.

---

## 7) Headshot preview fails (organiser)

### 7.1 “Preview Failed”
Causes:
- Attendee has no consent or no headshot path
- `preview-headshot` cannot download from Storage
- `HEADSHOT_BUCKET` mismatch

Fix:
- Confirm `photo_consent=true` and `headshot_path` exists.
- Confirm bucket exists and the object path matches.
- If using a non-default bucket, set `HEADSHOT_BUCKET` secret for functions.

---

## 8) Common configuration pitfalls
- **Wrong conference code**: dashboard appears “empty” because `VITE_CONFERENCE_CODE` does not match stored records.
- **XS environment mismatch**: registration works but verify fails later.
- **Function not redeployed**: code changes locally but Supabase is running old logic.

