import { KanbanBoard } from "./_components/kanban-board";

export default function KanbanPage() {
  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Kanban Board</h1>
          <p className="text-muted-foreground">Manage and track your tasks with a visual board</p>
        </div>
      </div>
      <KanbanBoard />
    </div>
  );
}
