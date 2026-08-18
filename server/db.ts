import { neon } from "@neondatabase/serverless";

// Default fallback to user's provided Neon database connection string (with connection pooler)
const DEFAULT_DATABASE_URL =
  "postgresql://neondb_owner:npg_aoh9jxVFus1r@ep-morning-hill-axdgqp5n-pooler.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require";

function isValidPostgresUrl(url: string | undefined): boolean {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim();
  if (!trimmed.startsWith("postgresql://") && !trimmed.startsWith("postgres://")) return false;
  // If it still contains template placeholders like <user>, <password>, <endpoint_hostname>
  if (trimmed.includes("<") || trimmed.includes(">") || trimmed.includes("endpoint_hostname")) {
    return false;
  }
  try {
    new URL(trimmed);
    return true;
  } catch {
    return false;
  }
}

export function getDatabaseUrl(): string {
  const envUrl = process.env.DATABASE_URL;
  if (isValidPostgresUrl(envUrl)) {
    return envUrl!.trim();
  }
  return DEFAULT_DATABASE_URL;
}

let isInitialized = false;

export function getSqlClient() {
  const dbUrl = getDatabaseUrl();
  return neon(dbUrl);
}

/**
 * Automatically create tables in Neon PostgreSQL if they don't exist
 */
export async function initDatabaseSchema() {
  if (isInitialized) return;
  const sql = getSqlClient();

  try {
    // 1. Apps Table
    await sql`
      CREATE TABLE IF NOT EXISTS astro_apps (
        id TEXT PRIMARY KEY,
        track_id BIGINT,
        name TEXT NOT NULL,
        developer TEXT NOT NULL,
        category TEXT NOT NULL,
        icon_url TEXT,
        bundle_id TEXT,
        platform TEXT DEFAULT 'iOS',
        country TEXT DEFAULT 'us',
        is_temporary BOOLEAN DEFAULT false,
        metadata JSONB DEFAULT '{}'::jsonb,
        average_user_rating NUMERIC DEFAULT 0,
        user_rating_count BIGINT DEFAULT 0,
        competitors JSONB DEFAULT '[]'::jsonb,
        alert_settings JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    // 2. Keywords Table
    await sql`
      CREATE TABLE IF NOT EXISTS astro_keywords (
        id TEXT PRIMARY KEY,
        app_id TEXT REFERENCES astro_apps(id) ON DELETE CASCADE,
        keyword TEXT NOT NULL,
        current_rank INT,
        previous_rank INT,
        popularity INT DEFAULT 50,
        difficulty INT DEFAULT 50,
        estimated_installs INT DEFAULT 0,
        tags JSONB DEFAULT '[]'::jsonb,
        notes TEXT,
        translation_en TEXT,
        history JSONB DEFAULT '[]'::jsonb,
        last_updated TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    // 3. Alerts Table
    await sql`
      CREATE TABLE IF NOT EXISTS astro_alerts (
        id TEXT PRIMARY KEY,
        app_id TEXT,
        app_name TEXT,
        keyword_id TEXT,
        keyword_name TEXT,
        previous_rank INT,
        current_rank INT,
        type TEXT NOT NULL,
        message TEXT NOT NULL,
        threshold_value INT DEFAULT 10,
        timestamp TIMESTAMPTZ DEFAULT NOW(),
        read BOOLEAN DEFAULT false,
        severity TEXT DEFAULT 'medium'
      );
    `;

    // Create index on keyword app_id
    await sql`
      CREATE INDEX IF NOT EXISTS idx_astro_keywords_app_id ON astro_keywords(app_id);
    `;

    isInitialized = true;
    console.log("[Neon Database] Successfully initialized schema on Neon PostgreSQL");
  } catch (err: any) {
    console.error("[Neon Database] Schema initialization error:", err.message);
    throw err;
  }
}
