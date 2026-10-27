import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { runInNewContext } from "node:vm";
import React from "react";

const require = createRequire(import.meta.url);
const { transformSync } = require("next/dist/build/swc");

// Render app components with the real React renderer while replacing framework
// navigation and data access. Tests never contact Supabase or production.
export function loadJsx(url, dependencies = {}) {
  const localRequire = createRequire(url);
  const defaults = {
    "next/link": ({ children, ...props }) => React.createElement("a", props, children),
    "next/image": ({ fill, unoptimized, priority, ...props }) => React.createElement("img", props)
  };
  const { code } = transformSync(readFileSync(url, "utf8"), {
    filename: url.pathname,
    jsc: { parser: { syntax: "ecmascript", jsx: true }, transform: { react: { runtime: "automatic" } } },
    module: { type: "commonjs" }
  });
  const exports = {};
  runInNewContext(code, {
    exports,
    URL,
    require: (name) => {
      if (Object.hasOwn(dependencies, name)) return dependencies[name];
      if (Object.hasOwn(defaults, name)) return defaults[name];
      return localRequire(name);
    }
  });
  return exports;
}
