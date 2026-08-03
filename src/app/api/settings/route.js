import { query } from "@/utils/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function verifyAdmin(request) {
  const passcode = request.headers.get("x-admin-passcode");
  const expected = process.env.ADMIN_PASSCODE;
  if (!expected) return false;
  return passcode === expected;
}

// Ensure settings table exists
async function ensureSettingsTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS site_settings (
      setting_key VARCHAR(100) PRIMARY KEY,
      setting_value LONGTEXT,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
}

export async function GET() {
  try {
    await ensureSettingsTable();
    const rows = await query("SELECT setting_key, setting_value FROM site_settings");
    const settingsMap = {};
    if (Array.isArray(rows)) {
      rows.forEach(r => {
        settingsMap[r.setting_key] = r.setting_value;
      });
    }

    const response = {
      gscVerificationToken: settingsMap.gscVerificationToken || process.env.NEXT_PUBLIC_GSC_VERIFICATION || "",
      gtmId: settingsMap.gtmId || process.env.NEXT_PUBLIC_GTM_ID || process.env.GTM_ID || "",
      clarityId: settingsMap.clarityId || process.env.NEXT_PUBLIC_CLARITY_ID || "",
      webhookUrl: settingsMap.webhookUrl || process.env.WEBHOOK_URL || "",
      web3formsKey: settingsMap.web3formsKey || process.env.WEB3FORMS_ACCESS_KEY || "",
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("GET /api/settings error:", error);
    return NextResponse.json({
      gscVerificationToken: process.env.NEXT_PUBLIC_GSC_VERIFICATION || "",
      gtmId: process.env.NEXT_PUBLIC_GTM_ID || process.env.GTM_ID || "",
      clarityId: process.env.NEXT_PUBLIC_CLARITY_ID || "",
      webhookUrl: process.env.WEBHOOK_URL || "",
      web3formsKey: process.env.WEB3FORMS_ACCESS_KEY || "",
    });
  }
}

export async function POST(request) {
  try {
    if (!verifyAdmin(request)) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await request.json();
    await ensureSettingsTable();

    const allowedKeys = ["gscVerificationToken", "gtmId", "clarityId", "webhookUrl", "web3formsKey"];
    
    for (const key of allowedKeys) {
      if (body[key] !== undefined) {
        const val = String(body[key]).trim();
        await query(
          "INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?",
          [key, val, val]
        );
      }
    }

    return NextResponse.json({ success: true, message: "Settings saved to database successfully" });
  } catch (error) {
    console.error("POST /api/settings error:", error);
    return NextResponse.json({ error: "Failed to save settings to database" }, { status: 500 });
  }
}
