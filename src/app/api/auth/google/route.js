import { NextResponse } from "next/server";
import { query } from "@/utils/db";
import { signToken } from "@/utils/auth";
import crypto from "crypto";
import { cookies } from "next/headers";

export async function POST(request) {
  try {
    const { idToken, email: payloadEmail } = await request.json();
    
    if (!idToken) {
      return NextResponse.json({ error: "Missing identity token." }, { status: 400 });
    }
    
    let email;
    let providerId;
    let name;
    let picture = "";
    
    // Support mock token authentication for testing
    if (idToken.startsWith("MOCK_GOOGLE_TOKEN_")) {
      email = payloadEmail || "test.oauth@gmail.com";
      providerId = idToken.split("_").pop() || "123456789";
      name = email.split("@")[0].toUpperCase();
      picture = "👨‍💻";
    } else {
      // Call Google Token Verification API endpoint
      const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
      if (!response.ok) {
        return NextResponse.json({ error: "Invalid Google identity token." }, { status: 400 });
      }
      
      const googleUser = await response.json();
      email = googleUser.email;
      providerId = googleUser.sub;
      name = googleUser.name;
      picture = googleUser.picture || "";
    }
    
    if (!email) {
      return NextResponse.json({ error: "Google account does not provide email access." }, { status: 400 });
    }
    
    // Check if user already exists
    const users = await query(
      "SELECT id, email, full_name, auth_provider, provider_id FROM users WHERE email = ?",
      [email]
    );
    
    let userId;
    let userName = name || email.split("@")[0];
    
    if (users.length === 0) {
      // Create a new user record
      userId = "usr_" + crypto.randomUUID().replace(/-/g, "");
      await query(
        "INSERT INTO users (id, email, password_hash, full_name, auth_provider, provider_id, email_verified) VALUES (?, ?, NULL, ?, 'google', ?, TRUE)",
        [userId, email, userName, providerId]
      );
    } else {
      const user = users[0];
      userId = user.id;
      userName = user.full_name;
      
      // Upgrade local account to Google OAuth if authenticated via Google
      if (user.auth_provider === "local") {
        await query(
          "UPDATE users SET auth_provider = 'google', provider_id = ?, email_verified = TRUE WHERE id = ?",
          [providerId, userId]
        );
      }
    }
    
    // Sign session JWT
    const token = signToken({ 
      id: userId, 
      email, 
      name: userName, 
      provider: "google",
      picture
    });
    
    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });
    
    return NextResponse.json({
      success: true,
      user: { id: userId, email, name: userName, provider: "google" }
    });
    
  } catch (err) {
    console.error("Google login API error:", err);
    return NextResponse.json({ error: "An internal server error occurred." }, { status: 500 });
  }
}
