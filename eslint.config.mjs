import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // The 3D scene is imperative by design: three.js objects are owned and mutated by the R3F frame
  // loop (useFrame), never by React render. The React Compiler's immutability rules don't model
  // that ownership, so they're off for the scene files only.
  {
    files: ["src/world/**/*.{ts,tsx}"],
    rules: {
      "react-hooks/immutability": "off",
      "react-hooks/use-memo": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    ".playwright-mcp/**",
    "playwright-report/**",
    "test-results/**",
  ]),
]);

export default eslintConfig;
