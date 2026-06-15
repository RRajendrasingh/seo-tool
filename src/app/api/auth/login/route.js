import { NextResponse } from "next/server";
import { z } from "zod";
import { query } from "@/utils/db";
import { comparePassword, signToken } from "@/utils/auth";
import { cookies } from "next/headers";

const LoginSchema = z.object({
  email: z.string().email("Invalid email format").toLowerCase().trim(),
  password: z.string().min(1, "Password is required")
});

export async function POST(request) {
  try {
    const body = await request.json();
    const result = LoginSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json({ error: "Invalid email or password format." }, { status: 400 });
    }
    
    const { email, password } = result.data;
    
    // Fetch user details from database
    const users = await query(
      "SELECT id, email, password_hash, full_name, auth_provider FROM users WHERE email = ?",
      [email]
    );
    
    // Generic message to prevent user account enumeration
    if (users.length === 0) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }
    
    const user = users[0];
    
    // Validate if local login is allowed
    if (user.auth_provider === "google" && !user.password_hash) {
      return NextResponse.json({ 
        error: "This account is configured for Google Single Sign-On. Please use Google Log In." 
      }, { status: 400 });
    }
    
    // Check password
    const isMatch = await comparePassword(password, user.password_hash);
    if (!isMatch) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }
    
    // Generate session JWT
    const token = signToken({ 
      id: user.id, 
      email: user.email, 
      name: user.full_name, 
      provider: user.auth_provider 
    });
    
    // Store in cookie
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
      user: {
        id: user.id,
        email: user.email,
        name: user.full_name,
        provider: user.auth_provider
      }
    });
    
  } catch (err) {
    console.error("Login API error:", err);
    return NextResponse.json({ error: "An internal server error occurred." }, { status: 500 });
  }
}
