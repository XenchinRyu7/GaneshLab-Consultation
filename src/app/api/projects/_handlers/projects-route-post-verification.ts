/**
 * Verification functions for POST projects handler
 */

import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

/**
 * Verify client exists and get with company
 */
export async function verifyClient(clientId: string) {
  const client = await prisma.userProfile.findUnique({
    where: { id: clientId },
    include: {
      company: true,
    },
  });

  if (!client) {
    return {
      error: NextResponse.json({ error: "Client not found" }, { status: 404 }),
      client: null,
    };
  }

  return { error: null, client };
}

/**
 * Verify PIC exists and has correct role
 */
export async function verifyPIC(picId: string) {
  const pic = await prisma.userProfile.findUnique({
    where: { id: picId },
  });

  if (!pic) {
    return {
      error: NextResponse.json({ error: "PIC not found" }, { status: 404 }),
      pic: null,
    };
  }

  if (pic.role !== "pic") {
    return {
      error: NextResponse.json({ error: "Selected user is not a PIC" }, { status: 400 }),
      pic: null,
    };
  }

  return { error: null, pic };
}

/**
 * Verify client has complete company profile
 */
export function verifyCompanyProfile(
  client: {
    company: {
      name: string;
      address: string | null;
      phone: string | null;
      email: string | null;
    } | null;
  } | null
) {
  if (!client?.company) {
    return {
      error: NextResponse.json(
        { error: "Company profile not found. Please complete your company profile first." },
        { status: 400 }
      ),
      missingFields: null,
    };
  }

  const requiredFields = {
    name: client.company.name,
    address: client.company.address ?? "",
    phone: client.company.phone ?? "",
    email: client.company.email ?? "",
  };

  const missingFields: string[] = [];
  Object.entries(requiredFields).forEach(([key, value]) => {
    if (!value || value.trim() === "") {
      missingFields.push(key);
    }
  });

  if (missingFields.length > 0) {
    return {
      error: NextResponse.json(
        {
          error: "Company profile is incomplete. Please complete all required fields first.",
          missingFields,
        },
        { status: 400 }
      ),
      missingFields,
    };
  }

  return { error: null, missingFields: null };
}
