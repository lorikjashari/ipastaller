# Install page (OTA)

A one-page site with an **Install** button that installs an iOS app straight
from Safari — no App Store, no cable. Deploys to Vercel as-is.

```
ios-install/
├─ index.html        landing page + itms-services link
├─ icon.png          app icon shown in the install dialog
├─ HelloIPA.ipa      ← you add this (signed build)
└─ api/
   ├─ config.js      GET /api/config   → title / bundle id / version / ipa path
   └─ manifest.js    GET /api/manifest → manifest.plist
```

## How it works

1. Safari taps `itms-services://?action=download-manifest&url=<https>/api/manifest`
2. iOS fetches that manifest (a plist listing the `.ipa` URL + bundle id)
3. iOS downloads the `.ipa` and shows the install dialog

`manifest.js` builds the plist per request so the `.ipa` URL is always
absolute and correct for whatever domain it's served from (production,
preview deployments, custom domain).

## 1. Add a signed `.ipa`

Drop a **signed** build in the repo root as `HelloIPA.ipa` (or point
`APP_IPA` at another filename):

```
HelloIPA.ipa
```

Build it with Xcode (this repo doesn't contain the app source): open the
app project, set a Team under *Signing & Capabilities*, then
*Product → Archive → Distribute App → Ad Hoc / Enterprise → Export*.
An `.ipa` is just a ZIP — `Payload/<App>.app` — so you can also repackage
one with the script from the companion project (`scripts/make-ipa.py`).

Keep it under GitHub's 100 MB per-file limit; a simple app is a few MB.
Unsigned builds deploy fine but will **fail at install time**.

## 2. Deploy

**Option A — CLI (fastest)**

```bash
cd ios-install
npx vercel --prod
```

**Option B — dashboard**

Import the repo on vercel.com → set **Root Directory** to `ios-install` →
Framework preset **Other** → Deploy.

If the page says *"No .ipa uploaded yet"*, the file isn't in the deployment —
add it, redeploy.

## 3. Install on the iPhone

Open the Vercel URL **in Safari** → tap **Install** → **Install** again.

> ⚠️ It must be Safari. Chrome, Instagram, and in-app browsers cannot hand
> off `itms-services` links.

## Requirements checklist (this is where it usually fails)

- [ ] `.ipa` signed with a **valid provisioning profile** — Ad Hoc, Enterprise,
      or Development with **your iPhone's UDID** in the profile
- [ ] Bundle ID in `api/config.js` matches the app exactly
- [ ] Served over **HTTPS** (Vercel does this automatically)
- [ ] The `.ipa` downloads without auth or redirects to a login page

Unsigned `.ipa` → iOS says *"Cannot connect to server"* / *"Unable to
Install"*. A free Apple ID personal-team build usually can't be installed
this way — use Sideloadly/AltStore (they re-sign on-device) instead.

## Configuration

All optional, set as Vercel env vars and redeploy:

| Variable | Default | Purpose |
| --- | --- | --- |
| `APP_TITLE` | `Hello IPA` | Name in the install dialog |
| `APP_BUNDLE_ID` | `com.example.helloipa` | Must match the built app |
| `APP_VERSION` | `1.0` | `CFBundleVersion` of the app |
| `APP_IPA` | `/HelloIPA.ipa` | Path to the ipa on this site |

## Local preview

`index.html` reads `/api/config`, which only exists on Vercel. Locally:

```bash
npx vercel dev        # runs the real functions
```

Without functions the page still loads and falls back to defaults.
Add `?as=ios` to preview the iPhone state from a desktop browser.
