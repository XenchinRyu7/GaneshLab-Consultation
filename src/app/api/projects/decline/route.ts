import { NextRequest, NextResponse } from "next/server";

import { declineProject } from "@/app/actions/projects";

export async function POST(request: NextRequest) {
  try {
    const { projectId, declineNote } = await request.json();

    if (!projectId) {
      return NextResponse.json({ error: "Project ID is required" }, { status: 400 });
    }

    const result = await declineProject(projectId, declineNote);

    if (result.success) {
      return NextResponse.json({
        success: true,
        project: result.project,
      });
    } else {
      return NextResponse.json(
        { error: result.error ?? "Failed to decline project" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error declining project:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
