import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { Prisma } from "@prisma/client";
import z from "zod";

import { logAudit, getRequestInfo } from "@/lib/audit-logger";
import { getSession, hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const createUserSchema = z.object({
  email: z.string().email(),
  fullname: z.string().min(2),
  phone: z.string().optional(),
  role: z.enum(["pic", "client"]),
  password: z.string().min(6),
  avatarColor: z.string().optional(),
});

export async function GET() {
  try {
    const session = await getSession();

    // Build filter based on user role
    const where: Prisma.UserProfileWhereInput = {};

    // If user is admin, exclude other admins (only show pic and client)
    if (session?.role === "admin") {
      where.role = {
        in: ["pic", "client"],
      };
    }
    // For non-admin users, show all users (or adjust as needed for security)

    const users = await prisma.userProfile.findMany({
      where,
      select: {
        id: true,
        userId: true,
        email: true,
        fullname: true,
        role: true,
        phone: true,
        avatarColor: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    const headersList = await headers();
    const { ipAddress, userAgent } = getRequestInfo(headersList);

    // Only admin can create users
    if (!session || session.role !== "admin") {
      await logAudit({
        userId: session?.id,
        action: "CREATE_USER",
        entityType: "USER",
        details: { reason: "Unauthorized attempt" },
        ipAddress,
        userAgent,
        success: false,
        errorMessage: "Unauthorized",
      });
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();

    // Validate request body
    const validated = createUserSchema.parse(body);

    // Check if email already exists
    const existingUser = await prisma.userProfile.findUnique({
      where: { email: validated.email },
    });

    if (existingUser) {
      await logAudit({
        userId: session.id,
        action: "CREATE_USER",
        entityType: "USER",
        details: { email: validated.email, reason: "Email already exists" },
        ipAddress,
        userAgent,
        success: false,
        errorMessage: "Email already exists",
      });
      return NextResponse.json({ error: "Email already exists" }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await hashPassword(validated.password);

    // Generate userId (same as id, or you can use different logic)
    const userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // Create user
    const user = await prisma.userProfile.create({
      data: {
        userId,
        email: validated.email,
        fullname: validated.fullname,
        phone: validated.phone ?? null,
        role: validated.role,
        password: hashedPassword,
        avatarColor: validated.avatarColor ?? "#3b82f6",
      },
      select: {
        id: true,
        userId: true,
        email: true,
        fullname: true,
        role: true,
        phone: true,
        avatarColor: true,
        createdAt: true,
      },
    });

    // Log successful user creation
    await logAudit({
      userId: session.id,
      action: "CREATE_USER",
      entityType: "USER",
      entityId: user.id,
      details: {
        email: user.email,
        fullname: user.fullname,
        role: user.role,
      },
      ipAddress,
      userAgent,
      success: true,
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}
