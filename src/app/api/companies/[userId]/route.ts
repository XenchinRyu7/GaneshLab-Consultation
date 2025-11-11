import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/companies/[userId] - Get company by user ID
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

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

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    return NextResponse.json({ company }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching company:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/companies/[userId] - Update company
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const body = await req.json();
    const {
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
      taxId,
      logo,
      contactPerson,
      contactPhone,
      contactEmail,
      isVerified,
    } = body;

    // Check if company exists
    const existingCompany = await prisma.company.findUnique({
      where: { userId },
    });

    if (!existingCompany) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (website !== undefined) updateData.website = website || null;
    if (description !== undefined) updateData.description = description || null;
    if (industry !== undefined) updateData.industry = industry || null;
    if (address !== undefined) updateData.address = address || null;
    if (city !== undefined) updateData.city = city || null;
    if (province !== undefined) updateData.province = province || null;
    if (postalCode !== undefined) updateData.postalCode = postalCode || null;
    if (country !== undefined) updateData.country = country || "Indonesia";
    if (phone !== undefined) updateData.phone = phone || null;
    if (email !== undefined) updateData.email = email || null;
    if (taxId !== undefined) updateData.taxId = taxId || null;
    if (logo !== undefined) updateData.logo = logo || null;
    if (contactPerson !== undefined) updateData.contactPerson = contactPerson || null;
    if (contactPhone !== undefined) updateData.contactPhone = contactPhone || null;
    if (contactEmail !== undefined) updateData.contactEmail = contactEmail || null;
    if (isVerified !== undefined) updateData.isVerified = isVerified;

    const company = await prisma.company.update({
      where: { userId },
      data: updateData,
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
    console.error("Error updating company:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

