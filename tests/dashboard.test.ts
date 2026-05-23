import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

const repoRoot = path.resolve(__dirname, "..");
const serverPath = path.join(repoRoot, "src", "dashboard", "server.ts");

async function waitForJson(url: string): Promise<unknown> {
  let lastError: unknown;

  for (let attempt = 0; attempt < 20; attempt++) {
    try {
      const response = await fetch(url);
      return await response.json();
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  throw lastError;
}

test("dashboard exposes health, status, and accounts endpoints", async () => {
  const previousCwd = process.cwd();
  const previousPort = process.env.DASHBOARD_PORT;
  const previousHost = process.env.DASHBOARD_HOST;
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "msrb-dashboard-"));
  const port = 33000 + Math.floor(Math.random() * 1000);

  try {
    fs.mkdirSync(path.join(tempDir, "src"), { recursive: true });
    fs.writeFileSync(
      path.join(tempDir, "src", "config.jsonc"),
      `{
        "baseURL": "https://rewards.bing.com/dashboard",
        "sessionPath": "sessions",
        "workers": {
          "doDailySet": true,
          "doMorePromotions": true,
          "doPunchCards": true,
          "doDesktopSearch": false,
          "doMobileSearch": false,
          "doDailyCheckIn": false,
          "doReadToEarn": false,
          "doFreeRewards": false
        },
        "webhook": { "enabled": false, "url": "" },
        "ntfy": { "enabled": false, "url": "", "topic": "rewards" }
      }`,
      "utf8",
    );
    fs.writeFileSync(
      path.join(tempDir, "src", "accounts.jsonc"),
      `{
        "accounts": [
          {
            "email": "classic@example.com",
            "password": "password1",
            "proxy": { "proxyAxios": false, "url": "", "port": 0, "username": "", "password": "" }
          }
        ]
      }`,
      "utf8",
    );

    process.chdir(tempDir);
    process.env.DASHBOARD_HOST = "127.0.0.1";
    process.env.DASHBOARD_PORT = String(port);
    delete require.cache[require.resolve(serverPath)];

    const { DashboardServer } = require(serverPath);
    const server = new DashboardServer();
    server.start();

    try {
      const health = (await waitForJson(`http://127.0.0.1:${port}/health`)) as {
        status: string;
      };
      assert.equal(health.status, "ok");

      const status = (await waitForJson(`http://127.0.0.1:${port}/api/status`)) as {
        running: boolean;
      };
      assert.equal(status.running, false);

      const info = (await waitForJson(`http://127.0.0.1:${port}/api/info`)) as {
        project: string;
        repository: string;
      };
      assert.equal(info.project, "Microsoft Rewards Bot Classic");
      assert.equal(
        info.repository,
        "https://github.com/QuestPilot/Microsoft-Rewards-Bot-Classic",
      );

      const accounts = (await waitForJson(`http://127.0.0.1:${port}/api/accounts`)) as Array<{
        email: string;
      }>;
      assert.equal(accounts.length, 1);
      const account = accounts[0];
      assert.ok(account);
      assert.equal(account.email, "classic@example.com");
    } finally {
      server.stop();
    }
  } finally {
    process.chdir(previousCwd);
    if (previousPort === undefined) {
      delete process.env.DASHBOARD_PORT;
    } else {
      process.env.DASHBOARD_PORT = previousPort;
    }
    if (previousHost === undefined) {
      delete process.env.DASHBOARD_HOST;
    } else {
      process.env.DASHBOARD_HOST = previousHost;
    }
    delete require.cache[require.resolve(serverPath)];
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});
