"use client";

import { useState } from "react";

import { Calendar } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import type { milestoneTask, TaskStatus } from "./milestone-config";

interface AddCardDialogProps {
  columnId: TaskStatus;
  onAddCard: (task: Omit<milestoneTask, "id">) => void;
  trigger?: React.ReactNode;
}

export function AddCardDialog({ columnId, onAddCard, trigger }: AddCardDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [assignee, setAssignee] = useState("");
  const [dueDate, setDueDate] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    const trimmedDescription = description.trim();
    const trimmedAssignee = assignee.trim();

    onAddCard({
      title: title.trim(),
      description: trimmedDescription ? trimmedDescription : undefined,
      status: columnId,
      priority,
      assignee: trimmedAssignee ? trimmedAssignee : undefined,
      dueDate: dueDate ? dueDate : undefined,
      tags: [],
    });

    // Reset form
    setTitle("");
    setDescription("");
    setPriority("medium");
    setAssignee("");
    setDueDate("");
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="ghost" size="icon" className="size-7">
            <Calendar className="size-4" />
            <span className="sr-only">Add task</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
            <DialogDescription>Create a new task card for this column.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                placeholder="Enter task title"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter task description (optional)"
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={priority}
                  onValueChange={value => setPriority(value as typeof priority)}
                >
                  <SelectTrigger id="priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="assignee">Assignee</Label>
              <Input
                id="assignee"
                placeholder="Assign to (optional)"
                value={assignee}
                onChange={e => setAssignee(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Task</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
