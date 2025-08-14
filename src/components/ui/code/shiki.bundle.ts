/* Generate by @shikijs/codegen */
import type {
  DynamicImportLanguageRegistration,
  DynamicImportThemeRegistration,
  HighlighterGeneric,
} from "@shikijs/types";
import {
  createSingletonShorthands,
  createdBundledHighlighter,
} from "@shikijs/core";
import { createJavaScriptRegexEngine } from "@shikijs/engine-javascript";

type BundledLanguage =
  | "typescript"
  | "ts"
  | "javascript"
  | "js"
  | "python"
  | "py"
  | "java"
  | "c"
  | "csharp"
  | "c#"
  | "cs"
  | "cpp"
  | "c++"
  | "go"
  | "rust"
  | "rs"
  | "php"
  | "ruby"
  | "rb"
  | "swift"
  | "kotlin"
  | "kt"
  | "kts"
  | "dart"
  | "scala"
  | "r"
  | "matlab"
  | "sql"
  | "html"
  | "css"
  | "vue"
  | "jsx"
  | "tsx"
  | "json"
  | "yaml"
  | "yml"
  | "markdown"
  | "md"
  | "shellscript"
  | "bash"
  | "sh"
  | "shell"
  | "zsh"
  | "powershell"
  | "ps"
  | "ps1"
  | "docker"
  | "dockerfile"
  | "terraform"
  | "tf"
  | "tfvars"
  | "graphql"
  | "gql"
  | "solidity"
  | "svelte"
  | "astro";
type BundledTheme = "github-light" | "github-dark";
type Highlighter = HighlighterGeneric<BundledLanguage, BundledTheme>;

const bundledLanguages = {
  typescript: () => import("@shikijs/langs/typescript"),
  ts: () => import("@shikijs/langs/typescript"),
  javascript: () => import("@shikijs/langs/javascript"),
  js: () => import("@shikijs/langs/javascript"),
  python: () => import("@shikijs/langs/python"),
  py: () => import("@shikijs/langs/python"),
  java: () => import("@shikijs/langs/java"),
  c: () => import("@shikijs/langs/c"),
  csharp: () => import("@shikijs/langs/csharp"),
  "c#": () => import("@shikijs/langs/csharp"),
  cs: () => import("@shikijs/langs/csharp"),
  cpp: () => import("@shikijs/langs/cpp"),
  "c++": () => import("@shikijs/langs/cpp"),
  go: () => import("@shikijs/langs/go"),
  rust: () => import("@shikijs/langs/rust"),
  rs: () => import("@shikijs/langs/rust"),
  php: () => import("@shikijs/langs/php"),
  ruby: () => import("@shikijs/langs/ruby"),
  rb: () => import("@shikijs/langs/ruby"),
  swift: () => import("@shikijs/langs/swift"),
  kotlin: () => import("@shikijs/langs/kotlin"),
  kt: () => import("@shikijs/langs/kotlin"),
  kts: () => import("@shikijs/langs/kotlin"),
  dart: () => import("@shikijs/langs/dart"),
  scala: () => import("@shikijs/langs/scala"),
  r: () => import("@shikijs/langs/r"),
  matlab: () => import("@shikijs/langs/matlab"),
  sql: () => import("@shikijs/langs/sql"),
  html: () => import("@shikijs/langs/html"),
  css: () => import("@shikijs/langs/css"),
  vue: () => import("@shikijs/langs/vue"),
  jsx: () => import("@shikijs/langs/jsx"),
  tsx: () => import("@shikijs/langs/tsx"),
  json: () => import("@shikijs/langs/json"),
  yaml: () => import("@shikijs/langs/yaml"),
  yml: () => import("@shikijs/langs/yaml"),
  markdown: () => import("@shikijs/langs/markdown"),
  md: () => import("@shikijs/langs/markdown"),
  shellscript: () => import("@shikijs/langs/shellscript"),
  bash: () => import("@shikijs/langs/shellscript"),
  sh: () => import("@shikijs/langs/shellscript"),
  shell: () => import("@shikijs/langs/shellscript"),
  zsh: () => import("@shikijs/langs/shellscript"),
  powershell: () => import("@shikijs/langs/powershell"),
  ps: () => import("@shikijs/langs/powershell"),
  ps1: () => import("@shikijs/langs/powershell"),
  docker: () => import("@shikijs/langs/docker"),
  dockerfile: () => import("@shikijs/langs/docker"),
  terraform: () => import("@shikijs/langs/terraform"),
  tf: () => import("@shikijs/langs/terraform"),
  tfvars: () => import("@shikijs/langs/terraform"),
  graphql: () => import("@shikijs/langs/graphql"),
  gql: () => import("@shikijs/langs/graphql"),
  solidity: () => import("@shikijs/langs/solidity"),
  svelte: () => import("@shikijs/langs/svelte"),
  astro: () => import("@shikijs/langs/astro"),
} as Record<BundledLanguage, DynamicImportLanguageRegistration>;

const bundledThemes = {
  "github-light": () => import("@shikijs/themes/github-light"),
  "github-dark": () => import("@shikijs/themes/github-dark"),
} as Record<BundledTheme, DynamicImportThemeRegistration>;

const createHighlighter = /* @__PURE__ */ createdBundledHighlighter<
  BundledLanguage,
  BundledTheme
>({
  langs: bundledLanguages,
  themes: bundledThemes,
  engine: () => createJavaScriptRegexEngine(),
});

const {
  codeToHtml,
  codeToHast,
  codeToTokensBase,
  codeToTokens,
  codeToTokensWithThemes,
  getSingletonHighlighter,
  getLastGrammarState,
} = /* @__PURE__ */ createSingletonShorthands<BundledLanguage, BundledTheme>(
  createHighlighter,
);

export {
  bundledLanguages,
  bundledThemes,
  codeToHast,
  codeToHtml,
  codeToTokens,
  codeToTokensBase,
  codeToTokensWithThemes,
  createHighlighter,
  getLastGrammarState,
  getSingletonHighlighter,
};
export type { BundledLanguage, BundledTheme, Highlighter };
