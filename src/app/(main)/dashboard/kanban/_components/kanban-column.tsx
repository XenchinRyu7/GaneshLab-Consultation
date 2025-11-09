"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import { AddCardDialog } from "./add-card-dialog";
import { KanbanCard } from "./kanban-card";
import type { KanbanColumn as KanbanColumnType, KanbanTask } from "./kanban-config";

interface KanbanColumnProps {
  column: KanbanColumnType;
  tasks: KanbanTask[];
  onAddCard: (task: Omit<KanbanTask, "id">) => void;
  onCardClick?: (task: KanbanTask) => void;
}

export function KanbanColumn({ column, tasks, onAddCard, onCardClick }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  const taskIds = tasks.map((task) => task.id);

  return (
    <div className="flex h-full max-w-[320px] min-w-[280px] flex-col">
      <Card className="flex h-full flex-col">
        <CardHeader className="border-b pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={cn("size-2 rounded-full", column.color)} />
              <CardTitle className="text-base font-semibold">{column.title}</CardTitle>
              <Badge variant="secondary" className="text-xs">
                {tasks.length}
              </Badge>
            </div>
            <AddCardDialog
              columnId={column.id}
              onAddCard={onAddCard}
              trigger={
                <button
                  className="focus-visible:ring-ring hover:bg-accent hover:text-accent-foreground inline-flex h-7 w-7 items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
                  aria-label="Add task"
                >
                  <Plus className="size-4" />
                </button>
              }
            />
          </div>
        </CardHeader>
        <CardContent
          ref={setNodeRef}
          className={cn("flex-1 space-y-3 overflow-y-auto p-4 transition-colors", isOver && "bg-muted/50")}
        >
          <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
            {tasks.length === 0 ? (
              <div className="text-muted-foreground flex h-32 items-center justify-center rounded-lg border-2 border-dashed text-sm">
                Drop tasks here
              </div>
            ) : (
              tasks.map((task) => <KanbanCard key={task.id} task={task} onCardClick={onCardClick} />)
            )}
          </SortableContext>
        </CardContent>
      </Card>
    </div>
  );
}
