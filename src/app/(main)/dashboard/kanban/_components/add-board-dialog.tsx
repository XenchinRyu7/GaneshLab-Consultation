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

import { columnColors, type KanbanColumn } from "./kanban-config";

interface AddBoardDialogProps {
  onAddBoard: (board: Omit<KanbanColumn, "id"> & { id?: string }) => void;
  existingIds: string[];
}

export function AddBoardDialog({ onAddBoard, existingIds }: AddBoardDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [color, setColor] = useState(columnColors[0]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    const newId = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    // Ensure unique ID
    let finalId = newId;
    let counter = 1;
    while (existingIds.includes(finalId)) {
      finalId = `${newId}-${counter}`;
      counter++;
    }

    onAddBoard({
      id: finalId,
      title: title.trim(),
      color,
    });

    // Reset form
    setTitle("");
    setColor(columnColors[0]);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <span>+</span>
          <span>Add Board</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Board</DialogTitle>
            <DialogDescription>Create a new column board for your Kanban.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="board-title">
                Board Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="board-title"
                placeholder="e.g., Backlog, Testing, etc."
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="board-color">Color</Label>
              <Select value={color} onValueChange={setColor}>
                <SelectTrigger id="board-color">
                  <SelectValue>
                    <div className="flex items-center gap-2">
                      <div className="size-3 rounded-full" style={{ backgroundColor: color }} />
                      <span>{color}</span>
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {columnColors.map(col => (
                    <SelectItem key={col} value={col}>
                      <div className="flex items-center gap-2">
                        <div className="size-3 rounded-full" style={{ backgroundColor: col }} />
                        <span>{col}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Board</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
