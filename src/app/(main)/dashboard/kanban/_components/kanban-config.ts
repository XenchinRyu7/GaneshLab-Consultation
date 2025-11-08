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
}

export const defaultKanbanColumns: KanbanColumn[] = [
  { id: "todo", title: "To Do", color: "bg-blue-500" },
  { id: "in-progress", title: "In Progress", color: "bg-yellow-500" },
  { id: "review", title: "Review", color: "bg-purple-500" },
  { id: "done", title: "Done", color: "bg-green-500" },
];

export const columnColors = [
  "bg-blue-500",
  "bg-yellow-500",
  "bg-purple-500",
  "bg-green-500",
  "bg-red-500",
  "bg-pink-500",
  "bg-indigo-500",
  "bg-orange-500",
  "bg-teal-500",
  "bg-cyan-500",
];

export const initialTasks: KanbanTask[] = [
  {
    id: "1",
    title: "Design new landing page",
    description: "Create mockups and wireframes for the new landing page design",
    status: "todo",
    priority: "high",
    assignee: "John Doe",
    tags: ["design", "ui/ux"],
    dueDate: "2024-12-20",
  },
  {
    id: "2",
    title: "Implement authentication",
    description: "Add login and registration functionality",
    status: "in-progress",
    priority: "high",
    assignee: "Jane Smith",
    tags: ["backend", "security"],
    dueDate: "2024-12-18",
  },
  {
    id: "3",
    title: "Write API documentation",
    description: "Document all REST API endpoints",
    status: "in-progress",
    priority: "medium",
    assignee: "Bob Johnson",
    tags: ["documentation"],
  },
  {
    id: "4",
    title: "Fix mobile responsive issues",
    description: "Resolve layout problems on mobile devices",
    status: "review",
    priority: "medium",
    assignee: "Alice Williams",
    tags: ["frontend", "responsive"],
    dueDate: "2024-12-19",
  },
  {
    id: "5",
    title: "Setup CI/CD pipeline",
    description: "Configure automated testing and deployment",
    status: "done",
    priority: "high",
    assignee: "Charlie Brown",
    tags: ["devops"],
  },
  {
    id: "6",
    title: "Add unit tests",
    description: "Write tests for core functionality",
    status: "todo",
    priority: "medium",
    assignee: "David Lee",
    tags: ["testing"],
    dueDate: "2024-12-22",
  },
  {
    id: "7",
    title: "Optimize database queries",
    description: "Improve performance of slow queries",
    status: "review",
    priority: "low",
    assignee: "Emma Davis",
    tags: ["backend", "performance"],
  },
  {
    id: "8",
    title: "Update user dashboard",
    description: "Add new widgets and improve UX",
    status: "done",
    priority: "medium",
    assignee: "Frank Miller",
    tags: ["frontend", "dashboard"],
  },
];
