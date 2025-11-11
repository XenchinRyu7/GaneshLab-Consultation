import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/app/actions/auth";

// GET /api/users/profile - Get current user profile
export async function GET(req: NextRequest) {
  try {
    const sessionUser = await getCurrentUser();
    if (!sessionUser) {
      console.error("[GET /api/users/profile] Unauthorized: No user found in session");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.userProfile.findUnique({
      where: { id: sessionUser.id },
      select: {
        id: true,
        email: true,
        fullname: true,
        phone: true,
        role: true,
        avatarColor: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      console.error("[GET /api/users/profile] User not found in database:", sessionUser.id);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error: any) {
    console.error("[GET /api/users/profile] Error fetching user profile:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/users/profile - Update current user profile
export async function PUT(req: NextRequest) {
  try {
    const sessionUser = await getCurrentUser();
    if (!sessionUser) {
      console.error("[PUT /api/users/profile] Unauthorized: No user found in session");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { fullname, phone } = body;

    // Validate input
    if (!fullname || typeof fullname !== "string" || fullname.trim().length === 0) {
      return NextResponse.json(
        { error: "Full name is required" },
        { status: 400 }
      );
    }

    // Verify user exists
    const existingUser = await prisma.userProfile.findUnique({
      where: { id: sessionUser.id },
    });

    if (!existingUser) {
      console.error("[PUT /api/users/profile] User not found in database:", sessionUser.id);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update user profile
    const updatedUser = await prisma.userProfile.update({
      where: { id: sessionUser.id },
      data: {
        fullname: fullname.trim(),
        phone: phone && phone.trim().length > 0 ? phone.trim() : null,
      },
      select: {
        id: true,
        email: true,
        fullname: true,
        phone: true,
        role: true,
        avatarColor: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    console.log("[PUT /api/users/profile] User profile updated:", {
      id: updatedUser.id,
      email: updatedUser.email,
      fullname: updatedUser.fullname,
    });

    return NextResponse.json({ user: updatedUser }, { status: 200 });
  } catch (error: any) {
    console.error("[PUT /api/users/profile] Error updating user profile:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

