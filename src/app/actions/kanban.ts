"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import { calculateProjectProgress } from "./projects";

async function normalizeBoardPositions(boardId: string) {
  const tasks = await prisma.kanbanTask.findMany({
    where: { boardId },
    orderBy: { position: "asc" },
  });

  for (let i = 0; i < tasks.length; i++) {
    if (tasks[i].position !== i) {
      await prisma.kanbanTask.update({
        where: { id: tasks[i].id },
        data: { position: i },
      });
    }
  }
}

// Create a new kanban task
export async function createKanbanTask(formData: FormData) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error("Authentication required");
    }

    const projectId = formData.get("projectId") as string;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const priority = formData.get("priority") as "LOW" | "MEDIUM" | "HIGH";
    const assigneeId = formData.get("assigneeId") as string;
    const tags = JSON.parse((formData.get("tags") as string) || "[]");
    const dueDate = formData.get("dueDate") as string;
    const estimatedHours = formData.get("estimatedHours") as string;

    if (!projectId || !title) {
      throw new Error("Project ID and title are required");
    }

    // Verify user has access to this project
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { clientId: true, picId: true, status: true },
    });

    if (!project) {
      throw new Error("Project not found");
    }

    if (project.clientId !== user.id && project.picId !== user.id) {
      throw new Error("You don't have access to this project");
    }

    // Get default TODO board or create if not exists
    let todoBoard = await prisma.kanbanBoard.findFirst({
      where: {
        projectId,
        title: "TODO",
      },
    });

    todoBoard ??= await prisma.kanbanBoard.create({
      data: {
        title: "TODO",
        projectId,
        position: 0,
        color: "#gray",
      },
    });

    // Get next position in board
    const lastTask = await prisma.kanbanTask.findFirst({
      where: { boardId: todoBoard.id },
      orderBy: { position: "desc" },
    });

    const nextPosition = (lastTask?.position ?? -1) + 1;

    const task = await prisma.kanbanTask.create({
      data: {
        title,
        description: description || null,
        priority,
        assigneeId: assigneeId || null,
        projectId,
        boardId: todoBoard.id,
        position: nextPosition,
        tags,
        dueDate: dueDate ? new Date(dueDate) : null,
        estimatedHours: estimatedHours ? parseInt(estimatedHours) : null,
        createdBy: user.id,
      },
      include: {
        assignee: { select: { fullname: true } },
      },
    });

    // Recalculate project progress
    await calculateProjectProgress(projectId);

    revalidatePath(`/kanban/${projectId}`);
    revalidatePath("/projects");

    return { success: true, task };
  } catch (error) {
    console.error("Error creating kanban task:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create task",
    };
  }
}

// Update kanban task status
export async function updateKanbanTaskStatus(
  taskId: string,
  status: "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE"
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error("Authentication required");
    }

    const task = await prisma.kanbanTask.findUnique({
      where: { id: taskId },
      select: { projectId: true, assigneeId: true, boardId: true },
    });

    if (!task) {
      throw new Error("Task not found");
    }

    // Verify user has access to this project
    const project = await prisma.project.findUnique({
      where: { id: task.projectId },
      select: { clientId: true, picId: true },
    });

    if (!project || (project.clientId !== user.id && project.picId !== user.id)) {
      throw new Error("You don't have access to this project");
    }

    const now = new Date();
    const updateData: {
      boardId: string;
      startedAt?: Date;
      completedAt?: Date;
    } = {
      boardId: status,
    };

    // Set timestamps based on status changes
    if (status === "IN_PROGRESS" && task.boardId !== "IN_PROGRESS") {
      updateData.startedAt = now;
    } else if (status === "DONE" && task.boardId !== "DONE") {
      updateData.completedAt = now;
    }

    const updatedTask = await prisma.kanbanTask.update({
      where: { id: taskId },
      data: updateData,
      include: {
        assignee: { select: { fullname: true } },
      },
    });

    // Recalculate project progress
    await calculateProjectProgress(task.projectId);

    revalidatePath(`/kanban/${task.projectId}`);
    revalidatePath("/projects");

    return { success: true, task: updatedTask };
  } catch (error) {
    console.error("Error updating kanban task status:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update task status",
    };
  }
}

// Update kanban task details
export async function updateKanbanTask(
  taskId: string,
  updates: {
    title?: string;
    description?: string;
    priority?: "LOW" | "MEDIUM" | "HIGH";
    assigneeId?: string;
    tags?: string[];
    dueDate?: string;
    estimatedHours?: number;
  }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error("Authentication required");
    }

    const task = await prisma.kanbanTask.findUnique({
      where: { id: taskId },
      select: { projectId: true },
    });

    if (!task) {
      throw new Error("Task not found");
    }

    // Verify user has access to this project
    const project = await prisma.project.findUnique({
      where: { id: task.projectId },
      select: { clientId: true, picId: true },
    });

    if (!project || (project.clientId !== user.id && project.picId !== user.id)) {
      throw new Error("You don't have access to this project");
    }

    const updateData: Record<string, unknown> = {};
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.priority !== undefined) updateData.priority = updates.priority;
    if (updates.assigneeId !== undefined) updateData.assigneeId = updates.assigneeId;
    if (updates.tags !== undefined) updateData.tags = updates.tags;
    if (updates.dueDate !== undefined)
      updateData.dueDate = updates.dueDate ? new Date(updates.dueDate) : null;
    if (updates.estimatedHours !== undefined) updateData.estimatedHours = updates.estimatedHours;

    const updatedTask = await prisma.kanbanTask.update({
      where: { id: taskId },
      data: updateData,
      include: {
        assignee: { select: { fullname: true } },
      },
    });

    revalidatePath(`/kanban/${task.projectId}`);
    revalidatePath("/projects");

    return { success: true, task: updatedTask };
  } catch (error) {
    console.error("Error updating kanban task:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update task",
    };
  }
}

// Delete kanban task
export async function deleteKanbanTask(taskId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error("Authentication required");
    }

    const task = await prisma.kanbanTask.findUnique({
      where: { id: taskId },
      select: { projectId: true, createdBy: true, boardId: true },
    });

    if (!task) {
      throw new Error("Task not found");
    }

    // Only task creator can delete (or PIC/client of the project)
    if (task.createdBy !== user.id) {
      const project = await prisma.project.findUnique({
        where: { id: task.projectId },
        select: { clientId: true, picId: true },
      });

      if (!project || (project.clientId !== user.id && project.picId !== user.id)) {
        throw new Error("You don't have permission to delete this task");
      }
    }

    await prisma.kanbanTask.delete({
      where: { id: taskId },
    });

    // Normalize positions in the board after deletion
    await normalizeBoardPositions(task.boardId);

    // Recalculate project progress
    await calculateProjectProgress(task.projectId);

    revalidatePath(`/kanban/${task.projectId}`);
    revalidatePath("/projects");

    return { success: true };
  } catch (error) {
    console.error("Error deleting kanban task:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete task",
    };
  }
}
