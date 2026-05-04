const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn("SUPABASE_URL or SUPABASE_ANON_KEY not provided.");
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function connectDB() {
  try {
    const { error } = await supabase.from("users").select("id").limit(1);
    if (error) throw error;
    console.log("Supabase connected successfully.");
    return true;
  } catch (error) {
    console.warn(`Supabase connection check failed: ${error.message}`);
    return false;
  }
}

module.exports = { supabase, connectDB };