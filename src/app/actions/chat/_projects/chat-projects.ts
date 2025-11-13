"use server";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Get client's projects
export async function getClientProjects(): Promise<{
  projects: Array<{ id: string; name: string; picId: string; picName: string }>;
  error?: string;
}> {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "client") {
      return { projects: [], error: "Unauthorized" };
    }

    const projects = await prisma.project.findMany({
      where: {
        clientId: user.id,
        status: "active",
      },
      include: {
        pic: {
          select: { id: true, fullname: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return {
      projects: projects.map(project => ({
        id: project.id,
        name: project.name,
        picId: project.picId,
        picName: project.pic.fullname,
      })),
    };
  } catch (error) {
    console.error("Error fetching projects:", error);
    return { projects: [], error: "Failed to fetch projects" };
  }
}
