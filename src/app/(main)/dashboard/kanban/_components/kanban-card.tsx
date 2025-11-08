"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { format } from "date-fns";
import { Calendar, GripVertical, User } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import type { KanbanTask } from "./kanban-config";

interface KanbanCardProps {
  task: KanbanTask;
  onCardClick?: (task: KanbanTask) => void;
}

const priorityColors = {
  low: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  medium: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  high: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export function KanbanCard({ task, onCardClick }: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  function handleCardClick(e: React.MouseEvent) {
    // Don't trigger click if dragging or clicking on drag handle
    if (isDragging) return;
    e.stopPropagation();
    onCardClick?.(task);
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={handleCardClick}
      className={cn(
        "group cursor-grab transition-shadow hover:shadow-md active:cursor-grabbing",
        isDragging && "opacity-50 shadow-lg",
        onCardClick && "cursor-pointer",
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <h4 className="flex-1 text-sm leading-tight font-semibold">{task.title}</h4>
          <div
            className="text-muted-foreground pointer-events-none flex-shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
            aria-label="Drag handle"
          >
            <GripVertical className="size-4" />
          </div>
        </div>
        {task.description && <p className="text-muted-foreground mt-2 line-clamp-2 text-xs">{task.description}</p>}
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        {task.tags && task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {task.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
        <div className="flex items-center justify-between gap-2 pt-1">
          <div className="text-muted-foreground flex min-w-0 flex-1 items-center gap-3 text-xs">
            {task.assignee && (
              <div className="flex flex-shrink-0 items-center gap-1.5">
                <User className="size-3.5 flex-shrink-0" />
                <span className="max-w-[100px] truncate">{task.assignee}</span>
              </div>
            )}
            {task.dueDate && (
              <div className="flex flex-shrink-0 items-center gap-1.5">
                <Calendar className="size-3.5 flex-shrink-0" />
                <span className="whitespace-nowrap">{format(new Date(task.dueDate), "MMM d")}</span>
              </div>
            )}
          </div>
          <Badge variant="outline" className={cn("flex-shrink-0 text-xs", priorityColors[task.priority])}>
            {task.priority}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
