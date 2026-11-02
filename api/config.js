// GET /api/config -> JSON describing the app, driven by env vars.
// Keeps index.html and manifest.js in sync with one source of truth.

const DEFAULTS = {
  title: "Hello IPA",
  bundleId: "com.example.helloipa",
  version: "1.0",
  ipa: "/HelloIPA.ipa",
};

module.exports = (req, res) => {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");

  res.status(200).send(
    JSON.stringify({
      title: process.env.APP_TITLE || DEFAULTS.title,
      bundleId: process.env.APP_BUNDLE_ID || DEFAULTS.bundleId,
      version: process.env.APP_VERSION || DEFAULTS.version,
      ipa: process.env.APP_IPA || DEFAULTS.ipa,
    })
  );
};
