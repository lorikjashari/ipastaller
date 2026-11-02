# Install page (OTA)

A one-page site with an **Install** button that installs an iOS app straight
from Safari — no App Store, no cable. Deploys to Vercel as-is.

```
ios-install/
├─ index.html        landing page + itms-services link
├─ icon.png          app icon shown in the install dialog
├─ HelloIPA.ipa      ← the signed build Vercel serves
├─ api/
│  ├─ config.js      GET /api/config   → title / bundle id / version / ipa path
│  └─ manifest.js    GET /api/manifest → manifest.plist
├─ app/              the iOS app itself (SwiftUI, Xcode project)
└─ .github/
   └─ workflows/build-ipa.yml   builds + signs the ipa on a macOS runner
```

## How it works

1. Safari taps `itms-services://?action=download-manifest&url=<https>/api/manifest`
2. iOS fetches that manifest (a plist listing the `.ipa` URL + bundle id)
3. iOS downloads the `.ipa` and shows the install dialog

`manifest.js` builds the plist per request so the `.ipa` URL is always
absolute and correct for whatever domain it's served from (production,
preview deployments, custom domain).

## 1. Get a signed `.ipa` into the repo root

The app source is in `app/`. Bundle ID: `com.lorikjashari.helloipa`.

**Option A — let GitHub build it (no Mac needed)**

Add four repo secrets (*Settings → Secrets and variables → Actions*):

| Secret | Where to get it |
| --- | --- |
| `APPLE_TEAM_ID` | developer.apple.com → Membership (10 chars) |
| `ASC_KEY_ID` | App Store Connect → Users and Access → Integrations → App Store Connect API |
| `ASC_ISSUER_ID` | same page |
| `ASC_KEY_P8` | contents of the downloaded `AuthKey_XXXX.p8` |

Then *Actions → Build signed IPA → Run workflow*. It archives, exports an
ad-hoc ipa, commits it as `HelloIPA.ipa` and Vercel redeploys on its own.

Requires a paid Apple Developer account, and your iPhone's UDID must be
registered under *Certificates, Identifiers & Profiles → Devices* — ad-hoc
profiles only install on devices listed in the profile.

**Option B — build on a Mac**

```bash
cd app
open HelloIPA.xcodeproj      # set your Team, then Product → Archive
./scripts/build-ipa.sh       # → build/HelloIPA.ipa
cp build/HelloIPA.ipa ..     # repo root
```

Unsigned builds deploy fine but will **fail at install time**. Keep the file
under GitHub's 100 MB limit; a simple app is a few MB.

## 2. Deploy

The repo root **is** the site: framework preset **Other**, no build command.
Import it on vercel.com and hit Deploy (or `npx vercel --prod` from the repo root).

If the page says *"No .ipa uploaded yet"*, the file isn't in the deployment —
push it and Vercel redeploys automatically.

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
| `APP_BUNDLE_ID` | `com.lorikjashari.helloipa` | Must match the built app |
| `APP_VERSION` | `1.0` | `CFBundleVersion` of the app |
| `APP_IPA` | `/HelloIPA.ipa` | Path to the ipa on this site |

## Local preview

`index.html` reads `/api/config`, which only exists on Vercel. Locally:

```bash
npx vercel dev        # runs the real functions
```

Without functions the page still loads and falls back to defaults.
Add `?as=ios` to preview the iPhone state from a desktop browser.
