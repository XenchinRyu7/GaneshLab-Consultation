export type TaskStatus = string;

export interface KanbanTask {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: "low" | "medium" | "high";
  assignee?: string;
  tags?: string[];
  dueDate?: string;
}

export interface KanbanColumn {
  id: string;
  title: string;
  color: string;
  position?: number;
  isDefault?: boolean; // True if board is default (not yet in DB)
}

// Default boards (shown in UI even if not in DB yet)
export const defaultKanbanColumns: KanbanColumn[] = [
  { id: "todo", title: "To Do", color: "#3b82f6" },
  { id: "in-progress", title: "In Progress", color: "#eab308" },
  { id: "review", title: "Review", color: "#a855f7" },
  { id: "done", title: "Done", color: "#22c55e" },
];

export const columnColors = [
  "#3b82f6", // blue
  "#eab308", // yellow
  "#a855f7", // purple
  "#22c55e", // green
  "#ef4444", // red
  "#ec4899", // pink
  "#6366f1", // indigo
  "#f97316", // orange
  "#14b8a6", // teal
  "#06b6d4", // cyan
];

// No initial dummy tasks - will fetch from DB
export const initialTasks: KanbanTask[] = [];
