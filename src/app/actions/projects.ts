"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PIC approves a project
export async function approveProject(projectId: string, approvalNote?: string) {
  const headersList = await headers();
  const ipAddress = headersList.get("x-forwarded-for") ?? headersList.get("x-real-ip") ?? "unknown";
  const userAgent = headersList.get("user-agent") ?? "unknown";

  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "pic") {
      throw new Error("Only PICs can approve projects");
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { picId: true, status: true },
    });

    if (!project) {
      throw new Error("Project not found");
    }

    if (project.picId !== user.id) {
      throw new Error("You can only approve projects assigned to you");
    }

    if (project.status !== "PENDING") {
      throw new Error("Project is not in pending status");
    }

    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        status: "APPROVED",
        picApprovedAt: new Date(),
        picApprovalNote: approvalNote,
      },
      include: {
        client: { select: { email: true, fullname: true } },
        pic: { select: { email: true, fullname: true } },
      },
    });

    // Log successful project approval
    try {
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: "APPROVE_PROJECT",
          entityType: "PROJECT",
          entityId: projectId,
          details: {
            projectName: updatedProject.name,
            clientEmail: updatedProject.client.email,
            approvalNote,
          },
          ipAddress,
          userAgent,
          success: true,
        },
      });
    } catch (logError) {
      console.error("[approveProject] Failed to log approval:", logError);
    }

    revalidatePath("/projects");
    revalidatePath("/dashboard");

    return { success: true, project: updatedProject };
  } catch (error) {
    console.error("Error approving project:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to approve project",
    };
  }
}

// PIC declines a project
export async function declineProject(projectId: string, declineNote: string) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "pic") {
      throw new Error("Only PICs can decline projects");
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { picId: true, status: true },
    });

    if (!project) {
      throw new Error("Project not found");
    }

    if (project.picId !== user.id) {
      throw new Error("You can only decline projects assigned to you");
    }

    if (project.status !== "PENDING") {
      throw new Error("Project is not in pending status");
    }

    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        status: "DECLINED",
        picDeclinedAt: new Date(),
        picApprovalNote: declineNote,
      },
      include: {
        client: { select: { email: true, fullname: true } },
        pic: { select: { email: true, fullname: true } },
      },
    });

    revalidatePath("/projects");
    revalidatePath("/dashboard");

    return { success: true, project: updatedProject };
  } catch (error) {
    console.error("Error declining project:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to decline project",
    };
  }
}

// Calculate project progress based on kanban tasks
export async function calculateProjectProgress(projectId: string): Promise<number> {
  try {
    const tasks = await prisma.kanbanTask.findMany({
      where: { projectId },
      select: {
        board: {
          select: { title: true },
        },
      },
    });

    if (tasks.length === 0) return 0;

    const completedTasks = tasks.filter(task => task.board.title === "DONE").length;
    const progress = Math.round((completedTasks / tasks.length) * 100);

    // Update project progress
    await prisma.project.update({
      where: { id: projectId },
      data: { progress },
    });

    return progress;
  } catch (error) {
    console.error("Error calculating project progress:", error);
    return 0;
  }
}

// Update project status (only for PICs on their projects)
export async function updateProjectStatus(
  projectId: string,
  status: "ACTIVE" | "COMPLETED" | "ON_MAINTAIN" | "CANCELLED"
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error("Authentication required");
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { picId: true, clientId: true, status: true },
    });

    if (!project) {
      throw new Error("Project not found");
    }

    // Only PIC can update status for approved projects, client can only cancel
    if (user.role === "pic" && project.picId === user.id) {
      // PIC can update status for approved/active projects
      if (!["APPROVED", "ACTIVE"].includes(project.status)) {
        throw new Error("Project must be approved or active to update status");
      }
    } else if (user.role === "client" && project.clientId === user.id) {
      // Client can only cancel pending/approved projects
      if (!["PENDING", "APPROVED"].includes(project.status) || status !== "CANCELLED") {
        throw new Error("Clients can only cancel pending or approved projects");
      }
    } else {
      throw new Error("Unauthorized to update project status");
    }

    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        status,
        ...(status === "COMPLETED" && { endDate: new Date() }),
      },
      include: {
        client: { select: { email: true, fullname: true } },
        pic: { select: { email: true, fullname: true } },
      },
    });

    // Recalculate progress if project is completed
    if (status === "COMPLETED") {
      await calculateProjectProgress(projectId);
    }

    revalidatePath("/projects");
    revalidatePath("/dashboard");

    return { success: true, project: updatedProject };
  } catch (error) {
    console.error("Error updating project status:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update project status",
    };
  }
}
