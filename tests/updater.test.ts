import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";
import { pathToFileURL } from "node:url";

test("updater defaults to the Classic GitHub main branch", async () => {
  const dynamicImport = new Function("specifier", "return import(specifier)") as <T>(
    specifier: string,
  ) => Promise<T>;
  const updater = await dynamicImport<{
    getBranchConfig: () => Record<string, string>;
    getRepositoryUrls: (config: Record<string, string>) => Record<string, string>;
  }>(
    pathToFileURL(
      path.resolve(__dirname, "..", "scripts", "installer", "update.mjs"),
    ).href,
  );
  const config = updater.getBranchConfig();
  const urls = updater.getRepositoryUrls(config);

  assert.deepEqual(config, {
    branch: "main",
    owner: "QuestPilot",
    repo: "Microsoft-Rewards-Bot-Classic",
    host: "github.com",
  });
  assert.equal(
    urls.rawBaseUrl,
    "https://raw.githubusercontent.com/QuestPilot/Microsoft-Rewards-Bot-Classic/main",
  );
  assert.equal(
    urls.packageUrl,
    "https://raw.githubusercontent.com/QuestPilot/Microsoft-Rewards-Bot-Classic/main/package.json",
  );
  assert.equal(
    urls.archiveUrl,
    "https://codeload.github.com/QuestPilot/Microsoft-Rewards-Bot-Classic/zip/refs/heads/main",
  );
});
