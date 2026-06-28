import * as path from "path";
import * as bcrypt from "bcrypt";
import { config } from "dotenv";
import { Client } from "pg";

config({ path: path.join(__dirname, "..", ".env") });

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL ?? "dritonpoliku@gmail.com";
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? "Driton1234";
const COMPANY_NAME = process.env.SEED_COMPANY_NAME ?? "Coffee Shop";
const COMPANY_ADDRESS = process.env.SEED_COMPANY_ADDRESS ?? "Default Address";
const COMPANY_PHONE = process.env.SEED_COMPANY_PHONE ?? "+38970000000";
const COMPANY_CODE = process.env.SEED_COMPANY_CODE;

function generateCompanyCodeCandidate(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

async function generateUniqueCompanyCode(client: Client): Promise<string> {
  for (let attempt = 0; attempt < 50; attempt++) {
    const code = COMPANY_CODE ?? generateCompanyCodeCandidate();
    const existing = await client.query(
      `SELECT id FROM company WHERE code = $1 LIMIT 1`,
      [code]
    );
    if (!existing.rowCount) {
      return code;
    }
    if (COMPANY_CODE) {
      throw new Error(`Company code "${COMPANY_CODE}" is already in use.`);
    }
  }

  throw new Error("Could not generate a unique company code.");
}

async function seedAdmin() {
  const requiredEnv = [
    "POSTGRES_HOST",
    "POSTGRES_USER",
    "POSTGRES_PASSWORD",
    "POSTGRES_DB",
  ] as const;

  for (const key of requiredEnv) {
    if (!process.env[key]) {
      throw new Error(`Missing ${key} in apps/backend/.env`);
    }
  }

  const client = new Client({
    host: process.env.POSTGRES_HOST,
    port: parseInt(process.env.POSTGRES_PORT || "5432", 10),
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    ssl:
      process.env.ENVIRONMENT === "local"
        ? undefined
        : { rejectUnauthorized: false },
  });

  await client.connect();

  try {
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
    const adminCredentials = JSON.stringify({
      email: ADMIN_EMAIL,
      password: hashedPassword,
    });

    const existing = await client.query<{ id: string; code: string }>(
      `SELECT id, code FROM company
       WHERE admin_credentials ->> 'email' = $1
       LIMIT 1`,
      [ADMIN_EMAIL]
    );

    if (existing.rowCount) {
      const company = existing.rows[0];
      await client.query(
        `UPDATE company
         SET admin_credentials = $1::jsonb
         WHERE id = $2`,
        [adminCredentials, company.id]
      );

      console.log("Updated existing admin credentials.");
      console.log(`Company ID: ${company.id}`);
      console.log(`Company code: ${company.code}`);
      console.log(`Admin email: ${ADMIN_EMAIL}`);
      return;
    }

    const code = await generateUniqueCompanyCode(client);
    const inserted = await client.query<{ id: string; code: string }>(
      `INSERT INTO company (name, address, phone, code, admin_credentials, "tableCount")
       VALUES ($1, $2, $3, $4, $5::jsonb, 16)
       RETURNING id, code`,
      [COMPANY_NAME, COMPANY_ADDRESS, COMPANY_PHONE, code, adminCredentials]
    );

    const company = inserted.rows[0];

    console.log("Created company and admin account.");
    console.log(`Company ID: ${company.id}`);
    console.log(`Company code: ${company.code}`);
    console.log(`Admin email: ${ADMIN_EMAIL}`);
    console.log("Log in with email/password on the login screen for admin access.");
  } finally {
    await client.end();
  }
}

seedAdmin().catch((error: unknown) => {
  console.error("Failed to seed admin:", error);
  process.exit(1);
});
