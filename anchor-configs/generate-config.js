#!/usr/bin/env node
/**
 * Interactive generator for Anchor Platform docker-compose.yml + .env +
 * config files (assets.yaml, clients.yaml, stellar.toml).
 *
 * This asks a handful of questions and fills in the templates in
 * ./templates/ so a first-time integrator gets a runnable stack instead of
 * having to cross-reference the Anchor Platform docs for every env var.
 *
 * NOTE: The env var names and config file shapes in templates/* are based on
 * the Anchor Platform quick-run (dev.env / config/) at the time this was
 * written. Anchor Platform's config schema changes between versions —
 * verify against https://developers.stellar.org/docs/platforms/anchor-platform
 * before relying on generated output in production. This is exactly the kind
 * of drift a `good-first-issue` here could keep in sync.
 */
const fs = require("fs");
const path = require("path");
const prompts = require("prompts");

const OUT_DIR = path.join(__dirname, "output");
const TEMPLATE_DIR = path.join(__dirname, "templates");

const NETWORK_DEFAULTS = {
  TESTNET: {
    rpcUrl: "https://soroban-testnet.stellar.org",
    passphrase: "Test SDF Network ; September 2015",
  },
  PUBNET: {
    rpcUrl: "https://soroban.stellar.org",
    passphrase: "Public Global Stellar Network ; September 2015",
  },
};

function randomSecret(length) {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let out = "";
  for (let i = 0; i < length; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

function isStellarPublicKey(value) {
  return value.startsWith("G") && value.length === 56;
}

function render(templateFile, replacements) {
  const content = fs.readFileSync(path.join(TEMPLATE_DIR, templateFile), "utf8");
  let out = content;
  for (const [key, value] of Object.entries(replacements)) {
    out = out.split(key).join(value);
  }
  return out;
}

async function main() {
  const answers = await prompts([
    {
      type: "text",
      name: "homeDomain",
      message: "Home domain (e.g. anchor.example.com)",
    },
    {
      type: "select",
      name: "network",
      message: "Stellar network",
      choices: [
        { title: "Testnet", value: "TESTNET" },
        { title: "Pubnet (mainnet)", value: "PUBNET" },
      ],
    },
    {
      type: "multiselect",
      name: "seps",
      message: "Which SEPs do you need enabled?",
      choices: [
        { title: "SEP-10 (Web Auth)", value: "sep10", selected: true },
        { title: "SEP-12 (KYC API)", value: "sep12" },
        { title: "SEP-24 (Hosted deposit/withdrawal)", value: "sep24" },
        { title: "SEP-31 (Cross-border payments)", value: "sep31" },
        { title: "SEP-38 (Quotes)", value: "sep38" },
      ],
    },
    {
      type: "text",
      name: "assetCode",
      message: "Primary asset code (e.g. USDC)",
      initial: "USDC",
    },
    {
      type: "text",
      name: "assetIssuer",
      message: "Asset issuer public key (G... 56 chars)",
    },
    {
      type: "number",
      name: "decimals",
      message: "Asset decimals (6 for USDC, 7 for XLM)",
      initial: 7,
      min: 0,
      max: 18,
    },
  ]);

  if (!answers.homeDomain) {
    console.error("Error: home domain is required.");
    process.exit(1);
  }
  if (!/^[a-zA-Z0-9]{1,12}$/.test(answers.assetCode)) {
    console.error("Error: asset code must be 1-12 alphanumeric characters.");
    process.exit(1);
  }
  if (!isStellarPublicKey(answers.assetIssuer)) {
    console.error(
      "Error: asset issuer must be a Stellar public key (starts with G, 56 chars)."
    );
    process.exit(1);
  }
  if (!answers.seps || answers.seps.length === 0) {
    console.error("Error: at least one SEP must be selected.");
    process.exit(1);
  }

  const seps = new Set(answers.seps);
  const sep10 = seps.has("sep10");
  const sep12 = seps.has("sep12");
  const sep24 = seps.has("sep24");
  const sep31 = seps.has("sep31");
  const sep38 = seps.has("sep38");
  const network = NETWORK_DEFAULTS[answers.network];

  const dbPassword = randomSecret(14);
  const sep10JwtSecret = randomSecret(32);

  const replacements = {
    "{{HOME_DOMAIN}}": answers.homeDomain,
    "{{RPC_URL}}": network.rpcUrl,
    "{{NETWORK_PASSPHRASE}}": network.passphrase,
    "{{SEP10_ENABLED}}": String(sep10),
    "{{SEP12_ENABLED}}": String(sep12),
    "{{SEP24_ENABLED}}": String(sep24),
    "{{SEP31_ENABLED}}": String(sep31),
    "{{SEP38_ENABLED}}": String(sep38),
    "{{SEP10_SIGNING_SEED}}": "REPLACE_WITH_A_REAL_SEP10_SIGNING_SEED",
    "{{SEP10_JWT_SECRET}}": sep10JwtSecret,
    "{{SEP10_SIGNING_PUBLIC_KEY}}":
      "REPLACE_WITH_PUBLIC_KEY_OF_SEP10_SIGNING_SEED",
    "{{ASSET_CODE}}": answers.assetCode,
    "{{ASSET_ISSUER}}": answers.assetIssuer,
    "{{DISTRIBUTION_ACCOUNT}}": "REPLACE_WITH_DISTRIBUTION_ACCOUNT",
    "{{SIGNIFICANT_DECIMALS}}": String(answers.decimals),
    "{{DB_PASSWORD}}": dbPassword,
    "{{SEP24_UI_SERVICE}}": sep24
      ? "  sep24-reference-ui:\n    image: stellar/sep24-reference-ui\n    ports:\n      - \"3000:3000\"\n"
      : "",
  };

  fs.mkdirSync(OUT_DIR, { recursive: true });

  for (const [templateFile, outFile] of [
    ["docker-compose.template.yml", "docker-compose.yml"],
    ["env.template", ".env"],
    ["config/assets.yaml.template", "config/assets.yaml"],
    ["config/clients.yaml.template", "config/clients.yaml"],
    ["config/stellar.toml.template", "config/stellar.toml"],
  ]) {
    const content = render(templateFile, replacements);
    const outPath = path.join(OUT_DIR, outFile);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, content);
  }

  console.log(`\nGenerated config in ${OUT_DIR}/`);
  console.log(
    "IMPORTANT before running `docker compose up`:\n" +
      "  1. Replace SECRET_SEP10_SIGNING_SEED in .env with a real secret seed.\n" +
      "  2. Put the public key of that seed in config/stellar.toml (SIGNING_KEY):\n" +
      "       stellar keys generate sep10 --seed <your_seed>\n" +
      "       stellar keys public-key sep10\n" +
      "  3. Replace the distribution account in config/assets.yaml before\n" +
      "     accepting deposits.\n" +
      "Verify env var names against the current Anchor Platform docs before deploying."
  );
}

if (require.main === module) {
  main();
}

module.exports = { main };
