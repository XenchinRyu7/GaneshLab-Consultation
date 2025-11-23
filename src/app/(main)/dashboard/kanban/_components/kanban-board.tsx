"use client";

import { useState } from "react";

import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { AddBoardDialog } from "./add-board-dialog";
import { EditCardDialog } from "./edit-card-dialog";
import { useKanbanActions } from "./hooks/use-kanban-actions";
import { useKanbanData } from "./hooks/use-kanban-data";
import { KanbanBoardContent } from "./kanban-board-content";
import type { KanbanTask, TaskStatus } from "./kanban-config";

interface KanbanBoardProps {
  projectId: string;
}

export function KanbanBoard({ projectId }: KanbanBoardProps) {
  const handleSuccess = (message: string) => {
    toast.success(message);
  };

  const handleError = (message: string) => {
    toast.error(message);
  };

  const { columns, setColumns, tasks, setTasks, isLoading } = useKanbanData({
    projectId,
    onError: handleError,
  });

  const { handleAddCard, handleAddBoard, handleUpdateCard, handleMoveTask } = useKanbanActions({
    projectId,
    columns,
    setColumns,
    setTasks,
    onSuccess: handleSuccess,
    onError: handleError,
  });

  const [editingTask, setEditingTask] = useState<KanbanTask | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  function handleCardClick(task: KanbanTask) {
    setEditingTask(task);
    setIsEditDialogOpen(true);
  }

  async function handleUpdate(taskId: string, updatedTask: Partial<KanbanTask>) {
    const success = await handleUpdateCard(taskId, updatedTask);
    if (success) {
      setIsEditDialogOpen(false);
      setEditingTask(null);
    }
  }

  const existingIds = columns.map(col => col.id);
  const availableStatuses: TaskStatus[] = columns.map(col => col.id);

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-16rem)] items-center justify-center">
        <Loader2 className="text-muted-foreground size-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-end">
        <AddBoardDialog onAddBoard={handleAddBoard} existingIds={existingIds} />
      </div>

      <KanbanBoardContent
        columns={columns}
        tasks={tasks}
        setTasks={setTasks}
        onAddCard={handleAddCard}
        onCardClick={handleCardClick}
        onMoveTask={handleMoveTask}
      />

      {editingTask && (
        <EditCardDialog
          task={editingTask}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onUpdateCard={handleUpdate}
          availableStatuses={availableStatuses}
        />
      )}
    </div>
  );
}
