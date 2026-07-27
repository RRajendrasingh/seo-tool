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
    
    // Extract location ref if present (e.g. "location-ref-albany" -> "Albany")
    let targetLocation = "";
    if (source && source.startsWith("location-ref-")) {
      const slug = source.replace("location-ref-", "");
      targetLocation = slug.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
    }

    // Map service options to packageRequest tags
    let packageRequest = service || "Contact: General Inquiry";
    if (targetLocation && !packageRequest.includes(targetLocation)) {
      packageRequest = `${packageRequest} (${targetLocation})`;
    } else if (source === "widget") {
      packageRequest = `Widget: ${service || "Video Strategy Meet"}`;
    }

    let notesText = message ? message.trim() : "No message text provided.";
    if (targetLocation && !notesText.includes("Ref Location:")) {
      notesText = `[Ref Location: ${targetLocation}] ${notesText}`;
    }

    const websiteCol = (source && source.startsWith("location-ref-"))
      ? source
      : (source === "widget" ? "consultancy-widget" : "contact-page");

    await query(
      "INSERT INTO leads (id, name, email, phone, website, date, seoScore, grade, status, packageRequest, amountPaid, notes) VALUES (?, ?, ?, ?, ?, ?, 0, 'N/A', 'New', ?, 0.00, ?)",
      [
        leadId,
        name.trim(),
        cleanEmail,
        "Not Provided",
        websiteCol,
        dateStr,
        packageRequest,
        notesText
      ]
    );

    console.log(`Contact API: Saved new lead inquiry from ${cleanEmail} for location '${targetLocation || "Direct"}' under ${packageRequest}.`);

    return NextResponse.json({ success: true, leadId });
  } catch (error) {
    console.error("Contact API Route Error:", error);
    return NextResponse.json(
      { error: "Internal server error. Failed to save contact request." },
      { status: 500 }
    );
  }
}
