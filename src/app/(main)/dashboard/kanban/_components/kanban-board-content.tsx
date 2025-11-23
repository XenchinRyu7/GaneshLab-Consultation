import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCorners,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import { ScrollArea } from "@/components/ui/scroll-area";

import { useKanbanDrag } from "./hooks/use-kanban-drag";
import { KanbanColumn as KanbanColumnComponent } from "./kanban-column";
import type { KanbanColumn, KanbanTask } from "./kanban-config";

interface KanbanBoardContentProps {
  columns: KanbanColumn[];
  tasks: KanbanTask[];
  setTasks: React.Dispatch<React.SetStateAction<KanbanTask[]>>;
  onAddCard: (task: Omit<KanbanTask, "id">) => void;
  onCardClick: (task: KanbanTask) => void;
  onMoveTask: (taskId: string, newBoardId: string, newPosition: number) => void;
}

export function KanbanBoardContent({
  columns,
  tasks,
  setTasks,
  onAddCard,
  onCardClick,
  onMoveTask,
}: KanbanBoardContentProps) {
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
    useSensor(KeyboardSensor)
  );

  const { activeTask, handleDragStart, handleDragEnd } = useKanbanDrag({
    columns,
    tasks,
    setTasks,
    onMoveTask,
  });

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <ScrollArea className="h-[calc(100vh-16rem)]">
        <div className="flex gap-4 p-4">
          {columns.map(column => {
            const columnTasks = tasks.filter(task => task.status === column.id);
            return (
              <KanbanColumnComponent
                key={column.id}
                column={column}
                tasks={columnTasks}
                onAddCard={onAddCard}
                onCardClick={onCardClick}
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
                  <p className="text-muted-foreground mt-2 line-clamp-2 text-xs">
                    {activeTask.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
