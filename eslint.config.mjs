import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [
  { ignores: [".next/**", "out/**", "build/**", "next-env.d.ts"] },
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    // package.json is "type": "commonjs", so require() is the correct syntax in
    // plain .js scripts — the TS rule flagging it there is a false positive.
    files: ["**/*.js", "**/*.cjs"],
    rules: { "@typescript-eslint/no-require-imports": "off" },
  },
];

export default eslintConfig;
