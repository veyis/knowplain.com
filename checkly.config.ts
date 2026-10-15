import { defineConfig } from "checkly";
import { Frequency } from "checkly/constructs";

export default defineConfig({
  projectName: "knowplain.com",
  logicalId: "knowplain-com",
  repoUrl: "https://github.com/veyis/knowplain.com",
  checks: {
    locations: ["us-east-1"],
    tags: ["production", "tier3"],
    checkMatch: "__checks__/**/*.check.ts",
    ignoreDirectoriesMatch: ["node_modules/**"],
    playwrightConfig: {
      use: { baseURL: "https://knowplain.com" },
    },
    browserChecks: {
      frequency: Frequency.EVERY_12H,
      testMatch: "__checks__/**/*.spec.ts",
    },
  },
  cli: {
    runLocation: "us-east-1",
  },
});
