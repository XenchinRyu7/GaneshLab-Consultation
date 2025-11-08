"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import type { KanbanTask, TaskStatus } from "./kanban-config";

interface EditCardDialogProps {
  task: KanbanTask;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateCard: (taskId: string, updatedTask: Partial<KanbanTask>) => void;
  availableStatuses: TaskStatus[];
}

function EditCardForm({
  task,
  onUpdateCard,
  onClose,
  availableStatuses,
}: {
  task: KanbanTask;
  onUpdateCard: (taskId: string, updatedTask: Partial<KanbanTask>) => void;
  onClose: () => void;
  availableStatuses: TaskStatus[];
}) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? "");
  const [priority, setPriority] = useState<"low" | "medium" | "high">(task.priority);
  const [assignee, setAssignee] = useState(task.assignee ?? "");
  const [dueDate, setDueDate] = useState(task.dueDate ?? "");
  const [status, setStatus] = useState<TaskStatus>(task.status);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    const trimmedDescription = description.trim();
    const trimmedAssignee = assignee.trim();

    onUpdateCard(task.id, {
      title: title.trim(),
      description: trimmedDescription ? trimmedDescription : undefined,
      status,
      priority,
      assignee: trimmedAssignee ? trimmedAssignee : undefined,
      dueDate: dueDate ? dueDate : undefined,
    });

    onClose();
  }

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>Edit Task</DialogTitle>
        <DialogDescription>Update task details and information.</DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label htmlFor="edit-title">
            Title <span className="text-destructive">*</span>
          </Label>
          <Input
            id="edit-title"
            placeholder="Enter task title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="edit-description">Description</Label>
          <Textarea
            id="edit-description"
            placeholder="Enter task description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="edit-status">Status</Label>
            <Select value={status} onValueChange={(value) => setStatus(value)}>
              <SelectTrigger id="edit-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableStatuses.map((statusId) => (
                  <SelectItem key={statusId} value={statusId}>
                    {statusId.charAt(0).toUpperCase() + statusId.slice(1).replace(/-/g, " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-priority">Priority</Label>
            <Select value={priority} onValueChange={(value) => setPriority(value as typeof priority)}>
              <SelectTrigger id="edit-priority">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="edit-dueDate">Due Date</Label>
            <Input id="edit-dueDate" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-assignee">Assignee</Label>
            <Input
              id="edit-assignee"
              placeholder="Assign to (optional)"
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
            />
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">Update Task</Button>
      </DialogFooter>
    </form>
  );
}

export function EditCardDialog({ task, open, onOpenChange, onUpdateCard, availableStatuses }: EditCardDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent key={task.id}>
        <EditCardForm
          task={task}
          onUpdateCard={onUpdateCard}
          onClose={() => onOpenChange(false)}
          availableStatuses={availableStatuses}
        />
      </DialogContent>
    </Dialog>
  );
}
