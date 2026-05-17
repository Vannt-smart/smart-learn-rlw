import { query } from "../server/db.mjs";

async function run() {
  try {
    console.log("--- START DATABASE SETTINGS TEST ---");
    
    // 1. Check existing keys
    const { rows: initialRows } = await query("SELECT key, value FROM system_settings");
    console.log("Initial settings in DB:", initialRows);

    // 2. Test upserting platform_android
    console.log("Upserting platform_android...");
    const androidVal = JSON.stringify({ version: "2.1.0-test" });
    await query(
      `INSERT INTO system_settings (key, value, updated_at) 
       VALUES ('platform_android', $1, NOW()) 
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
      [androidVal]
    );

    // 3. Test upserting platform_ios
    console.log("Upserting platform_ios...");
    const iosVal = JSON.stringify({ version: "3.2.1-test" });
    await query(
      `INSERT INTO system_settings (key, value, updated_at) 
       VALUES ('platform_ios', $1, NOW()) 
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
      [iosVal]
    );

    // 4. Retrieve back
    const { rows: androidRows } = await query("SELECT value FROM system_settings WHERE key = 'platform_android'");
    const platformAndroid = androidRows[0]?.value?.version;
    console.log("Retrieved platform_android:", platformAndroid);

    const { rows: iosRows } = await query("SELECT value FROM system_settings WHERE key = 'platform_ios'");
    const platformIos = iosRows[0]?.value?.version;
    console.log("Retrieved platform_ios:", platformIos);

    if (platformAndroid === "2.1.0-test" && platformIos === "3.2.1-test") {
      console.log("SUCCESS: Settings successfully saved and retrieved from DB!");
    } else {
      console.error("FAILURE: Settings mismatch!");
    }

    // 5. Clean up / reset to 1.0.0
    console.log("Resetting versions to 1.0.0...");
    await query(
      `INSERT INTO system_settings (key, value, updated_at) 
       VALUES ('platform_android', $1, NOW()) 
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
      [JSON.stringify({ version: "1.0.0" })]
    );
    await query(
      `INSERT INTO system_settings (key, value, updated_at) 
       VALUES ('platform_ios', $1, NOW()) 
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
      [JSON.stringify({ version: "1.0.0" })]
    );
    console.log("--- DATABASE SETTINGS TEST FINISHED ---");
  } catch (err) {
    console.error("Test failed with error:", err);
  } finally {
    process.exit();
  }
}

run();
