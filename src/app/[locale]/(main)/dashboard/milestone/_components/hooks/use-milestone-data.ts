import { useEffect, useState } from "react";

import {
  defaultmilestoneColumns,
  type milestoneColumn,
  type milestoneTask,
} from "../milestone-config";

interface ApiTask {
  id: string;
  title: string;
  description: string | null;
  priority: string;
  assignee?: { fullname: string };
  tags: string[];
  dueDate: string | null;
}

interface ApiBoard {
  id: string;
  title: string;
  color: string;
  position: number;
  tasks?: ApiTask[];
}

interface UseMilestoneDataProps {
  projectId: string;
  onError: (message: string) => void;
}

export function useMilestoneData({ projectId, onError }: UseMilestoneDataProps) {
  const [columns, setColumns] = useState<milestoneColumn[]>(defaultmilestoneColumns);
  const [tasks, setTasks] = useState<milestoneTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/milestone/boards?projectId=${projectId}`);

        if (!response.ok) {
          throw new Error("Failed to fetch boards");
        }

        const data = await response.json();
        const dbBoards = data.boards ?? [];

        // Merge default boards with DB boards
        const mergedColumns: milestoneColumn[] = [];
        const allTasks: milestoneTask[] = [];

        // Add DB boards (these have tasks)
        dbBoards.forEach((board: ApiBoard) => {
          mergedColumns.push({
            id: board.id,
            title: board.title,
            color: board.color,
            position: board.position,
            isDefault: false,
          });

          // Map tasks from DB
          board.tasks?.forEach((task: ApiTask) => {
            allTasks.push({
              id: task.id,
              title: task.title,
              description: task.description ?? undefined,
              status: board.id,
              priority: task.priority.toLowerCase() as "low" | "medium" | "high",
              assignee: task.assignee?.fullname ?? undefined,
              tags: task.tags,
              dueDate: task.dueDate
                ? new Date(task.dueDate).toISOString().split("T")[0]
                : undefined,
            });
          });
        });

        // Add default boards if they don't exist in DB
        defaultmilestoneColumns.forEach(defaultCol => {
          const exists = mergedColumns.some(col => col.title === defaultCol.title);
          if (!exists) {
            mergedColumns.push({
              ...defaultCol,
              isDefault: true,
            });
          }
        });

        // Sort by position
        mergedColumns.sort((a, b) => {
          const posA = a.position ?? 999;
          const posB = b.position ?? 999;
          return posA - posB;
        });

        setColumns(mergedColumns);
        setTasks(allTasks);
      } catch (error) {
        console.error("Error fetching milestone data:", error);
        onError("Failed to load milestone board");
        // Fallback to default columns
        setColumns(defaultmilestoneColumns.map(col => ({ ...col, isDefault: true })));
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [projectId, onError]);

  return { columns, setColumns, tasks, setTasks, isLoading };
}
