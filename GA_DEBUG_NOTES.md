# GA4 Debug Notes

This note documents what was wrong with Google Analytics on this project, how it was fixed, and how to verify it quickly next time.

## Property

- GA4 Measurement ID: `G-SXS8C877Y1`
- Live domain tested: `https://joegqabiinvestment.co.za`

## What the setup does

The app uses:

- `src/analytics.ts` for GA initialization, consent updates, and enable/disable logic
- `src/App.tsx` to:
  - read stored analytics consent
  - show the consent banner
  - initialize GA when consent is granted
  - disable GA on admin pages

GA is only supposed to run when all of these are true:

- `import.meta.env.PROD === true`
- `VITE_GA_ENABLED === "true"`
- `VITE_GA_MEASUREMENT_ID` is set
- current hostname is in `VITE_GA_ALLOWED_HOSTS`
- consent is granted

## Environment variables used

Relevant production env vars:

```env
VITE_GA_ENABLED=true
VITE_GA_MEASUREMENT_ID=G-SXS8C877Y1
VITE_GA_ALLOWED_HOSTS=localhost,joegqabiinvestment.co.za,www.joegqabiinvestment.co.za
```

Notes:

- `localhost` was added for local production preview testing.
- The real production hosts are:
  - `joegqabiinvestment.co.za`
  - `www.joegqabiinvestment.co.za`

## Symptoms we saw

On both local preview and then the live site:

- `gtag.js` loaded successfully
- `window.gtag` existed
- `dataLayer` contained `js`, `config`, and later `consent update` / `event`
- but:
  - no visible `collect` / `g/collect` requests at first
  - no `_ga` cookie in some cases
  - `gtag('get', measurementId, 'client_id', ...)` did not resolve

That meant the GA runtime was loading, but the measurement client was not completing initialization.

## Root cause

The custom `gtag` shim in `src/analytics.ts` was slightly wrong.

It used to do this:

```ts
window.gtag =
  window.gtag ||
  function gtag(...args: unknown[]) {
    window.dataLayer.push(args);
  };
```

That pushes a normal array into `dataLayer`.

Google's recommended snippet expects this shape instead:

```ts
window.gtag =
  window.gtag ||
  function gtag() {
    window.dataLayer.push(arguments);
  };
```

That pushes the raw `arguments` object.

This difference was enough to produce a very confusing failure mode:

- commands looked like they were reaching `dataLayer`
- script loaded
- consent updated
- config seemed to run
- but GA never completed client initialization

## Secondary issue fixed

We also found a timing problem.

Earlier, `gtag('config', ...)` could run before the external `gtag.js` script had fully loaded.

To make initialization deterministic, `src/analytics.ts` was updated to:

1. append the GA script if needed
2. wait for script load
3. apply consent
4. call:
   - `gtag('js', new Date())`
   - `gtag('config', measurementId, { send_page_view: true })`

## Current working behavior

After the fixes, the live site now:

- loads `gtag.js`
- applies consent
- runs config after script load
- resolves `client_id`
- sends a real GA request

Verified by:

- console showing `client-id-callback`
- Network showing `collect?...tid=G-SXS8C877Y1`
- HTTP status `204`

## Temporary debug instrumentation

Debug logging was intentionally left in place.

Current `src/analytics.ts` logs:

- `init-blocked`
- `init-start`
- `script-appended`
- `script-loaded`
- `script-error`
- `config-called-after-load`
- `consent-updated`
- `set-disabled`
- `client-id-callback`
- `client-id-timeout`

These logs are useful while iterating on analytics behavior.

## Fast verification checklist for next time

When deploying GA changes, test in this order:

1. Open the live site.
2. Open DevTools Console and Network.
3. Hard refresh.
4. Click `Accept` on the cookie banner.
5. Look for `[GA DEBUG]` messages in Console.
6. In Network, filter by `collect`.

Success indicators:

- Console contains `client-id-callback`
- Network contains a request like:
  - `collect?...tid=G-SXS8C877Y1`
- status is `204`

## Useful console commands

Check stored consent:

```js
localStorage.getItem('jogeda_analytics_consent')
```

Check whether GA is available:

```js
typeof window.gtag
```

Inspect recent data layer entries:

```js
window.dataLayer?.slice(-10)
```

Ask GA for client id:

```js
window.gtag('get', 'G-SXS8C877Y1', 'client_id', (cid) => console.log('client_id:', cid))
```

Manual consent update:

```js
window.gtag('consent', 'update', {
  analytics_storage: 'granted',
  ad_storage: 'denied'
})
```

Manual test event:

```js
window.gtag('event', 'live_manual_test', { debug_mode: true })
```

Manual reachability test:

```js
fetch('https://www.google-analytics.com/g/collect', { mode: 'no-cors' })
```

## How to read failures quickly

If you see:

- `init-blocked`
  - GA gate failed: env, prod mode, or host allowlist

- `script-error`
  - `gtag.js` failed to load

- `script-loaded` but no `config-called-after-load`
  - app logic failed before config

- `config-called-after-load` but `client-id-timeout`
  - GA runtime still not becoming active
  - first check the `gtag` shim and request shape

- `client-id-callback` but no visible request
  - likely Network filtering issue

## Key lesson

When implementing a custom GA bootstrap, match Google's snippet behavior exactly.

This especially matters for:

- the `gtag` shim
- `dataLayer` command shape
- load order
- consent timing

Even small deviations can make GA appear half-working while never actually sending data.
