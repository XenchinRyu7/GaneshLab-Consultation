"use client";

import { useEffect, useState, useCallback } from "react";

import { CheckCircle, XCircle, Clock, Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import type { Project } from "@/stores/project/project-store";
import { useUserStore } from "@/stores/user/user-provider";

interface PendingProject extends Project {
  client: {
    id: string;
    fullname: string;
    email: string;
  };
}

export default function ProjectApprovalsPage() {
  const currentUser = useUserStore(state => state.currentUser);
  const [pendingProjects, setPendingProjects] = useState<PendingProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [approvingProject, setApprovingProject] = useState<string | null>(null);
  const [decliningProject, setDecliningProject] = useState<string | null>(null);
  const [approvalNote, setApprovalNote] = useState("");
  const [declineNote, setDeclineNote] = useState("");

  const fetchPendingProjects = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/projects/pending?picId=${currentUser?.id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch pending projects");
      }
      const data = await response.json();
      setPendingProjects(data.projects ?? []);
    } catch (error) {
      console.error("Error fetching pending projects:", error);
      toast.error("Failed to load pending projects");
    } finally {
      setLoading(false);
    }
  }, [currentUser?.id]);

  useEffect(() => {
    if (currentUser?.role === "pic" || currentUser?.role === "admin") {
      fetchPendingProjects();
    }
  }, [currentUser?.role, fetchPendingProjects]);

  const handleApprove = async (projectId: string) => {
    if (!approvalNote.trim()) {
      toast.error("Please provide an approval note");
      return;
    }

    setApprovingProject(projectId);
    try {
      const response = await fetch("/api/projects/approve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectId,
          approvalNote: approvalNote.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to approve project");
      }

      toast.success("Project approved successfully");
      setApprovalNote("");
      fetchPendingProjects(); // Refresh the list
    } catch (error) {
      console.error("Error approving project:", error);
      toast.error("Failed to approve project");
    } finally {
      setApprovingProject(null);
    }
  };

  const handleDecline = async (projectId: string) => {
    if (!declineNote.trim()) {
      toast.error("Please provide a reason for declining");
      return;
    }

    setDecliningProject(projectId);
    try {
      const response = await fetch("/api/projects/decline", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectId,
          declineNote: declineNote.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to decline project");
      }

      toast.success("Project declined");
      setDeclineNote("");
      fetchPendingProjects(); // Refresh the list
    } catch (error) {
      console.error("Error declining project:", error);
      toast.error("Failed to decline project");
    } finally {
      setDecliningProject(null);
    }
  };

  if (currentUser?.role !== "pic" && currentUser?.role !== "admin") {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-semibold">Access Denied</h2>
          <p className="text-muted-foreground">
            Only PICs and admins can access project approvals.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Project Approvals</h1>
        <p className="text-muted-foreground">Review and approve projects assigned to you</p>
      </div>

      {pendingProjects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Clock className="text-muted-foreground mb-4 h-12 w-12" />
            <h3 className="text-lg font-semibold">No pending approvals</h3>
            <p className="text-muted-foreground text-center">
              All projects have been reviewed. New projects requiring your approval will appear
              here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {pendingProjects.map(project => (
            <Card key={project.id} className="relative">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{project.name}</CardTitle>
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
                    <Clock className="mr-1 h-3 w-3" />
                    Pending
                  </Badge>
                </div>
                <CardDescription>{project.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Client:</span>{" "}
                    <span className="font-medium">{project.client.fullname}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Type:</span>{" "}
                    <span className="font-medium">{project.type.replace("_", " ")}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Complexity:</span>{" "}
                    <span className="font-medium">{project.complexity}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Priority:</span>{" "}
                    <span className="font-medium">{project.priority}</span>
                  </div>
                  {project.budgetMin && project.budgetMax && (
                    <div>
                      <span className="text-muted-foreground">Budget:</span>{" "}
                      <span className="font-medium">
                        ${project.budgetMin.toLocaleString()} - $
                        {project.budgetMax.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => setApprovingProject(project.id)}
                  disabled={approvingProject === project.id || decliningProject === project.id}
                  className="flex-1"
                >
                  {approvingProject === project.id ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle className="mr-2 h-4 w-4" />
                  )}
                  Approve
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setDecliningProject(project.id)}
                  disabled={approvingProject === project.id || decliningProject === project.id}
                  className="flex-1"
                >
                  {decliningProject === project.id ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <XCircle className="mr-2 h-4 w-4" />
                  )}
                  Decline
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Approval Dialog */}
      <AlertDialog open={!!approvingProject} onOpenChange={() => setApprovingProject(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve Project</AlertDialogTitle>
            <AlertDialogDescription>
              Add an approval note to explain your decision.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Enter approval note..."
              value={approvalNote}
              onChange={e => setApprovalNote(e.target.value)}
              rows={3}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setApprovingProject(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => approvingProject && handleApprove(approvingProject)}
              disabled={!approvalNote.trim()}
            >
              Approve Project
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Decline Dialog */}
      <AlertDialog open={!!decliningProject} onOpenChange={() => setDecliningProject(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Decline Project</AlertDialogTitle>
            <AlertDialogDescription>
              Please provide a reason for declining this project.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Enter reason for declining..."
              value={declineNote}
              onChange={e => setDeclineNote(e.target.value)}
              rows={3}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDecliningProject(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => decliningProject && handleDecline(decliningProject)}
              disabled={!declineNote.trim()}
            >
              Decline Project
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
