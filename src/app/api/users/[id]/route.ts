import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { Prisma } from "@prisma/client";
import z from "zod";

import { logAudit, getRequestInfo } from "@/lib/audit-logger";
import { getSession, hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const updateUserSchema = z.object({
  fullname: z.string().min(2).optional(),
  phone: z.string().optional().nullable(),
  role: z.enum(["pic", "client"]).optional(),
  password: z.string().min(6).optional(),
});

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const session = await getSession();
    const headersList = await headers();
    const { ipAddress, userAgent } = getRequestInfo(headersList);
    console.log("PATCH /api/users/[id] - Session:", session);

    // Only admin can edit users
    if (!session || session.role !== "admin") {
      console.log(
        "PATCH /api/users/[id] - Unauthorized. Session exists:",
        !!session,
        "Role:",
        session?.role
      );
      await logAudit({
        userId: session?.userId,
        action: "UPDATE_USER",
        entityType: "USER",
        details: { reason: "Unauthorized attempt" },
        ipAddress,
        userAgent,
        success: false,
        errorMessage: "Unauthorized",
      });
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id: userId } = await params;
    console.log("PATCH /api/users/[id] - userId:", userId);

    const body = await request.json();
    console.log("PATCH /api/users/[id] - body:", body);

    // Validate request body
    const validated = updateUserSchema.parse(body);
    console.log("PATCH /api/users/[id] - validated:", validated);

    // Check if user exists
    const existingUser = await prisma.userProfile.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prepare update data
    const updateData: Prisma.UserProfileUpdateInput = {};

    if (validated.fullname !== undefined) updateData.fullname = validated.fullname;
    if (validated.phone !== undefined) updateData.phone = validated.phone;
    if (validated.role !== undefined) updateData.role = validated.role;

    // Hash password if provided
    if (validated.password) {
      updateData.password = await hashPassword(validated.password);
    }

    console.log("PATCH /api/users/[id] - updateData:", updateData);

    // Update user
    const updatedUser = await prisma.userProfile.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        userId: true,
        email: true,
        fullname: true,
        role: true,
        phone: true,
        avatarColor: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    console.log("PATCH /api/users/[id] - updatedUser:", updatedUser);

    // Log successful user update
    await logAudit({
      userId: session.userId,
      action: "UPDATE_USER",
      entityType: "USER",
      entityId: userId,
      details: {
        email: updatedUser.email,
        fullname: updatedUser.fullname,
        role: updatedUser.role,
        updatedFields: Object.keys(validated),
      },
      ipAddress,
      userAgent,
      success: true,
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);

    if (error instanceof z.ZodError) {
      console.error("Zod validation error:", error.errors);
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);

      // Return more specific error message
      return NextResponse.json({ error: `Error: ${error.message}` }, { status: 500 });
    }

    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const session = await getSession();
    const headersList = await headers();
    const { ipAddress, userAgent } = getRequestInfo(headersList);
    console.log("DELETE /api/users/[id] - Session:", session);

    // Only admin can delete users
    if (!session || session.role !== "admin") {
      console.log(
        "DELETE /api/users/[id] - Unauthorized. Session exists:",
        !!session,
        "Role:",
        session?.role
      );
      await logAudit({
        userId: session?.userId,
        action: "DELETE_USER",
        entityType: "USER",
        details: { reason: "Unauthorized attempt" },
        ipAddress,
        userAgent,
        success: false,
        errorMessage: "Unauthorized",
      });
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id: userId } = await params;
    console.log("DELETE /api/users/[id] - userId:", userId);

    // Check if user exists
    const existingUser = await prisma.userProfile.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Don't allow deleting the current admin
    if (existingUser.id === session.id) {
      return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 });
    }

    console.log("DELETE /api/users/[id] - Deleting user:", userId);

    // Delete user (hard delete)
    await prisma.userProfile.delete({
      where: { id: userId },
    });

    // Log successful user deletion
    await logAudit({
      userId: session.userId,
      action: "DELETE_USER",
      entityType: "USER",
      entityId: userId,
      details: {
        email: existingUser.email,
        fullname: existingUser.fullname,
        role: existingUser.role,
      },
      ipAddress,
      userAgent,
      success: true,
    });

    console.log("DELETE /api/users/[id] - User deleted successfully");
    return NextResponse.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);

    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);

      // Return more specific error message
      return NextResponse.json({ error: `Error: ${error.message}` }, { status: 500 });
    }

    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
