/**
 * Seed mock approved content (and optional variants) for the Content Variant Generator POC.
 * Uses SUPABASE_SERVICE_ROLE_KEY to bypass RLS. Requires at least one user to exist in Auth
 * (sign up via the app first), or set SEED_USER_EMAIL/SEED_USER_PASSWORD to create a test user.
 *
 * Usage: pnpm run seed
 * Env: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (required)
 *      SEED_USER_EMAIL, SEED_USER_PASSWORD (optional – create test user if not provided and no users exist)
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const seedEmail = process.env.SEED_USER_EMAIL ?? "test@example.com";
const seedPassword = process.env.SEED_USER_PASSWORD ?? "test-password-seed";

if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Set them in .env.local or the environment."
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const MOCK_APPROVED_CONTENT = [
  {
    title: "Brand campaign – Q1 awareness",
    body: "Our treatment has been shown to improve outcomes in adults. Always follow your healthcare provider's guidance. This is not medical advice.",
    brand: "Brand A",
    campaign: "Q1 Awareness",
  },
  {
    title: "Patient support program",
    body: "Join our patient support program for resources and tips. Speak to your HCP about whether this program is right for you.",
    brand: "Brand A",
    campaign: "Patient Support",
  },
  {
    title: "HCP education snippet",
    body: "Key efficacy data from the Phase 3 study. For full prescribing information, refer to the label.",
    brand: "Brand B",
    campaign: "HCP Education",
  },
];

async function getOrCreateSeedUser(): Promise<string> {
  const {
    data: { users },
  } = await supabase.auth.admin.listUsers({ perPage: 1 });
  if (users && users.length > 0) {
    return users[0].id;
  }
  const { data: createData, error: createError } = await supabase.auth.admin.createUser({
    email: seedEmail,
    password: seedPassword,
    email_confirm: true,
  });
  if (createError) {
    console.error("Could not create seed user:", createError.message);
    process.exit(1);
  }
  if (!createData.user) {
    console.error("Created user but no user returned.");
    process.exit(1);
  }
  console.log("Created test user:", seedEmail);
  return createData.user.id;
}

async function seed() {
  const userId = await getOrCreateSeedUser();

  for (const row of MOCK_APPROVED_CONTENT) {
    const { data, error } = await supabase
      .from("approved_content")
      .insert({
        user_id: userId,
        title: row.title,
        body: row.body,
        brand: row.brand,
        campaign: row.campaign,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Insert approved_content failed:", error.message);
      process.exit(1);
    }
    console.log("Inserted approved_content:", data?.id, row.title);
  }

  console.log("Seed completed. You can sign in with:", seedEmail, "(password:", seedPassword + ")");
}

seed();
