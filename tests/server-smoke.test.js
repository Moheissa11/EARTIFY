"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { spawn } = require("node:child_process");
const net = require("node:net");
const os = require("node:os");
const path = require("node:path");
const fs = require("node:fs");

async function freePort() {
  const server = net.createServer();
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  const port = server.address().port;
  await new Promise(resolve => server.close(resolve));
  return port;
}

test("HTTP smoke: health, account lifecycle, and static path traversal protection", async t => {
  const port = await freePort();
  const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), "eartify-server-test-"));
  const child = spawn(process.execPath, [path.join(__dirname, "..", "server.js")], {
    env: { ...process.env, PORT: String(port), DATA_DIR: dataDir, MAX_ACCOUNTS: "5", NODE_ENV: "test" },
    stdio: ["ignore", "pipe", "pipe"]
  });
  t.after(() => { child.kill("SIGTERM"); fs.rmSync(dataDir, { recursive: true, force: true }); });
  const base = `http://127.0.0.1:${port}`;
  let ready = false;
  for (let attempt = 0; attempt < 60; attempt++) {
    if (child.exitCode !== null) throw new Error("EARTIFY server exited during startup");
    try { const response = await fetch(`${base}/api/health`); if (response.ok) { ready = true; break; } }
    catch { await new Promise(resolve => setTimeout(resolve, 100)); }
  }
  assert.equal(ready, true, "server should become ready");

  const health = await (await fetch(`${base}/api/health`)).json();
  assert.equal(health.ok, true);
  assert.equal(health.accountLimit, 5);
  assert.equal((await fetch(base)).status, 200);

  const signup = await fetch(`${base}/api/auth/signup`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Smoke Tester", email: "smoke@example.com", password: "StrongPass123" })
  });
  assert.equal(signup.status, 201);
  const cookie = signup.headers.get("set-cookie").split(";")[0];
  assert.ok(cookie.startsWith("eartify_session="));
  const me = await (await fetch(`${base}/api/auth/me`, { headers: { Cookie: cookie } })).json();
  assert.equal(me.user.email, "smoke@example.com");

  const logout = await fetch(`${base}/api/auth/logout`, { method: "POST", headers: { Cookie: cookie } });
  assert.equal(logout.status, 200);
  const afterLogout = await (await fetch(`${base}/api/auth/me`, { headers: { Cookie: cookie } })).json();
  assert.equal(afterLogout.user, null);

  const login = await fetch(`${base}/api/auth/login`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "smoke@example.com", password: "StrongPass123" })
  });
  assert.equal(login.status, 200);
  const loginCookie = login.headers.get("set-cookie").split(";")[0];
  const loggedIn = await (await fetch(`${base}/api/auth/me`, { headers: { Cookie: loginCookie } })).json();
  assert.equal(loggedIn.user.name, "Smoke Tester");

  const traversal = await fetch(`${base}/%2e%2e%2fserver.js`);
  assert.equal(traversal.status, 403);
});
