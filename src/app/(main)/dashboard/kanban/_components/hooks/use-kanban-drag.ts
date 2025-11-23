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
      // Moving to a different column - call API
      if (activeTask.status !== overColumn.id) {
        onMoveTask(activeId, overColumn.id, 0);
      }
      setActiveTask(null);
      return;
    }

    // Check if dropped on another task (reordering or moving between columns)
    const overTask = tasks.find(t => t.id === overId);
    if (overTask) {
      const newBoardId = overTask.status;
      const tasksInBoard = tasks.filter(t => t.status === newBoardId);
      const newPosition = tasksInBoard.findIndex(t => t.id === overId);

      if (activeTask.status === overTask.status) {
        // Same column, reorder locally first
        const activeIndex = tasks.findIndex(t => t.id === activeId);
        const overIndex = tasks.findIndex(t => t.id === overId);
        setTasks(prevTasks => arrayMove(prevTasks, activeIndex, overIndex));
      }

      // Call API to persist
      onMoveTask(activeId, newBoardId, newPosition);
    }

    setActiveTask(null);
  }

  return { activeTask, handleDragStart, handleDragEnd };
}
