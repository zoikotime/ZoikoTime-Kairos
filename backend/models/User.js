const { supabase } = require("../config/db");

// Supabase table: users
// Columns: id, name, email (unique), company, employee_id, session_id, created_at, updated_at

const User = {
  async create(data) {
    const { name, email, company, employeeId, sessionId = "" } = data;

    const { data: row, error } = await supabase
      .from("users")
      .insert([
        {
          name,
          email: email.toLowerCase().trim(),
          company: company.trim(),
          employee_id: employeeId.trim(),
          session_id: sessionId.trim(),
        },
      ])
      .select()
      .single();
    if (error) throw error;
    return row;
  },

  async findByEmail(email) {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email.toLowerCase().trim())
      .single();
    if (error && error.code !== "PGRST116") throw error; // PGRST116 = no rows found
    return data || null;
  },

  async updateSessionId(email, sessionId) {
    const { data, error } = await supabase
      .from("users")
      .update({ session_id: sessionId })
      .eq("email", email.toLowerCase().trim())
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async upsert(data) {
    const { name, email, company, employeeId, sessionId = "" } = data;

    const { data: row, error } = await supabase
      .from("users")
      .upsert(
        {
          name,
          email: email.toLowerCase().trim(),
          company: company.trim(),
          employee_id: employeeId.trim(),
          session_id: sessionId.trim(),
        },
        { onConflict: "email" }
      )
      .select()
      .single();
    if (error) throw error;
    return row;
  },
};

module.exports = User;