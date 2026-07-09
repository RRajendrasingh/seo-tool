import { NextResponse } from "next/server";
import { z } from "zod";
import { query } from "@/utils/db";
import { hashPassword, signToken } from "@/utils/auth";
import crypto from "crypto";
import { cookies } from "next/headers";
import { rateLimit } from "@/utils/rateLimit";

// Validation schema for manual registration
const RegisterSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name cannot exceed 100 characters").trim(),
  email: z.string().email("Invalid email format").max(255).toLowerCase().trim(),
  password: z.string()
    .min(10, "Password must be at least 10 characters")
    .max(72, "Password cannot exceed 72 characters")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one digit")
    .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character")
});

export async function POST(request) {
  // BUG C-3 FIX: Rate limit — max 5 registrations per IP per hour
  if (rateLimit(request, { limit: 5, windowMs: 60 * 60 * 1000 })) {
    return NextResponse.json(
      { error: "Too many registration attempts. Please try again later." },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const result = RegisterSchema.safeParse(body);
    
    if (!result.success) {
      const errors = result.error.errors.map(err => err.message).join(", ");
      return NextResponse.json({ error: errors }, { status: 400 });
    }
    
    const { name, email, password } = result.data;
    
    // Check if user already exists
    const users = await query("SELECT id FROM users WHERE email = ?", [email]);
    if (users.length > 0) {
      return NextResponse.json({ error: "An account with this email address already exists." }, { status: 409 });
    }
    
    // Hash password
    const passwordHash = await hashPassword(password);
    
    // Create UUID-based ID
    const id = "usr_" + crypto.randomUUID().replace(/-/g, "");
    
    // Insert user into MySQL database
    await query(
      "INSERT INTO users (id, email, password_hash, full_name, auth_provider, provider_id, email_verified) VALUES (?, ?, ?, ?, 'local', NULL, FALSE)",
      [id, email, passwordHash, name]
    );
    
    // Generate session JWT token
    const token = signToken({ id, email, name, provider: "local" });
    
    // Set secure HttpOnly cookie
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
      user: { id, email, name, provider: "local" } 
    });
    
  } catch (err) {
    console.error("Registration API error:", err);
    return NextResponse.json({ error: "An internal server error occurred." }, { status: 500 });
  }
}
