import { createRequire } from "node:module";

// Next.js replaces this marker in server bundles. Keep the real registry and
// providers while allowing the standalone Node tests to load that server code.
const require = createRequire(import.meta.url);
const Module = require("node:module");
const load = Module._load;
Module._load = function (name, ...args) {
  return name === "server-only" || name.endsWith("/server-only/index.js")
    ? {}
    : load.call(this, name, ...args);
};
