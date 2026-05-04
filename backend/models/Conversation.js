const { supabase } = require("../config/db");

// Supabase table: conversations
// Columns: id, session_id, user_email, user_name, company, employee_id,
//          title, preview, message_count, status, started_at,
//          last_message_at, expires_at, created_at, updated_at

const Conversation = {
  async create(data) {
    const {
      sessionId,
      userEmail,
      userName = "",
      company = "",
      employeeId = "",
      title = "New conversation",
      preview = "",
      messageCount = 0,
      status = "active",
      startedAt = new Date(),
      lastMessageAt = new Date(),
      expiresAt,
    } = data;

    const { data: row, error } = await supabase
      .from("conversations")
      .insert([
        {
          session_id: sessionId,
          user_email: userEmail,
          user_name: userName,
          company,
          employee_id: employeeId,
          title,
          preview,
          message_count: messageCount,
          status,
          started_at: startedAt,
          last_message_at: lastMessageAt,
          expires_at: expiresAt,
        },
      ])
      .select()
      .single();
    if (error) throw error;
    return row;
  },

  async findBySessionId(sessionId) {
    const { data, error } = await supabase
      .from("conversations")
      .select("*")
      .eq("session_id", sessionId)
      .single();
    if (error) throw error;
    return data;
  },

  async findByUserEmail(userEmail) {
    const { data, error } = await supabase
      .from("conversations")
      .select("*")
      .eq("user_email", userEmail)
      .order("last_message_at", { ascending: false });
    if (error) throw error;
    return data;
  },

  async updateBySessionId(sessionId, updates) {
    const allowed = {};
    if (updates.title !== undefined) allowed.title = updates.title;
    if (updates.preview !== undefined) allowed.preview = updates.preview;
    if (updates.messageCount !== undefined) allowed.message_count = updates.messageCount;
    if (updates.status !== undefined) allowed.status = updates.status;
    if (updates.lastMessageAt !== undefined) allowed.last_message_at = updates.lastMessageAt;

    const { data, error } = await supabase
      .from("conversations")
      .update(allowed)
      .eq("session_id", sessionId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteBySessionId(sessionId) {
    const { error } = await supabase
      .from("conversations")
      .delete()
      .eq("session_id", sessionId);
    if (error) throw error;
    return true;
  },
};

module.exports = Conversation;