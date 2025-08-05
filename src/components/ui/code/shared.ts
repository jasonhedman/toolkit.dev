import { Fragment } from "react";
import { jsx, jsxs } from "react/jsx-runtime";

import { toJsxRuntime } from "hast-util-to-jsx-runtime";

import { codeToHast } from "./shiki.bundle";

import type { JSX } from "react";
import type { BundledLanguage } from "./shiki.bundle.ts";

export async function highlight(code: string, lang: BundledLanguage) {
  const out = await codeToHast(code, {
    lang,
    themes: {
      light: "github-light",
      dark: "github-dark",
    },
  });

  return toJsxRuntime(out, {
    Fragment,
    jsx,
    jsxs,
  }) as JSX.Element;
}
