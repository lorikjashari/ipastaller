// GET /api/manifest -> the OTA manifest.plist that iOS reads when the
// itms-services:// link is tapped.
//
// The .ipa URL inside a manifest MUST be absolute, which is why this is a
// function and not a static file: it fills in the real host per request, so
// it works on localhost, *.vercel.app previews and custom domains alike.

const DEFAULTS = {
  title: "Hello IPA",
  bundleId: "com.example.helloipa",
  version: "1.0",
  ipa: "/HelloIPA.ipa",
};

const esc = (value) =>
  String(value).replace(
    /[<>&'"]/g,
    (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }[c])
  );

module.exports = (req, res) => {
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  const proto = (req.headers["x-forwarded-proto"] || "https").split(",")[0].trim();
  const base = `${proto}://${host}`;

  const appTitle = process.env.APP_TITLE || DEFAULTS.title;
  const bundleId = process.env.APP_BUNDLE_ID || DEFAULTS.bundleId;
  const version = process.env.APP_VERSION || DEFAULTS.version;

  const ipaUrl = new URL(process.env.APP_IPA || DEFAULTS.ipa, base).toString();
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
				<string>${esc(appTitle)}</string>
			</dict>
		</dict>
	</array>
</dict>
</plist>
`;

  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.status(200).send(plist);
};
