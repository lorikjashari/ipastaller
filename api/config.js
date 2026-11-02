// GET /api/config -> JSON describing the app, driven by env vars.
// Shares its defaults with manifest.js so the page and the install
// manifest can never drift apart.

const { resolve } = require("./manifest.js");

module.exports = (req, res) => {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.status(200).send(JSON.stringify(resolve()));
};
