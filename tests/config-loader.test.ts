import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

const repoRoot = path.resolve(__dirname, "..");
const loaderPath = path.join(repoRoot, "src", "util", "state", "Load.ts");

function withTempProject<T>(files: Record<string, string>, fn: () => T): T {
  const previousCwd = process.cwd();
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "msrb-classic-"));

  try {
    for (const [relativePath, content] of Object.entries(files)) {
      const fullPath = path.join(tempDir, relativePath);
      fs.mkdirSync(path.dirname(fullPath), { recursive: true });
      fs.writeFileSync(fullPath, content, "utf8");
    }

    delete require.cache[require.resolve(loaderPath)];
    process.chdir(tempDir);
    return fn();
  } finally {
    process.chdir(previousCwd);
    delete require.cache[require.resolve(loaderPath)];
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

test("loadConfig accepts nested JSONC config and ignores removed errorReporting", () => {
  withTempProject(
    {
      "src/config.jsonc": `{
        // Classic normalized config
        "baseURL": "https://rewards.bing.com/dashboard",
        "sessionPath": "sessions",
        "errorReporting": { "enabled": true },
        "execution": {
          "parallel": false,
          "runOnZeroPoints": false,
          "clusters": 2,
          "passesPerRun": 2,
        },
        "browser": { "headless": true, "globalTimeout": "45s" },
        "workers": {
          "doDailySet": true,
          "doMorePromotions": true,
          "doPunchCards": true,
          "doDesktopSearch": true,
          "doMobileSearch": false,
          "doDailyCheckIn": false,
          "doReadToEarn": false,
          "doFreeRewards": false,
        },
        "search": {
          "useLocalQueries": true,
          "settings": {
            "useGeoLocaleQueries": true,
            "scrollRandomResults": true,
            "clickRandomResults": false,
            "retryMobileSearchAmount": 3,
            "delay": { "min": "1s", "max": "2s" },
          },
        },
        "proxy": { "proxyGoogleTrends": false, "proxyBingTerms": false },
        "webhook": { "enabled": false, "url": "" },
        "ntfy": { "enabled": false, "url": "", "topic": "rewards" },
      }`,
    },
    () => {
      const { loadConfig } = require(loaderPath);
      const config = loadConfig();

      assert.equal(config.baseURL, "https://rewards.bing.com/dashboard");
      assert.equal(config.clusters, 2);
      assert.equal(config.passesPerRun, 2);
      assert.equal(config.browser.headless, true);
      assert.equal(config.searchOnBingLocalQueries, true);
      assert.equal(config.searchSettings.retryMobileSearchAmount, 3);
      assert.equal("errorReporting" in config, false);
    },
  );
});

test("loadAccounts supports object wrapper and filters disabled accounts", () => {
  withTempProject(
    {
      "src/accounts.jsonc": `{
        "accounts": [
          {
            "enabled": true,
            "email": "one@example.com",
            "password": "password1",
            "proxy": { "proxyAxios": false, "url": "", "port": 0, "username": "", "password": "" }
          },
          {
            "enabled": false,
            "email": "two@example.com",
            "password": "password2"
          }
        ]
      }`,
    },
    () => {
      const { loadAccounts } = require(loaderPath);
      const accounts = loadAccounts();

      assert.equal(accounts.length, 1);
      assert.equal(accounts[0].email, "one@example.com");
      assert.equal(accounts[0].proxy.proxyAxios, false);
    },
  );
});
