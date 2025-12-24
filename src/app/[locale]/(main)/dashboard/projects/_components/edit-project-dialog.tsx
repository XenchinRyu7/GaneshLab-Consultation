"use client";

import { useState, useEffect, useCallback } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Project } from "@/stores/project/project-store";

const projectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  description: z.string().optional(),
  picId: z.string().min(1, "PIC is required"),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

interface EditProjectDialogProps {
  project: Project;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Partial<ProjectFormValues>) => void;
}

interface PIC {
  id: string;
  fullname: string;
  email: string;
}

export function EditProjectDialog({
  project,
  open,
  onOpenChange,
  onSubmit,
}: EditProjectDialogProps) {
  const t = useTranslations("Projects");
  const [pics, setPics] = useState<PIC[]>([]);
  const [loading, setLoading] = useState(false);

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: project.name,
      description: project.description ?? "",
      picId: project.picId,
    },
  });

  const fetchPICs = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    if (open) {
      fetchPICs();
      form.reset({
        name: project.name,
        description: project.description ?? "",
        picId: project.picId,
      });
    }
  }, [open, project, form, fetchPICs]);

  function handleSubmit(data: ProjectFormValues) {
    onSubmit(data);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t("editProject")}</DialogTitle>
          <DialogDescription>{t("editProjectDescription")}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("projectName")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("enterProjectName")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("description")}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t("enterProjectDescription")}
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="picId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("picPersonInCharge")}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={loading || project.status !== "PENDING"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("selectPic")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {pics.map(pic => (
                        <SelectItem key={pic.id} value={pic.id}>
                          {pic.fullname} ({pic.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    {project.status !== "PENDING"
                      ? t("picCannotBeChanged")
                      : t("selectPicDescription")}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {t("cancel")}
              </Button>
              <Button type="submit" disabled={loading}>
                {t("saveChanges")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
