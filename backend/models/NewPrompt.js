const { supabase } = require("../config/db");

const NewPrompt = {
  async findByPrompt(prompt) {
    const { data, error } = await supabase
      .from("new_prompts")
      .select("*")
      .eq("prompt", prompt)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return data || null;       
  },

  async create(prompt) {
    const { data, error } = await supabase
      .from("new_prompts")
      .insert([{ prompt, count: 1 }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async increment(prompt, count) {
    const { data, error } = await supabase
      .from("new_prompts")
      .update({ count })
      .eq("prompt", prompt)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async incrementOrCreate(prompt) {
    const existing = await this.findByPrompt(prompt);
    if (!existing) {
      return this.create(prompt);
    }

    return this.increment(prompt, (existing.count || 0) + 1);
  },

  async listAll() {
    const { data, error } = await supabase
      .from("new_prompts")
      .select("*")
      .order("count", { ascending: false })
      .order("prompt", { ascending: true });

    if (error) throw error;
    return data || [];
  },
};

module.exports = NewPrompt;
