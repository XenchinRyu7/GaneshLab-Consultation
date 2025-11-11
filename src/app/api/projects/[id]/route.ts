import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Helper function to convert Prisma Decimal to number
function decimalToNumber(value: any): number | null {
  if (value === null || value === undefined) return null;
  return typeof value === "object" && "toNumber" in value ? value.toNumber() : Number(value);
}

// Helper function to format project response
function formatProject(project: any) {
  return {
    ...project,
    budgetMin: decimalToNumber(project.budgetMin),
    budgetMax: decimalToNumber(project.budgetMax),
    estimatedCost: decimalToNumber(project.estimatedCost),
    startDate: project.startDate?.toISOString() || null,
    endDate: project.endDate?.toISOString() || null,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
    deletedAt: project.deletedAt?.toISOString() || null,
  };
}

// GET /api/projects/[id] - Get a single project
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
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
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({ project: formatProject(project) }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching project:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/projects/[id] - Update a project
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const {
      name,
      description,
      picId,
      status,
      type,
      category,
      budgetMin,
      budgetMax,
      estimatedCost,
      complexity,
      priority,
      timeline,
      startDate,
      endDate,
      technologyStack,
      requirements,
      features,
      deliverables,
      companyId,
      progress,
      notes,
      clientNotes,
    } = body;

    // Check if project exists
    const existingProject = await prisma.project.findUnique({
      where: { id },
    });

    if (!existingProject) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // If picId is being updated, verify the PIC exists and has the correct role
    if (picId && picId !== existingProject.picId) {
      const pic = await prisma.userProfile.findUnique({
        where: { id: picId },
      });

      if (!pic) {
        return NextResponse.json({ error: "PIC not found" }, { status: 404 });
      }

      if (pic.role !== "pic") {
        return NextResponse.json({ error: "Selected user is not a PIC" }, { status: 400 });
      }
    }

    // Validate status if provided
    if (
      status &&
      !["active", "completed", "cancelled", "pending", "on_hold"].includes(status)
    ) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // Validate budget range
    if (budgetMin !== undefined && budgetMax !== undefined) {
      if (budgetMin !== null && budgetMax !== null && budgetMin > budgetMax) {
        return NextResponse.json(
          { error: "Budget minimum cannot be greater than budget maximum" },
          { status: 400 }
        );
      }
    }

    // Validate progress (0-100)
    if (progress !== undefined && (progress < 0 || progress > 100)) {
      return NextResponse.json(
        { error: "Progress must be between 0 and 100" },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (picId !== undefined) updateData.picId = picId;
    if (status !== undefined) updateData.status = status;
    if (type !== undefined) updateData.type = type;
    if (category !== undefined) updateData.category = category;
    if (budgetMin !== undefined) updateData.budgetMin = budgetMin !== null ? budgetMin : null;
    if (budgetMax !== undefined) updateData.budgetMax = budgetMax !== null ? budgetMax : null;
    if (estimatedCost !== undefined)
      updateData.estimatedCost = estimatedCost !== null ? estimatedCost : null;
    if (complexity !== undefined) updateData.complexity = complexity;
    if (priority !== undefined) updateData.priority = priority;
    if (timeline !== undefined) updateData.timeline = timeline !== null ? timeline : null;
    if (startDate !== undefined) updateData.startDate = startDate ? new Date(startDate) : null;
    if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null;
    if (technologyStack !== undefined) updateData.technologyStack = technologyStack || null;
    if (requirements !== undefined) updateData.requirements = requirements || null;
    if (features !== undefined) updateData.features = features || null;
    if (deliverables !== undefined) updateData.deliverables = deliverables || null;
    if (companyId !== undefined) updateData.companyId = companyId || null;
    if (progress !== undefined) updateData.progress = progress;
    if (notes !== undefined) updateData.notes = notes || null;
    if (clientNotes !== undefined) updateData.clientNotes = clientNotes || null;

    const project = await prisma.project.update({
      where: { id },
      data: updateData,
      include: {
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
      },
    });

    return NextResponse.json({ project: formatProject(project) }, { status: 200 });
  } catch (error: any) {
    console.error("Error updating project:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/projects/[id] - Delete a project (soft delete)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if project exists
    const existingProject = await prisma.project.findUnique({
      where: { id },
    });

    if (!existingProject) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Soft delete by setting deletedAt
    await prisma.project.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        status: "cancelled",
      },
    });

    return NextResponse.json({ message: "Project deleted successfully" }, { status: 200 });
  } catch (error: any) {
    console.error("Error deleting project:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

