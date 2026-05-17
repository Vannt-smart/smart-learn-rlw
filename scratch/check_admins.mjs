import { query } from "../server/db.mjs";

async function checkAdmins() {
  try {
    const { rows } = await query("SELECT username, role FROM users WHERE role = 'admin'");
    console.log("Admins found:", rows);
  } catch (err) {
    console.error("Error checking admins:", err);
  } finally {
    process.exit();
  }
}

checkAdmins();
