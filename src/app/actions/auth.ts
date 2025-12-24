"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { login, logout, getCurrentUser as getCurrentUserFromSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function signIn(email: string, password: string, rememberMe: boolean = false) {
  const headersList = await headers();
  const ipAddress = headersList.get("x-forwarded-for") ?? headersList.get("x-real-ip") ?? "unknown";
  const userAgent = headersList.get("user-agent") ?? "unknown";

  try {
    const result = await login(email, password, rememberMe);

    if ("error" in result) {
      console.error("[signIn] Login error:", result.error);

      // Log failed login attempt
      try {
        const user = await prisma.userProfile.findUnique({ where: { email } });
        await prisma.auditLog.create({
          data: {
            userId: user?.id,
            action: "LOGIN_FAILED",
            entityType: "USER",
            entityId: user?.id,
            details: { email, reason: result.error },
            ipAddress,
            userAgent,
            success: false,
            errorMessage: result.error,
          },
        });
      } catch (logError) {
        console.error("[signIn] Failed to log login attempt:", logError);
      }

      return { error: result.error };
    }

    try {
      await prisma.auditLog.create({
        data: {
          userId: result.user.id,
          action: "LOGIN",
          entityType: "USER",
          entityId: result.user.id,
          details: { email: result.user.email, role: result.user.role },
          ipAddress,
          userAgent,
          success: true,
        },
      });
    } catch (logError) {
      console.error("[signIn] Failed to log successful login:", logError);
      // Continue even if audit log fails
    }

    revalidatePath("/", "layout");

    // Redirect throws a special error in Next.js (NEXT_REDIRECT), which is expected behavior
    // This error should not be caught or logged as it's the normal way Next.js handles redirects
    redirect("/id/dashboard");
  } catch (error) {
    // Check if it's a redirect error (Next.js throws this for redirects)
    // Redirect errors have a digest property with "NEXT_REDIRECT" in it
    if (
      error &&
      typeof error === "object" &&
      "digest" in error &&
      typeof error.digest === "string" &&
      error.digest.includes("NEXT_REDIRECT")
    ) {
      // This is a Next.js redirect, which is expected - re-throw it
      throw error;
    }

    // This catch block handles actual unexpected errors
    console.error("[signIn] Unexpected error:", error);

    // Log unexpected error
    try {
      await prisma.auditLog.create({
        data: {
          action: "LOGIN_ERROR",
          entityType: "SYSTEM",
          details: { email, error: error instanceof Error ? error.message : "Unknown error" },
          ipAddress,
          userAgent,
          success: false,
          errorMessage: error instanceof Error ? error.message : "Unexpected login error",
        },
      });
    } catch (logError) {
      console.error("[signIn] Failed to log error:", logError);
    }

    return {
      error:
        error instanceof Error
          ? `Login failed: ${error.message}`
          : "An unexpected error occurred during login",
    };
  }
}

export async function signOut() {
  try {
    const currentUser = await getCurrentUser();
    const headersList = await headers();
    const ipAddress =
      headersList.get("x-forwarded-for") ?? headersList.get("x-real-ip") ?? "unknown";
    const userAgent = headersList.get("user-agent") ?? "unknown";

    // Log logout before actually logging out
    if (currentUser) {
      try {
        await prisma.auditLog.create({
          data: {
            userId: currentUser.id,
            action: "LOGOUT",
            entityType: "USER",
            entityId: currentUser.id,
            details: { email: currentUser.email, role: currentUser.role },
            ipAddress,
            userAgent,
            success: true,
          },
        });
      } catch (logError) {
        console.error("[signOut] Failed to log logout:", logError);
      }
    }

    await logout();
    revalidatePath("/", "layout");
    redirect("/id/auth/login");
  } catch (error) {
    // Check if it's a redirect error (Next.js throws this for redirects)
    if (
      error &&
      typeof error === "object" &&
      "digest" in error &&
      typeof error.digest === "string" &&
      error.digest.includes("NEXT_REDIRECT")
    ) {
      // This is a Next.js redirect, which is expected - re-throw it
      throw error;
    }

    // Only log actual unexpected errors
    console.error("[signOut] Error during logout:", error);
    // Still proceed with logout even if logging fails
    await logout();
    revalidatePath("/", "layout");
    redirect("/id/auth/login");
  }
}

export async function getCurrentUser() {
  return await getCurrentUserFromSession();
}
