// ==============================================================================
// MEWAK LUXURY COMMERCE - SECURE OTP & TOKEN MANAGEMENT
// ==============================================================================

import crypto from 'crypto';

export interface PendingUserData {
  name: string;
  email: string;
  phone: string;
  password?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: any;
}

export interface EmailTokenRecord {
  email: string;
  code: string;
  token: string;
  type: 'verify_email' | 'reset_password';
  expiresAt: number; // timestamp ms
  lastSentAt: number; // timestamp ms
  verified?: boolean;
  pendingUserData?: PendingUserData;
}

// Global in-memory storage (persists across API invocations in runtime process)
const tokenStore = new Map<string, EmailTokenRecord>();

const COOLDOWN_SECONDS = 30; // 30s resend rate limit
const EXPIRY_MINUTES = 15; // 15 mins validity

function getKey(email: string, type: 'verify_email' | 'reset_password'): string {
  return `${type}:${email.trim().toLowerCase()}`;
}

/**
 * Creates or refreshes an OTP verification token for a given email and purpose.
 * Enforces a 30-second cooldown on consecutive resend requests.
 * Optionally stores pendingUserData (e.g. signup form data) until verified.
 */
export function createEmailToken(
  email: string,
  type: 'verify_email' | 'reset_password',
  pendingUserData?: PendingUserData
): {
  success: boolean;
  code?: string;
  token?: string;
  error?: string;
  waitSeconds?: number;
  expiresInSeconds?: number;
} {
  const cleanEmail = email.trim().toLowerCase();
  const key = getKey(cleanEmail, type);
  const now = Date.now();

  const existing = tokenStore.get(key);
  if (existing) {
    const elapsedSeconds = Math.floor((now - existing.lastSentAt) / 1000);
    if (elapsedSeconds < COOLDOWN_SECONDS) {
      const waitSeconds = COOLDOWN_SECONDS - elapsedSeconds;
      return {
        success: false,
        error: `A dispatch was recently sent. Please wait ${waitSeconds}s before resending.`,
        waitSeconds,
      };
    }
  }

  // Generate cryptographic 6-digit numeric OTP (e.g. "492815")
  const randomBuffer = crypto.randomBytes(3);
  const numericVal = (randomBuffer.readUIntBE(0, 3) % 900000) + 100000;
  const code = numericVal.toString();

  // Generate url-safe token for one-click email links
  const token = crypto.randomBytes(24).toString('hex');
  const expiresAt = now + EXPIRY_MINUTES * 60 * 1000;

  // Preserve previous pendingUserData if resending without re-supplying
  const savedPendingData = pendingUserData || existing?.pendingUserData;

  const record: EmailTokenRecord = {
    email: cleanEmail,
    code,
    token,
    type,
    expiresAt,
    lastSentAt: now,
    pendingUserData: savedPendingData,
  };

  tokenStore.set(key, record);

  return {
    success: true,
    code,
    token,
    expiresInSeconds: EXPIRY_MINUTES * 60,
  };
}

/**
 * Validates a user-provided 6-digit code or link token.
 */
export function verifyEmailToken(
  email: string,
  codeOrToken: string,
  type: 'verify_email' | 'reset_password'
): {
  valid: boolean;
  error?: string;
  pendingUserData?: PendingUserData;
} {
  const cleanEmail = email.trim().toLowerCase();
  const key = getKey(cleanEmail, type);
  const cleanInput = codeOrToken.trim();

  const record = tokenStore.get(key);
  if (!record) {
    return {
      valid: false,
      error: 'No active verification code found for this email. Please request a new code.',
    };
  }

  if (Date.now() > record.expiresAt) {
    tokenStore.delete(key);
    return {
      valid: false,
      error: 'Verification code has expired. Please request a fresh email.',
    };
  }

  const matchesCode = record.code === cleanInput;
  const matchesToken = record.token === cleanInput;

  if (!matchesCode && !matchesToken) {
    return {
      valid: false,
      error: 'Invalid authentication code. Please check your email and enter the 6-digit code.',
    };
  }

  return { valid: true, pendingUserData: record.pendingUserData };
}

/**
 * Gets the token record including pendingUserData if present.
 */
export function getEmailTokenRecord(
  email: string,
  type: 'verify_email' | 'reset_password'
): EmailTokenRecord | undefined {
  const cleanEmail = email.trim().toLowerCase();
  return tokenStore.get(getKey(cleanEmail, type));
}

/**
 * Consumes (removes) a token once verified successfully to prevent reuse.
 */
export function consumeEmailToken(
  email: string,
  type: 'verify_email' | 'reset_password'
): void {
  const cleanEmail = email.trim().toLowerCase();
  const key = getKey(cleanEmail, type);
  tokenStore.delete(key);
}

/**
 * Gets remaining cooldown seconds for an email if a user wants to check resend eligibility.
 */
export function getResendCooldown(
  email: string,
  type: 'verify_email' | 'reset_password'
): number {
  const cleanEmail = email.trim().toLowerCase();
  const key = getKey(cleanEmail, type);
  const existing = tokenStore.get(key);
  if (!existing) return 0;
  const elapsed = Math.floor((Date.now() - existing.lastSentAt) / 1000);
  return Math.max(0, COOLDOWN_SECONDS - elapsed);
}
