"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const prompts = require("prompts");
const yaml = require("js-yaml");

const { main } = require("../generate-config.js");

const OUT = path.join(__dirname, "..", "output");
const TEST_ISSUER = "G" + "A".repeat(55); // valid 56-char test address

function read(relativePath) {
  return fs.readFileSync(path.join(OUT, relativePath), "utf8");
}

function cleanOutput() {
  fs.rmSync(OUT, { recursive: true, force: true });
}

// The generated files must be syntactically valid YAML/TOML — a reviewer
// would spot a broken docker-compose.yml immediately.
function assertYamlValid(fileName) {
  assert.doesNotThrow(() => {
    const doc = yaml.load(read(fileName));
    assert.ok(doc && typeof doc === "object");
    return doc;
  }, `${fileName} must parse as valid YAML`);
}

test("generates a working testnet stack with SEP-24", async () => {
  cleanOutput();
  prompts.inject([
    "anchor.example.com", // homeDomain
    "TESTNET", // network
    ["sep10", "sep24"], // seps
    "USDC", // assetCode
    TEST_ISSUER, // assetIssuer
    6, // decimals
  ]);
  await main();

  assertYamlValid("docker-compose.yml");
  assertYamlValid("config/assets.yaml");
  assertYamlValid("config/clients.yaml");

  const composeDoc = yaml.load(read("docker-compose.yml"));
  assert.deepEqual(
    Object.keys(composeDoc.services).sort(),
    ["anchor-platform", "db", "sep24-reference-ui"].sort()
  );
  assert.equal(
    composeDoc.services["anchor-platform"].depends_on.db.condition,
    "service_healthy"
  );

  const compose = read("docker-compose.yml");
  assert.match(compose, /image: stellar\/anchor-platform:latest/);
  assert.match(compose, /command: --sep-server --platform-server/);
  assert.match(compose, /- \.\/config:\/config/);
  assert.match(compose, /env_file:\n\s+- \.env/);
  assert.match(compose, /image: postgres:15\.2-alpine/);
  assert.match(compose, /sep24-reference-ui/);
  assert.match(compose, /"3000:3000"/);

  const env = read(".env");
  assert.match(env, /STELLAR_NETWORK_TYPE=rpc/);
  assert.match(env, /STELLAR_NETWORK_RPC_URL=https:\/\/soroban-testnet\.stellar\.org/);
  assert.match(env, /SEP10_ENABLED=true/);
  assert.match(env, /SEP24_ENABLED=true/);
  assert.match(env, /SEP31_ENABLED=false/);
  assert.match(env, /SEP38_ENABLED=false/);
  assert.match(env, /SEP10_WEB_AUTH_DOMAIN=anchor\.example\.com/);
  assert.match(
    env,
    /SECRET_SEP10_SIGNING_SEED=REPLACE_WITH_A_REAL_SEP10_SIGNING_SEED/
  );
  assert.match(env, /SECRET_SEP10_JWT_SECRET=\w+/);
  assert.match(env, /DATA_TYPE=postgres/);
  assert.match(env, /DATA_SERVER=db:5432/);
  assert.match(env, /DATA_FLYWAY_ENABLED=true/);
  assert.match(env, /ASSETS_TYPE=file/);
  assert.match(env, /ASSETS_VALUE=\/config\/assets\.yaml/);
  assert.match(env, /SECRET_DATA_PASSWORD=[a-z0-9]{14}/);

  const assets = read("config/assets.yaml");
  assert.match(assets, /id: stellar:USDC:[GA]+/);
  assert.match(assets, /significant_decimals: 6/);
  assert.match(assets, /sep24:\n\s+enabled: true/);

  const toml = read("config/stellar.toml");
  assert.match(toml, /NETWORK_PASSPHRASE = "Test SDF Network ; September 2015"/);
  assert.match(toml, /WEB_AUTH_ENDPOINT = "http:\/\/anchor\.example\.com:8080\/auth"/);

  assert.match(read("config/clients.yaml"), /stellar-demo-wallet/);
});

test("omits SEP-24 UI service when SEP-24 is not selected", async () => {
  cleanOutput();
  prompts.inject([
    "anchor.example.com",
    "PUBNET",
    ["sep10", "sep31"],
    "USDC",
    TEST_ISSUER,
    6,
  ]);
  await main();

  assertYamlValid("docker-compose.yml");
  const composeDoc = yaml.load(read("docker-compose.yml"));
  assert.deepEqual(
    Object.keys(composeDoc.services).sort(),
    ["anchor-platform", "db"].sort()
  );

  assert.doesNotMatch(read("docker-compose.yml"), /sep24-reference-ui/);
  assert.match(read(".env"), /SEP24_ENABLED=false/);
  assert.match(read(".env"), /SEP31_ENABLED=true/);
  assert.match(
    read(".env"),
    /STELLAR_NETWORK_RPC_URL=https:\/\/soroban\.stellar\.org/
  );
  assert.match(read("config/stellar.toml"), /Public Global Stellar Network/);
  assert.match(read("config/assets.yaml"), /sep24:\n\s+enabled: false/);
});

test("rejects a malformed asset issuer", async () => {
  cleanOutput();
  prompts.inject([
    "anchor.example.com",
    "TESTNET",
    ["sep10"],
    "USDC",
    "not-a-key",
    6,
  ]);

  const origExit = process.exit;
  process.exit = () => {
    throw new Error("process.exit called");
  };
  await assert.rejects(main(), /process.exit called/);
  process.exit = origExit;

  assert.equal(fs.existsSync(path.join(OUT, ".env")), false);
});

test("rejects an empty SEP selection", async () => {
  cleanOutput();
  prompts.inject(["anchor.example.com", "TESTNET", [], "USDC", TEST_ISSUER, 6]);

  const origExit = process.exit;
  process.exit = () => {
    throw new Error("process.exit called");
  };
  await assert.rejects(main(), /process.exit called/);
  process.exit = origExit;

  assert.equal(fs.existsSync(path.join(OUT, ".env")), false);
});
