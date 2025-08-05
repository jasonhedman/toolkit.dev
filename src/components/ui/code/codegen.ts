import { codegen } from "shiki-codegen";

import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { code } = await codegen({
  langs: [
    "typescript",
    "javascript",
    "python",
    "java",
    "c",
    "csharp",
    "cpp",
    "go",
    "rust",
    "php",
    "ruby",
    "swift",
    "kotlin",
    "dart",
    "scala",
    "r",
    "matlab",
    "sql",
    "html",
    "css",
    "vue",
    "jsx",
    "tsx",
    "json",
    "yaml",
    "markdown",
    "bash",
    "powershell",
    "docker",
    "terraform",
    "graphql",
    "solidity",
    "svelte",
    "astro",
  ],
  themes: ["github-light", "github-dark"],
  engine: "javascript",
  typescript: true,
});

const outputPath = path.join(__dirname, "shiki.bundle.ts");
fs.writeFileSync(outputPath, code);
