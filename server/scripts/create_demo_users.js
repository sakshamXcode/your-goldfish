// server/scripts/create_demo_users.js
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in env before running this script.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function run() {
  try {
    console.log("Creating demo users and sample data...");

    // demo users
    const users = [
      { id: "user_anna", email: "anna@example.com", display_name: "Anna" },
      { id: "user_saksham", email: "saksham@example.com", display_name: "Saksham" }
    ];

    for (const u of users) {
      await supabase.from('users').upsert(u, { onConflict: ['id'] });
    }

    // sample connection
    await supabase.from('connections').upsert({ user_a: 'user_anna', user_b: 'user_saksham', created_at: new Date().toISOString() });

    // sample idea
    const { data: idea } = await supabase.from('ideas').insert([{
      title: "Rooftop Candlelight Dinner",
      category: "Romantic",
      link: null,
      link_preview: null,
      image_url: null,
      is_private: false,
      description: "Soft music and a small cake.",
      tags: ['Romantic','Food'],
      status: "approved",
      created_by: "user_anna",
      created_at: new Date().toISOString()
    }]).select().limit(1).single();

    console.log("Demo data created:", idea?.id || "no idea created");
    console.log("Done.");
  } catch (err) {
    console.error("Demo creation failed", err);
  }
}

run();
