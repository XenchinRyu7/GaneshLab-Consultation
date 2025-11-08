"use client";

import { useState } from "react";

import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";

import { ScrollArea } from "@/components/ui/scroll-area";

import { AddBoardDialog } from "./add-board-dialog";
import { EditCardDialog } from "./edit-card-dialog";
import { KanbanColumn } from "./kanban-column";
import {
  defaultKanbanColumns,
  initialTasks,
  type KanbanTask,
  type KanbanColumn as KanbanColumnType,
  type TaskStatus,
} from "./kanban-config";

export function KanbanBoard() {
  const [columns, setColumns] = useState<KanbanColumnType[]>(defaultKanbanColumns);
  const [tasks, setTasks] = useState<KanbanTask[]>(initialTasks);
  const [activeTask, setActiveTask] = useState<KanbanTask | null>(null);
  const [editingTask, setEditingTask] = useState<KanbanTask | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor),
  );

  function handleDragStart(event: DragStartEvent) {
    const task = tasks.find((t) => t.id === event.active.id);
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
    const activeTask = tasks.find((t) => t.id === activeId);
    if (!activeTask) {
      setActiveTask(null);
      return;
    }

    // Check if dropped on a column (status change)
    const overColumn = columns.find((col) => col.id === overId);
    if (overColumn) {
      // Moving to a different column
      if (activeTask.status !== overColumn.id) {
        setTasks((prevTasks) =>
          prevTasks.map((task) => (task.id === activeId ? { ...task, status: overColumn.id } : task)),
        );
      }
      setActiveTask(null);
      return;
    }

    // Check if dropped on another task (reordering or moving between columns)
    const overTask = tasks.find((t) => t.id === overId);
    if (overTask) {
      if (activeTask.status === overTask.status) {
        // Same column, reorder
        const activeIndex = tasks.findIndex((t) => t.id === activeId);
        const overIndex = tasks.findIndex((t) => t.id === overId);

        setTasks((prevTasks) => arrayMove(prevTasks, activeIndex, overIndex));
      } else {
        // Different column, move to new column and position
        setTasks((prevTasks) => {
          const newTasks = prevTasks.filter((t) => t.id !== activeId);
          const overIndex = newTasks.findIndex((t) => t.id === overId);
          const updatedTask = { ...activeTask, status: overTask.status };

          return [...newTasks.slice(0, overIndex), updatedTask, ...newTasks.slice(overIndex)];
        });
      }
    }

    setActiveTask(null);
  }

  function handleAddCard(taskData: Omit<KanbanTask, "id">) {
    const newTask: KanbanTask = {
      ...taskData,
      id: Date.now().toString(),
    };
    setTasks((prev) => [...prev, newTask]);
  }

  function handleAddBoard(boardData: Omit<KanbanColumnType, "id"> & { id?: string }) {
    if (!boardData.id) return;
    const newColumn: KanbanColumnType = {
      id: boardData.id,
      title: boardData.title,
      color: boardData.color,
    };
    setColumns((prev) => [...prev, newColumn]);
  }

  function handleCardClick(task: KanbanTask) {
    setEditingTask(task);
    setIsEditDialogOpen(true);
  }

  function handleUpdateCard(taskId: string, updatedTask: Partial<KanbanTask>) {
    setTasks((prev) => prev.map((task) => (task.id === taskId ? { ...task, ...updatedTask } : task)));
    setIsEditDialogOpen(false);
    setEditingTask(null);
  }

  const existingIds = columns.map((col) => col.id);
  const availableStatuses: TaskStatus[] = columns.map((col) => col.id);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-end">
        <AddBoardDialog onAddBoard={handleAddBoard} existingIds={existingIds} />
      </div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <ScrollArea className="h-[calc(100vh-16rem)]">
          <div className="flex gap-4 p-4">
            {columns.map((column) => {
              const columnTasks = tasks.filter((task) => task.status === column.id);
              return (
                <KanbanColumn
                  key={column.id}
                  column={column}
                  tasks={columnTasks}
                  onAddCard={handleAddCard}
                  onCardClick={handleCardClick}
                />
              );
            })}
          </div>
        </ScrollArea>
        <DragOverlay>
          {activeTask ? (
            <div className="w-[280px] rotate-3 opacity-90">
              <div className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-lg">
                <div className="px-6 pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm leading-tight font-semibold">{activeTask.title}</h4>
                  </div>
                  {activeTask.description && (
                    <p className="text-muted-foreground mt-2 line-clamp-2 text-xs">{activeTask.description}</p>
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
      {editingTask && (
        <EditCardDialog
          task={editingTask}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onUpdateCard={handleUpdateCard}
          availableStatuses={availableStatuses}
        />
      )}
    </div>
  );
}
