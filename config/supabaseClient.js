const { createClient } = require("@supabase/supabase-js");

// ⚠️ แก้ไขค่าด้านล่างนี้ให้ตรงกับโปรเจกต์ Supabase ของคุณ
// หรือใช้ CodeSandbox Secrets: SUPABASE_URL และ SUPABASE_KEY
const SUPABASE_URL =
  process.env.SUPABASE_URL || "https://yjlwmrktiwqayittzolg.supabase.co";
const SUPABASE_KEY =
  process.env.SUPABASE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlqbHdtcmt0aXdxYXlpdHR6b2xnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzODczODgsImV4cCI6MjA4Njk2MzM4OH0.BNUqQqDT90jI4vOx-Y9h_UEwxu7DsULwjyuM2oEoIqo";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

module.exports = supabase;
