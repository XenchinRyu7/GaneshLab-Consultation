import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/app/actions/auth";

// GET /api/companies - Get company for current user
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      console.error("Unauthorized: No user found in session");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get userId from query params (for backward compatibility) or use current user
    const { searchParams } = new URL(req.url);
    const userIdParam = searchParams.get("userId");
    
    // Use current user's ID for security (ignore userId param if provided)
    const userId = user.id;

    const company = await prisma.company.findUnique({
      where: {
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            fullname: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json({ company }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching company:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/companies - Create or update company
export async function POST(req: NextRequest) {
  try {
    // Get current user from session for security
    const sessionUser = await getCurrentUser();
    if (!sessionUser) {
      console.error("Unauthorized: No user found in session");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      userId: userIdFromBody,
      name,
      website,
      description,
      industry,
      address,
      city,
      province,
      postalCode,
      country,
      phone,
      email,
      logo,
      contactPerson,
      contactPhone,
      contactEmail,
    } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Company name is required" },
        { status: 400 }
      );
    }

    // Use session user's ID for security (ignore userId from body)
    const userId = sessionUser.id;
    
    console.log("[POST /api/companies] Session user:", {
      id: sessionUser.id,
      email: sessionUser.email,
      role: sessionUser.role,
    });

    // Verify user exists and is a client
    const user = await prisma.userProfile.findUnique({
      where: { id: userId },
    });

    if (!user) {
      console.error("[POST /api/companies] User not found in database:", {
        sessionUserId: userId,
        sessionUserEmail: sessionUser.email,
      });
      
      // Try to find user by email as fallback
      const userByEmail = await prisma.userProfile.findUnique({
        where: { email: sessionUser.email },
      });
      
      if (userByEmail) {
        console.error("[POST /api/companies] User found by email but ID mismatch:", {
          sessionUserId: userId,
          dbUserId: userByEmail.id,
          email: sessionUser.email,
        });
        return NextResponse.json(
          { 
            error: "User ID mismatch. Please logout and login again.",
            details: "Session user ID does not match database user ID"
          },
          { status: 401 }
        );
      }
      
      return NextResponse.json(
        { 
          error: "User not found. Please logout and login again.",
          details: `No user found with ID: ${userId} or email: ${sessionUser.email}`
        },
        { status: 404 }
      );
    }
    
    console.log("[POST /api/companies] User found:", {
      id: user.id,
      email: user.email,
      role: user.role,
    });

    if (user.role !== "client") {
      console.error("User is not a client:", userId, user.role);
      return NextResponse.json(
        { error: "Only clients can have a company profile" },
        { status: 403 }
      );
    }

    // Check if company already exists
    const existingCompany = await prisma.company.findUnique({
      where: { userId },
    });

    let company;
    if (existingCompany) {
      // Update existing company
      company = await prisma.company.update({
        where: { userId },
        data: {
          name,
          website: website || null,
          description: description || null,
          industry: industry || null,
          address: address || null,
          city: city || null,
          province: province || null,
          postalCode: postalCode || null,
          country: country || "Indonesia",
          phone: phone || null,
          email: email || null,
          logo: logo || null,
          contactPerson: contactPerson || null,
          contactPhone: contactPhone || null,
          contactEmail: contactEmail || null,
        },
        include: {
          user: {
            select: {
              id: true,
              fullname: true,
              email: true,
              role: true,
            },
          },
        },
      });
    } else {
      // Create new company
      company = await prisma.company.create({
        data: {
          userId,
          name,
          website: website || null,
          description: description || null,
          industry: industry || null,
          address: address || null,
          city: city || null,
          province: province || null,
          postalCode: postalCode || null,
          country: country || "Indonesia",
          phone: phone || null,
          email: email || null,
          logo: logo || null,
          contactPerson: contactPerson || null,
          contactPhone: contactPhone || null,
          contactEmail: contactEmail || null,
          isVerified: false,
        },
        include: {
          user: {
            select: {
              id: true,
              fullname: true,
              email: true,
              role: true,
            },
          },
        },
      });
    }

    return NextResponse.json({ company }, { status: existingCompany ? 200 : 201 });
  } catch (error: any) {
    console.error("Error creating/updating company:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

