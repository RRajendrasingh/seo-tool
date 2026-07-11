import { NextResponse } from "next/server";
import { query } from "@/utils/db";

export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const { name, email, service, message, source } = await req.json();

    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required fields." },
        { status: 400 }
      );
    }

    const leadId = "lead_" + Date.now();
    const dateStr = new Date().toISOString();
    const cleanEmail = email.trim().toLowerCase();
    
    // Map service options to packageRequest tags
    let packageRequest = service || "Contact: General Inquiry";
    if (source === "widget") {
      packageRequest = `Widget: ${service || "Video Strategy Meet"}`;
    }

    await query(
      "INSERT INTO leads (id, name, email, phone, website, date, seoScore, grade, status, packageRequest, amountPaid, notes) VALUES (?, ?, ?, ?, ?, ?, 0, 'N/A', 'New', ?, 0.00, ?)",
      [
        leadId,
        name.trim(),
        cleanEmail,
        "Not Provided",
        source === "widget" ? "consultancy-widget" : "contact-page",
        dateStr,
        packageRequest,
        message ? message.trim() : "No message text provided."
      ]
    );

    console.log(`Contact API: Saved new lead inquiry from ${cleanEmail} under ${packageRequest}.`);

    return NextResponse.json({ success: true, leadId });
  } catch (error) {
    console.error("Contact API Route Error:", error);
    return NextResponse.json(
      { error: "Internal server error. Failed to save contact request." },
      { status: 500 }
    );
  }
}
