"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { login, logout, getCurrentUser as getCurrentUserFromSession } from "@/lib/auth";

export async function signIn(email: string, password: string, rememberMe: boolean = false) {
  try {
    const result = await login(email, password, rememberMe);

    if ("error" in result) {
      console.error("[signIn] Login error:", result.error);
      return { error: result.error };
    }

    console.log("[signIn] Login successful for user:", result.user.email);
    revalidatePath("/", "layout");

    // Redirect throws a special error in Next.js (NEXT_REDIRECT), which is expected behavior
    // This error should not be caught or logged as it's the normal way Next.js handles redirects
    redirect("/dashboard");
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

    return {
      error:
        error instanceof Error
          ? `Login failed: ${error.message}`
          : "An unexpected error occurred during login",
    };
  }
}

export async function signOut() {
  await logout();
  revalidatePath("/", "layout");
  redirect("/auth/login");
}

export async function getCurrentUser() {
  return await getCurrentUserFromSession();
}
