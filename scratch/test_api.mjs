async function run() {
  try {
    console.log("Fetching /api/version-app...");
    const res = await fetch("http://127.0.0.1:4000/api/version-app", {
      headers: {
        "x-api-key": "smart-learn-secret-key-oRFuv7VOUduB24uSfIWrT4jE5xmcSUPx"
      }
    });
    const json = await res.json();
    console.log("Response JSON:", JSON.stringify(json, null, 2));

    if (json.version && json["platform-android"] && json["platform-ios"]) {
      console.log("SUCCESS: /api/version-app API verified successfully!");
    } else {
      console.error("FAILURE: API response structure is incorrect!");
    }
  } catch (err) {
    console.error("API test failed with error:", err.message);
  } finally {
    process.exit();
  }
}

run();
