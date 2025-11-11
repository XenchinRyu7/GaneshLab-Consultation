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

// GET /api/projects - Get all projects for the current user
export async function GET(req: NextRequest) {
  try {
    // TODO: Get user from session/auth
    // For now, we'll get all projects (will be filtered by role in the future)
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const role = searchParams.get("role"); // "client" | "pic"

    if (!userId || !role) {
      return NextResponse.json({ error: "User ID and role are required" }, { status: 400 });
    }

    let projects;
    if (role === "client") {
      projects = await prisma.project.findMany({
        where: {
          clientId: userId,
          deletedAt: null, // Exclude soft-deleted projects
        },
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
        orderBy: {
          updatedAt: "desc",
        },
      });
    } else if (role === "pic") {
      projects = await prisma.project.findMany({
        where: {
          picId: userId,
          deletedAt: null, // Exclude soft-deleted projects
        },
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
        orderBy: {
          updatedAt: "desc",
        },
      });
    } else {
      // Admin can see all projects (including soft-deleted)
      projects = await prisma.project.findMany({
        where: {
          deletedAt: null, // Exclude soft-deleted projects by default
        },
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
        orderBy: {
          updatedAt: "desc",
        },
      });
    }

    // Format projects to convert Decimal to number
    const formattedProjects = projects.map(formatProject);
    return NextResponse.json({ projects: formattedProjects }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching projects:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Helper function to convert Prisma Decimal to number


// POST /api/projects - Create a new project
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      description,
      clientId,
      picId,
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
      notes,
      clientNotes,
    } = body;

    if (!name || !clientId || !picId) {
      return NextResponse.json(
        { error: "Name, clientId, and picId are required" },
        { status: 400 }
      );
    }

    // Verify client and PIC exist
    const client = await prisma.userProfile.findUnique({
      where: { id: clientId },
      include: {
        company: true,
      },
    });

    const pic = await prisma.userProfile.findUnique({
      where: { id: picId },
    });

    if (!client) {
      console.error("Client not found:", clientId);
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    if (!pic) {
      console.error("PIC not found:", picId);
      return NextResponse.json({ error: "PIC not found" }, { status: 404 });
    }

    // Verify PIC role
    if (pic.role !== "pic") {
      console.error("Selected user is not a PIC:", picId, pic.role);
      return NextResponse.json({ error: "Selected user is not a PIC" }, { status: 400 });
    }

    // Verify client has complete company profile
    if (!client.company) {
      console.error("Client company profile not found:", clientId);
      return NextResponse.json(
        { error: "Company profile not found. Please complete your company profile first." },
        { status: 400 }
      );
    }

    // Check required company fields
    const requiredFields = {
      name: client.company.name,
      address: client.company.address,
      phone: client.company.phone,
      email: client.company.email,
    };

    const missingFields: string[] = [];
    Object.entries(requiredFields).forEach(([key, value]) => {
      if (!value || value.trim() === "") {
        missingFields.push(key);
      }
    });

    if (missingFields.length > 0) {
      console.error("Company profile incomplete. Missing fields:", missingFields);
      return NextResponse.json(
        {
          error: "Company profile is incomplete. Please complete all required fields first.",
          missingFields,
        },
        { status: 400 }
      );
    }

    // Get companyId from client's company
    const finalCompanyId = companyId || client.company.id;

    // Validate budget range
    if (budgetMin !== null && budgetMax !== null && budgetMin > budgetMax) {
      return NextResponse.json(
        { error: "Budget minimum cannot be greater than budget maximum" },
        { status: 400 }
      );
    }

    const project = await prisma.project.create({
      data: {
        name,
        description: description || null,
        clientId,
        picId,
        status: "pending", // New projects start as pending
        type: type || "OTHER",
        category: category || null,
        budgetMin: budgetMin !== undefined && budgetMin !== null ? budgetMin : null,
        budgetMax: budgetMax !== undefined && budgetMax !== null ? budgetMax : null,
        estimatedCost: estimatedCost !== undefined && estimatedCost !== null ? estimatedCost : null,
        complexity: complexity || "MEDIUM",
        priority: priority || "MEDIUM",
        timeline: timeline !== undefined && timeline !== null ? timeline : null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        technologyStack: technologyStack || null,
        requirements: requirements || null,
        features: features || null,
        deliverables: deliverables || null,
        companyId: finalCompanyId,
        notes: notes || null,
        clientNotes: clientNotes || null,
        progress: 0,
      },
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
      },
    });

    return NextResponse.json({ project: formatProject(project) }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating project:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

