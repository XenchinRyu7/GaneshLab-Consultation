"use client";

import { useState } from "react";

import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { useUserStore } from "@/stores/user/user-provider";

import { AddBoardDialog } from "./add-board-dialog";
import { EditCardDialog } from "./edit-card-dialog";
import { usemilestoneActions } from "./hooks/use-milestone-actions";
import { useMilestoneData } from "./hooks/use-milestone-data";
import { MilestoneBoardContent } from "./milestone-board-content";
import type { milestoneTask } from "./milestone-config";

interface MilestoneBoardProps {
  projectId: string;
}

export function MilestoneBoard({ projectId }: MilestoneBoardProps) {
  const handleSuccess = (message: string) => {
    toast.success(message);
  };

  const handleError = (message: string) => {
    toast.error(message);
  };

  const { columns, setColumns, tasks, setTasks, isLoading } = useMilestoneData({
    projectId,
    onError: handleError,
  });

  const { handleAddCard, handleAddBoard, handleUpdateCard, handleMoveTask, handleDeleteBoard } =
    usemilestoneActions({
      projectId,
      columns,
      setColumns,
      setTasks,
      onSuccess: handleSuccess,
      onError: handleError,
    });

  const isPIC = useUserStore(state => state.isPIC());
  const isAdmin = useUserStore(state => state.isAdmin());

  const [editingTask, setEditingTask] = useState<milestoneTask | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  function handleCardClick(task: milestoneTask) {
    // Only allow edit if user is PIC or Admin
    if (!isPIC && !isAdmin) return;
    setEditingTask(task);
    setIsEditDialogOpen(true);
  }

  async function handleUpdate(taskId: string, updatedTask: Partial<milestoneTask>) {
    // Check if status is being changed
    const currentTask = tasks.find(t => t.id === taskId);
    const statusChanged =
      updatedTask.status && currentTask && updatedTask.status !== currentTask.status;

    const success = await handleUpdateCard(taskId, updatedTask);
    if (success) {
      // If status changed, move the task to the new column
      if (statusChanged && updatedTask.status) {
        // Find the position in the new column (add to the end)
        const tasksInNewColumn = tasks.filter(t => t.status === updatedTask.status);
        const newPosition = tasksInNewColumn.length;

        await handleMoveTask(taskId, updatedTask.status, newPosition);
      }

      setIsEditDialogOpen(false);
      setEditingTask(null);
    }
  }

  const existingIds = columns.map(col => col.id);

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
        {(isPIC || isAdmin) && (
          <AddBoardDialog onAddBoard={handleAddBoard} existingIds={existingIds} />
        )}
      </div>

      <div className="max-h-[calc(100vh-12rem)] overflow-y-auto">
        <MilestoneBoardContent
          columns={columns}
          tasks={tasks}
          setTasks={setTasks}
          onAddCard={handleAddCard}
          onCardClick={handleCardClick}
          onMoveTask={handleMoveTask}
          onDeleteBoard={handleDeleteBoard}
          canManageBoards={isPIC || isAdmin}
        />
      </div>

      {editingTask && (
        <EditCardDialog
          task={editingTask}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onUpdateCard={handleUpdate}
          availableColumns={columns}
        />
      )}
    </div>
  );
}
