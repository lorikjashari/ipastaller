// GET /api/manifest -> the OTA manifest.plist that iOS reads when the
// itms-services:// link is tapped.
//
// The .ipa URL inside a manifest MUST be absolute, which is why this is a
// function and not a static file: it fills in the real host per request, so
// it works on localhost, *.vercel.app previews and custom domains alike.
//
// DEFAULTS lives here and is re-used by config.js so the two endpoints can
// never disagree about the bundle id (that bug shipped once already).

const DEFAULTS = {
  title: "Hello IPA",
  bundleId: "com.lorikjashari.helloipa",
  version: "1.0",
  ipa: "/HelloIPA.ipa",
};

const esc = (value) =>
  String(value).replace(
    /[<>&'"]/g,
    (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }[c])
  );

const resolve = () => ({
  title: process.env.APP_TITLE || DEFAULTS.title,
  bundleId: process.env.APP_BUNDLE_ID || DEFAULTS.bundleId,
  version: process.env.APP_VERSION || DEFAULTS.version,
  ipa: process.env.APP_IPA || DEFAULTS.ipa,
});

function handler(req, res) {
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  const proto = (req.headers["x-forwarded-proto"] || "https").split(",")[0].trim();
  const base = `${proto}://${host}`;

  const { title, bundleId, version, ipa } = resolve();
  const ipaUrl = new URL(ipa, base).toString();
  const iconUrl = new URL("/icon.png", base).toString();

  const plist = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>items</key>
	<array>
		<dict>
			<key>assets</key>
			<array>
				<dict>
					<key>kind</key>
					<string>software-package</string>
					<key>url</key>
					<string>${esc(ipaUrl)}</string>
				</dict>
				<dict>
					<key>kind</key>
					<string>full-size-image</string>
					<key>needs-shine</key>
					<false/>
					<key>url</key>
					<string>${esc(iconUrl)}</string>
				</dict>
			</array>
			<key>metadata</key>
			<dict>
				<key>bundle-identifier</key>
				<string>${esc(bundleId)}</string>
				<key>bundle-version</key>
				<string>${esc(version)}</string>
				<key>kind</key>
				<string>software</string>
				<key>title</key>
				<string>${esc(title)}</string>
			</dict>
		</dict>
	</array>
</dict>
</plist>
`;

  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.status(200).send(plist);
}

module.exports = handler;
module.exports.DEFAULTS = DEFAULTS;
module.exports.resolve = resolve;
