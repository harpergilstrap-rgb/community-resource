const assert = require("node:assert/strict");
const { spawn } = require("node:child_process");
const { once } = require("node:events");
const fs = require("node:fs/promises");
const net = require("node:net");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

test("the server serves the credited local photographs", async (t) => {
  const listener = net.createServer();
  await new Promise((resolve, reject) => {
    listener.once("error", reject);
    listener.listen(0, "127.0.0.1", resolve);
  });
  const port = listener.address().port;
  await new Promise((resolve, reject) => listener.close((error) => error ? reject(error) : resolve()));

  const dataDir = await fs.mkdtemp(path.join(os.tmpdir(), "community-images-test-"));
  const server = spawn(process.execPath, [path.join(__dirname, "../server.js")], {
    env: { ...process.env, PORT: String(port), DATA_DIR: dataDir },
    stdio: ["ignore", "pipe", "pipe"],
  });
  t.after(async () => {
    if (server.exitCode === null && server.signalCode === null) {
      server.kill();
      await once(server, "exit");
    }
    await fs.rm(dataDir, { recursive: true, force: true });
  });
  await new Promise((resolve, reject) => {
    server.stdout.on("data", (chunk) => {
      if (chunk.toString().includes("Community guide listening")) resolve();
    });
    server.once("error", reject);
    server.once("exit", (code) => reject(new Error(`Server exited before starting: ${code}`)));
  });

  const photos = [
    "downtown", "dellinger-park", "pine-mountain-view", "city-hall",
    "library", "dellinger-park-activities", "park-pavilion",
  ];
  for (const photo of photos) {
    const response = await fetch(`http://127.0.0.1:${port}/images/${photo}.jpg`);
    assert.equal(response.status, 200, photo);
    assert.equal(response.headers.get("content-type"), "image/jpeg");
    const bytes = new Uint8Array(await response.arrayBuffer());
    assert.deepEqual([...bytes.slice(0, 3)], [0xff, 0xd8, 0xff], photo);
  }
  const missing = await fetch(`http://127.0.0.1:${port}/images/not-listed.jpg`);
  assert.equal(missing.status, 404);
});
