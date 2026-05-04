const { supabase } = require("../config/db");

// Supabase table: escalations
// Columns: id, session_id, employee_email, manager_email,
//          subject, message, status, created_at, updated_at

const Escalation = {
  async create(data) {
    const {
      sessionId,
      employeeEmail,
      managerEmail,
      subject,
      message,
      status = "pending",
    } = data;

    const { data: row, error } = await supabase
      .from("escalations")
      .insert([
        {
          session_id: sessionId,
          employee_email: employeeEmail,
          manager_email: managerEmail,
          subject,
          message,
          status,
        },
      ])
      .select()
      .single();
    if (error) throw error;
    return row;
  },

  async findBySessionId(sessionId) {
    const { data, error } = await supabase
      .from("escalations")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },

  async updateStatus(id, status) {
    const { data, error } = await supabase
      .from("escalations")
      .update({ status })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};

module.exports = Escalation;