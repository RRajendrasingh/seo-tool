import crypto from "crypto";
import bcrypt from "bcryptjs";

const SECRET = process.env.JWT_SECRET || "fallback_secret_key_123456789";

/**
 * Hashes a plain-text password using bcryptjs with a cost factor of 12.
 * @param {string} password 
 * @returns {Promise<string>} hashed password
 */
export async function hashPassword(password) {
  if (!password) throw new Error("Password is required for hashing.");
  return bcrypt.hash(password, 12);
}

/**
 * Compares a plain-text password with a hash.
 * @param {string} password 
 * @param {string} hash 
 * @returns {Promise<boolean>} match status
 */
export async function comparePassword(password, hash) {
  if (!password || !hash) return false;
  return bcrypt.compare(password, hash);
}

/**
 * Signs a payload and returns a standard secure HMAC-SHA256 JWT.
 * @param {object} payload 
 * @returns {string} JWT token
 */
export function signToken(payload) {
  const header = { alg: "HS256", typ: "JWT" };
  const headerBase64 = Buffer.from(JSON.stringify(header)).toString("base64url");
  
  // Add token expiry (e.g. 7 days from now)
  const extendedPayload = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7 days
    iat: Math.floor(Date.now() / 1000)
  };
  const payloadBase64 = Buffer.from(JSON.stringify(extendedPayload)).toString("base64url");
  
  const signature = crypto
    .createHmac("sha256", SECRET)
    .update(`${headerBase64}.${payloadBase64}`)
    .digest("base64url");
    
  return `${headerBase64}.${payloadBase64}.${signature}`;
}

/**
 * Verifies a JWT token signature and checks expiration.
 * @param {string} token 
 * @returns {object|null} payload if valid, null otherwise
 */
export function verifyToken(token) {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  
  const [headerBase64, payloadBase64, signature] = parts;
  
  const expectedSignature = crypto
    .createHmac("sha256", SECRET)
    .update(`${headerBase64}.${payloadBase64}`)
    .digest("base64url");
    
  if (signature !== expectedSignature) {
    return null;
  }
  
  try {
    const payloadJson = Buffer.from(payloadBase64, "base64url").toString("utf8");
    const payload = JSON.parse(payloadJson);
    
    // Check expiration
    if (payload.exp && Date.now() / 1000 > payload.exp) {
      return null; // Expired
    }
    
    return payload;
  } catch (err) {
    return null;
  }
}
