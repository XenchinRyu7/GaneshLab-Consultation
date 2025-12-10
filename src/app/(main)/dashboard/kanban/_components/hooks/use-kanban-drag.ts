import { useState } from "react";

import { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";

import type { KanbanColumn, KanbanTask } from "../kanban-config";

interface UseKanbanDragProps {
  columns: KanbanColumn[];
  tasks: KanbanTask[];
  setTasks: React.Dispatch<React.SetStateAction<KanbanTask[]>>;
  onMoveTask: (taskId: string, newBoardId: string, newPosition: number) => void;
}

export function useKanbanDrag({ columns, tasks, setTasks, onMoveTask }: UseKanbanDragProps) {
  const [activeTask, setActiveTask] = useState<KanbanTask | null>(null);

  function handleDragStart(event: DragStartEvent) {
    const task = tasks.find(t => t.id === event.active.id);
    setActiveTask(task ?? null);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over) {
      setActiveTask(null);
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find the task being dragged
    const activeTask = tasks.find(t => t.id === activeId);
    if (!activeTask) {
      setActiveTask(null);
      return;
    }

    // Check if dropped on a column (status change)
    const overColumn = columns.find(col => col.id === overId);
    if (overColumn) {
      // Moving to a different column - optimistic update
      if (activeTask.status !== overColumn.id) {
        const tasksInNewBoard = tasks.filter(t => t.status === overColumn.id);
        const newPosition = tasksInNewBoard.length; // Add to end

        // Optimistic update: move task to new board at the end
        setTasks(prevTasks => {
          const filtered = prevTasks.filter(t => t.id !== activeId);
          return [...filtered, { ...activeTask, status: overColumn.id }];
        });

        // Call API in background
        onMoveTask(activeId, overColumn.id, newPosition);
      }
      setActiveTask(null);
      return;
    }

    // Check if dropped on another task (reordering or moving between columns)
    const overTask = tasks.find(t => t.id === overId);
    if (overTask) {
      const newBoardId = overTask.status;
      const tasksInBoard = tasks.filter(t => t.status === newBoardId);
      const overIndex = tasksInBoard.findIndex(t => t.id === overId);
      const newPosition = overIndex; // Insert at overTask's position

      if (activeTask.status === overTask.status) {
        // Same column, reorder locally first
        const activeIndex = tasks.findIndex(t => t.id === activeId);
        const overIndex = tasks.findIndex(t => t.id === overId);
        setTasks(prevTasks => arrayMove(prevTasks, activeIndex, overIndex));
      } else {
        // Moving to different column - optimistic update
        setTasks(prevTasks => {
          const filtered = prevTasks.filter(t => t.id !== activeId);
          const tasksInNewBoard = filtered.filter(t => t.status === newBoardId);
          const before = tasksInNewBoard.slice(0, overIndex);
          const after = tasksInNewBoard.slice(overIndex);
          return [
            ...filtered.filter(t => t.status !== newBoardId),
            ...before,
            { ...activeTask, status: newBoardId },
            ...after,
          ];
        });
      }

      // Call API in background
      onMoveTask(activeId, newBoardId, newPosition);
    }

    setActiveTask(null);
  }

  return { activeTask, handleDragStart, handleDragEnd };
}
