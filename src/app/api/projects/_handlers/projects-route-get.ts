/**
 * GET handler for projects API route
 */

import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

import { formatProject } from "../_helpers/projects-route-helpers";

// Common project include options
const projectInclude = {
  client: {
    select: {
      id: true,
      fullname: true,
      email: true,
    },
  },
  pic: {
    select: {
      id: true,
      fullname: true,
      email: true,
    },
  },
  company: {
    select: {
      id: true,
      name: true,
      website: true,
    },
  },
} as const;

/**
 * Get projects for client
 */
async function getClientProjects(userId: string) {
  return prisma.project.findMany({
    where: {
      clientId: userId,
      deletedAt: null,
    },
    include: projectInclude,
    orderBy: {
      updatedAt: "desc",
    },
  });
}

/**
 * Get projects for PIC
 */
async function getPICProjects(userId: string) {
  return prisma.project.findMany({
    where: {
      picId: userId,
      deletedAt: null,
    },
    include: projectInclude,
    orderBy: {
      updatedAt: "desc",
    },
  });
}

/**
 * Get all projects (admin)
 */
async function getAllProjects() {
  return prisma.project.findMany({
    where: {
      deletedAt: null,
    },
    include: projectInclude,
    orderBy: {
      updatedAt: "desc",
    },
  });
}

/**
 * GET /api/projects - Get all projects for the current user
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const role = searchParams.get("role");

    if (!userId || !role) {
      return NextResponse.json({ error: "User ID and role are required" }, { status: 400 });
    }

    let projects;
    if (role === "client") {
      projects = await getClientProjects(userId);
    } else if (role === "pic") {
      projects = await getPICProjects(userId);
    } else {
      projects = await getAllProjects();
    }

    const formattedProjects = projects.map(formatProject);
    return NextResponse.json({ projects: formattedProjects }, { status: 200 });
  } catch (error) {
    console.error("Error fetching projects:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
