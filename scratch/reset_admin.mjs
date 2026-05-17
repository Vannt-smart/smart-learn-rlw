import { query } from "../server/db.mjs";
import crypto from "crypto";

async function hashPassword(password) {
  const hash = crypto.createHash("sha256");
  hash.update(password + "hvui-salt-2024");
  return hash.digest("hex");
}

async function resetAdminPassword() {
  try {
    const newPassword = "AdminPassword123!";
    const hash = await hashPassword(newPassword);
    await query("UPDATE users SET password_hash = $1 WHERE username = 'adminsmart'", [hash]);
    console.log("Admin password reset to: AdminPassword123!");
  } catch (err) {
    console.error("Error resetting admin password:", err);
  } finally {
    process.exit();
  }
}

resetAdminPassword();
