import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/utils/auth";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    
    if (!token) {
      return NextResponse.json({ session: null });
    }
    
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ session: null });
    }

    const { query } = require("@/utils/db");
    const users = await query(
      "SELECT subscription_tier, subscription_status, agency_name, agency_logo_id FROM users WHERE id = ?",
      [decoded.id]
    );

    let dbDetails = {
      subscription_tier: "free",
      subscription_status: "inactive",
      agency_name: null,
      agency_logo_id: null
    };

    if (users && users.length > 0) {
      dbDetails = users[0];
    }
    
    return NextResponse.json({ 
      session: {
        id: decoded.id,
        email: decoded.email,
        name: decoded.name,
        provider: decoded.provider,
        picture: decoded.picture || null,
        subscription_tier: dbDetails.subscription_tier || "free",
        subscription_status: dbDetails.subscription_status || "inactive",
        agency_name: dbDetails.agency_name,
        agency_logo_id: dbDetails.agency_logo_id
      }
    });
  } catch (err) {
    console.error("Session GET API error:", err);
    return NextResponse.json({ session: null });
  }
}
