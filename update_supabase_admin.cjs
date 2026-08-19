const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Supabase credentials missing from .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("Updating admin_config table in Supabase...");
  
  // Try to delete existing row or update it
  // Since we only have one admin config row, let's delete all and insert a fresh one, or upsert it.
  const username = "Radha";
  const password = "$2b$12$F8OdXgtzkwJS7kFuD7Lv8Ov5mX8yM8TDuRBmKWq8G13JJqO/f5nuO";
  
  // We can select to see if there is any row first
  const { data: existing, error: selectErr } = await supabase.from('admin_config').select('*');
  if (selectErr) {
    console.error("Error selecting admin config:", selectErr);
    process.exit(1);
  }
  
  console.log("Existing admin configs in database:", existing);
  
  // Delete all existing configs
  if (existing && existing.length > 0) {
    const { error: delErr } = await supabase.from('admin_config').delete().neq('username', '');
    if (delErr) {
      console.error("Error deleting old admin configs:", delErr);
      process.exit(1);
    }
    console.log("Deleted old admin configs.");
  }
  
  // Insert new one
  const { error: insertErr } = await supabase.from('admin_config').insert({ username, password });
  if (insertErr) {
    console.error("Error inserting new admin config:", insertErr);
    process.exit(1);
  }
  
  console.log("Successfully updated admin credentials in Supabase to Radha / Radha@123!");
}

run();
