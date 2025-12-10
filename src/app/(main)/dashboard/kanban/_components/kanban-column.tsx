"use client";

import { useState } from "react";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { MoreHorizontal, Plus, Trash2 } from "lucide-react";

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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

import { AddCardDialog } from "./add-card-dialog";
import { KanbanCard } from "./kanban-card";
import type { KanbanColumn as KanbanColumnType, KanbanTask } from "./kanban-config";

interface KanbanColumnProps {
  column: KanbanColumnType;
  tasks: KanbanTask[];
  onAddCard: (task: Omit<KanbanTask, "id">) => void;
  onCardClick?: (task: KanbanTask) => void;
  onDeleteBoard?: (boardId: string) => void;
  canManageBoards?: boolean;
}

export function KanbanColumn({
  column,
  tasks,
  onAddCard,
  onCardClick,
  onDeleteBoard,
  canManageBoards,
}: KanbanColumnProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  const taskIds = tasks.map(task => task.id);

  const handleDeleteBoard = () => {
    if (onDeleteBoard) {
      setShowDeleteDialog(true);
    }
  };

  const confirmDelete = () => {
    if (onDeleteBoard) {
      onDeleteBoard(column.id);
      setShowDeleteDialog(false);
    }
  };

  return (
    <div className="flex h-full max-w-[320px] min-w-[280px] flex-col">
      <Card className="flex h-full flex-col">
        <CardHeader className="border-b pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="size-2 rounded-full" style={{ backgroundColor: column.color }} />
              <CardTitle className="text-base font-semibold">{column.title}</CardTitle>
              <Badge variant="secondary" className="text-xs">
                {tasks.length}
              </Badge>
            </div>
            <div className="flex items-center gap-1">
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
              {canManageBoards && !column.isDefault && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="focus-visible:ring-ring hover:bg-accent hover:text-accent-foreground inline-flex h-7 w-7 items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
                      aria-label="Board options"
                    >
                      <MoreHorizontal className="size-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={handleDeleteBoard}
                      className="text-destructive focus:text-destructive"
                      disabled={tasks.length > 0}
                    >
                      <Trash2 className="mr-2 size-4" />
                      Delete Board
                      {tasks.length > 0 && " (Move tasks first)"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent
          ref={setNodeRef}
          className={cn(
            "flex-1 space-y-3 overflow-y-auto p-4 transition-colors",
            isOver && "bg-muted/50"
          )}
        >
          <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
            {tasks.length === 0 ? (
              <div className="text-muted-foreground flex h-32 items-center justify-center rounded-lg border-2 border-dashed text-sm">
                Drop tasks here
              </div>
            ) : (
              tasks.map(task => <KanbanCard key={task.id} task={task} onCardClick={onCardClick} />)
            )}
          </SortableContext>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Board</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the &quot;{column.title}&quot; board? This action
              cannot beundone.
              {tasks.length > 0 && " You must move or delete all tasks in this board first."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={tasks.length > 0}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Board
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
