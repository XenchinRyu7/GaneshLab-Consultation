"use client";

import { useState, useEffect } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { cleanFormData, convertUndefinedToNull } from "./create-project-dialog-helpers";
import { CreateProjectFormBasic } from "./create-project-form-basic";
import { CreateProjectFormBudget } from "./create-project-form-budget";
import { CreateProjectFormDetails } from "./create-project-form-details";
import { projectSchema, type ProjectFormValues } from "./create-project-schema";

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ProjectFormValues) => void;
}

interface PIC {
  id: string;
  fullname: string;
  email: string;
}

export function CreateProjectDialog({ open, onOpenChange, onSubmit }: CreateProjectDialogProps) {
  const [pics, setPics] = useState<PIC[]>([]);
  const [loading, setLoading] = useState(false);

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: "",
      description: "",
      picId: "",
      type: "OTHER",
      category: "",
      budgetMin: null,
      budgetMax: null,
      complexity: "MEDIUM",
      priority: "MEDIUM",
      timeline: null,
      startDate: null,
      endDate: null,
      technologyStack: "",
      requirements: "",
      features: "",
      deliverables: "",
      clientNotes: "",
    },
  });

  useEffect(() => {
    if (open) {
      fetchPICs();
      form.reset();
    }
  }, [open]);

  async function fetchPICs() {
    try {
      setLoading(true);
      const response = await fetch("/api/projects/pics");
      if (!response.ok) {
        throw new Error("Failed to fetch PICs");
      }
      const data = await response.json();
      setPics(data.pics ?? []);
    } catch (error) {
      console.error("Error fetching PICs:", error);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(data: ProjectFormValues) {
    const cleanedData = cleanFormData(data);
    const finalData = convertUndefinedToNull(cleanedData);
    onSubmit(finalData as ProjectFormValues);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] flex-col sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Create a new project with detailed information. Fill in all required fields.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-1 flex-col">
            <ScrollArea className="flex-1 pr-4">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="basic">Basic</TabsTrigger>
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="budget">Budget & Notes</TabsTrigger>
                </TabsList>

                {/* Basic Information Tab */}
                <TabsContent value="basic" className="mt-4 space-y-4">
                  <CreateProjectFormBasic form={form} pics={pics} loading={loading} />
                </TabsContent>

                {/* Project Details Tab */}
                <TabsContent value="details" className="mt-4 space-y-4">
                  <CreateProjectFormDetails form={form} />
                </TabsContent>

                {/* Budget Tab */}
                <TabsContent value="budget" className="mt-4 space-y-4">
                  <CreateProjectFormBudget form={form} />
                </TabsContent>
              </Tabs>
            </ScrollArea>
            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                Create Project
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
