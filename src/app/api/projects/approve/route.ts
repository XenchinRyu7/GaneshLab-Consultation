import { NextRequest, NextResponse } from "next/server";

import { approveProject } from "@/app/actions/projects";

export async function POST(request: NextRequest) {
  try {
    const { projectId, approvalNote } = await request.json();

    if (!projectId) {
      return NextResponse.json({ error: "Project ID is required" }, { status: 400 });
    }

    const result = await approveProject(projectId, approvalNote);

    if (result.success) {
      return NextResponse.json({
        success: true,
        project: result.project,
      });
    } else {
      return NextResponse.json(
        { error: result.error ?? "Failed to approve project" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error approving project:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
