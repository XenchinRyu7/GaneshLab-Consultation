import { cookies } from "next/headers";

import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";

import { prisma } from "@/lib/prisma";
import type { UserRole } from "@/types/rbac";

const secretKey = process.env.AUTH_SECRET ?? "your-secret-key-change-in-production";
const key = new TextEncoder().encode(secretKey);

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export async function encrypt(payload: User): Promise<string> {
  return encryptWithExpiration(payload, 7);
}

export async function decrypt(input: string): Promise<User | null> {
  try {
    const { payload } = await jwtVerify(input, key, {
      algorithms: ["HS256"],
    });
    return payload as unknown as User;
  } catch {
    return null;
  }
}

async function encryptWithExpiration(payload: User, days: number): Promise<string> {
  return await new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${days}d`)
    .sign(key);
}

export async function createSession(user: User, rememberMe: boolean = false): Promise<void> {
  // If rememberMe is true, session expires in 30 days, otherwise 7 days
  const expiresInDays = rememberMe ? 30 : 7;
  const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000);

  // Update JWT expiration to match cookie expiration
  const session = await encryptWithExpiration(user, expiresInDays);

  const cookieStore = await cookies();
  cookieStore.set("session", session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  });
}

export async function getSession(): Promise<User | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;
  if (!session) return null;
  return await decrypt(session);
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("session");
}

async function handleLoginError(error: unknown): Promise<{ error: string }> {
  console.error("[login] Error during login:", error);

  if (error instanceof Error) {
    console.error("[login] Error name:", error.name);
    console.error("[login] Error message:", error.message);
    console.error("[login] Error stack:", error.stack);

    // Check for specific error types
    if (error.message.includes("Prisma")) {
      return { error: "Database connection error. Please try again later." };
    }
    if (error.message.includes("bcrypt")) {
      return { error: "Password verification error. Please try again." };
    }
    if (error.message.includes("JWT") || error.message.includes("jose")) {
      return { error: "Session creation error. Please try again." };
    }

    return { error: `Login error: ${error.message}` };
  }

  return { error: "An unexpected error occurred during login" };
}

async function verifyUserCredentials(email: string, password: string) {
  const user = await prisma.userProfile.findUnique({
    where: { email },
  });

  if (!user) {
    return null;
  }

  const userWithPassword = user as typeof user & { password: string; fullname: string };
  const isValidPassword = await verifyPassword(password, userWithPassword.password);

  if (!isValidPassword) {
    return null;
  }

  return userWithPassword;
}

export async function login(
  email: string,
  password: string,
  rememberMe: boolean = false
): Promise<{ user: User } | { error: string }> {
  try {
    const userWithPassword = await verifyUserCredentials(email, password);
    if (!userWithPassword) {
      return { error: "Invalid email or password" };
    }

    const userData: User = {
      id: userWithPassword.id,
      email: userWithPassword.email,
      name: userWithPassword.fullname,
      role: userWithPassword.role as UserRole,
      avatar: userWithPassword.avatarColor ?? undefined,
    };

    await createSession(userData, rememberMe);
    return { user: userData };
  } catch (error) {
    return await handleLoginError(error);
  }
}

export async function logout(): Promise<void> {
  await deleteSession();
}

export async function getCurrentUser(): Promise<User | null> {
  return await getSession();
}

export const auth = getCurrentUser;
