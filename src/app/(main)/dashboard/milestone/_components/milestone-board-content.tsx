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

import { useMilestoneDrag } from "./hooks/use-milestone-drag";
import { MilestoneColumn as MilestoneColumnComponent } from "./milestone-column";
import type { milestoneColumn, milestoneTask } from "./milestone-config";

interface milestoneBoardContentProps {
  columns: milestoneColumn[];
  tasks: milestoneTask[];
  setTasks: React.Dispatch<React.SetStateAction<milestoneTask[]>>;
  onAddCard: (task: Omit<milestoneTask, "id">) => void;
  onCardClick: (task: milestoneTask) => void;
  onMoveTask: (taskId: string, newBoardId: string, newPosition: number) => void;
  onDeleteBoard?: (boardId: string) => void;
  canManageBoards?: boolean;
}

export function MilestoneBoardContent({
  columns,
  tasks,
  setTasks,
  onAddCard,
  onCardClick,
  onMoveTask,
  onDeleteBoard,
  canManageBoards,
}: milestoneBoardContentProps) {
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

  const { activeTask, handleDragStart, handleDragEnd } = useMilestoneDrag({
    columns,
    tasks,
    setTasks,
    onMoveTask,
  });

  // Disable drag and drop if user cannot manage boards
  const dragHandlers = canManageBoards
    ? {
        onDragStart: handleDragStart,
        onDragEnd: handleDragEnd,
      }
    : {};

  return (
    <DndContext
      sensors={canManageBoards ? sensors : undefined}
      collisionDetection={closestCorners}
      {...dragHandlers}
    >
      <div className="flex h-full gap-2 overflow-x-auto p-2 sm:gap-4 sm:p-4">
        {columns.map(column => {
          const columnTasks = tasks.filter(task => task.status === column.id);
          return (
            <MilestoneColumnComponent
              key={column.id}
              column={column}
              tasks={columnTasks}
              onAddCard={onAddCard}
              onCardClick={canManageBoards ? onCardClick : undefined}
              onDeleteBoard={onDeleteBoard}
              canManageBoards={canManageBoards}
            />
          );
        })}
      </div>
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
