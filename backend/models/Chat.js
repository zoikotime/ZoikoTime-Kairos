const { supabase } = require("../config/db");

// Supabase table: chats
// Columns: id, session_id, user_email, role, content, metadata, expires_at, created_at, updated_at

const Chat = {
  async create(data) {
    const { sessionId, userEmail, role, content, metadata = {}, expiresAt } = data;
    const { data: row, error } = await supabase
      .from("chats")
      .insert([
        {
          session_id: sessionId,
          user_email: userEmail,
          role,
          content,
          metadata,
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
      .from("chats")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true });
    if (error) throw error;
    return data;
  },

  async deleteBySessionId(sessionId) {
    const { error } = await supabase
      .from("chats")
      .delete()
      .eq("session_id", sessionId);
    if (error) throw error;
    return true;
  },
};

module.exports = Chat;