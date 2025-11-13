import { NextResponse } from "next/server";

import { getCurrentUser } from "@/app/actions/auth";
import { prisma } from "@/lib/prisma";

// GET /api/companies/check - Check if company profile is complete
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only clients need company profile
    if (user.role !== "client") {
      return NextResponse.json(
        { isComplete: true, message: "Company profile not required for non-clients" },
        { status: 200 }
      );
    }

    // Check if company exists
    const company = await prisma.company.findUnique({
      where: {
        userId: user.id,
      },
    });

    if (!company) {
      return NextResponse.json(
        {
          isComplete: false,
          hasCompany: false,
          message: "Company profile not found. Please complete your company profile first.",
          missingFields: ["name", "address", "phone", "email"],
        },
        { status: 200 }
      );
    }

    // Check required fields
    const requiredFields = {
      name: company.name,
      address: company.address,
      phone: company.phone,
      email: company.email,
    };

    const missingFields: string[] = [];
    Object.entries(requiredFields).forEach(([key, value]) => {
      if (!value || value.trim() === "") {
        missingFields.push(key);
      }
    });

    const isComplete = missingFields.length === 0;

    return NextResponse.json(
      {
        isComplete,
        hasCompany: true,
        message: isComplete
          ? "Company profile is complete"
          : "Company profile is incomplete. Please fill in all required fields.",
        missingFields,
        company: {
          id: company.id,
          name: company.name,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error checking company profile:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
