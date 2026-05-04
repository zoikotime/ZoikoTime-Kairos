const { supabase } = require("../config/db");

// Supabase table: managers
// Columns: id, company, employee_email, manager_email, created_at, updated_at

const Manager = {
  async create(data) {
    const { company, employeeEmail, managerEmail } = data;

    const { data: row, error } = await supabase
      .from("managers")
      .insert([
        {
          company,
          employee_email: employeeEmail,
          manager_email: managerEmail,
        },
      ])
      .select()
      .single();
    if (error) throw error;
    return row;
  },

  async findByEmployeeEmail(employeeEmail) {
    const { data, error } = await supabase
      .from("managers")
      .select("*")
      .eq("employee_email", employeeEmail)
      .single();
    if (error) throw error;
    return data;
  },

  async findByCompany(company) {
    const { data, error } = await supabase
      .from("managers")
      .select("*")
      .eq("company", company);
    if (error) throw error;
    return data;
  },
};

module.exports = Manager;