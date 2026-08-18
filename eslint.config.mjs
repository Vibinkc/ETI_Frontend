import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    // Rules SonarQube reports that eslint-config-next does not enable by
    // default. They all pass at zero, so turning them on here only stops the
    // findings coming back - it does not flag anything today.
    //
    // Both plugins ship with eslint-config-next, so nothing new is installed.
    rules: {
      // A bare <button> defaults to type="submit", which silently submits any
      // surrounding form. Only admin-management and login have forms, but the
      // default is a trap worth closing everywhere.
      "react/button-has-type": "error",
      "jsx-a11y/label-has-associated-control": "error",
      "jsx-a11y/no-noninteractive-element-interactions": "error",
      "jsx-a11y/click-events-have-key-events": "error",
      "jsx-a11y/no-static-element-interactions": "error",
      // Catches whitespace between JSX elements whose rendered result is
      // ambiguous - the source looks like a space where none renders.
      "react/jsx-child-element-spacing": "error",
      "no-array-constructor": "error",
    },
  },
]);

export default eslintConfig;
