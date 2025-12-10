import type { milestoneColumn, milestoneTask } from "../milestone-config";

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

interface UsemilestoneActionsProps {
  projectId: string;
  columns: milestoneColumn[];
  setColumns: React.Dispatch<React.SetStateAction<milestoneColumn[]>>;
  setTasks: React.Dispatch<React.SetStateAction<milestoneTask[]>>;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

export function usemilestoneActions({
  projectId,
  columns,
  setColumns,
  setTasks,
  onSuccess,
  onError,
}: UsemilestoneActionsProps) {
  async function handleAddCard(taskData: Omit<milestoneTask, "id">) {
    try {
      const column = columns.find(col => col.id === taskData.status);
      if (!column) return;

      let boardId = column.id;

      // If board is default (not in DB), create it first
      if (column.isDefault) {
        const createBoardResponse = await fetch("/api/milestone/boards", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: column.title,
            color: column.color,
            projectId,
          }),
        });

        if (!createBoardResponse.ok) {
          throw new Error("Failed to create board");
        }

        const boardData = await createBoardResponse.json();
        boardId = boardData.board.id;

        // Update column to non-default
        setColumns(prev =>
          prev.map(col =>
            col.id === column.id
              ? { ...col, id: boardId, isDefault: false, position: boardData.board.position }
              : col
          )
        );
      }

      // Create task
      const createTaskResponse = await fetch("/api/milestone/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: taskData.title,
          description: taskData.description,
          boardId,
          priority: taskData.priority.toUpperCase() || "MEDIUM",
          tags: taskData.tags ?? [],
          dueDate: taskData.dueDate,
        }),
      });

      if (!createTaskResponse.ok) {
        throw new Error("Failed to create task");
      }

      const taskResponse = await createTaskResponse.json();
      const newTask = taskResponse.task;

      // Add to local state
      setTasks(prev => [
        ...prev,
        {
          id: newTask.id,
          title: newTask.title,
          description: newTask.description ?? undefined,
          status: boardId,
          priority: newTask.priority.toLowerCase() as "low" | "medium" | "high",
          assignee: newTask.assignee?.fullname ?? undefined,
          tags: newTask.tags ?? [],
          dueDate: newTask.dueDate
            ? new Date(newTask.dueDate).toISOString().split("T")[0]
            : undefined,
        },
      ]);

      onSuccess("Task created successfully");
    } catch (error) {
      console.error("Error creating task:", error);
      onError("Failed to create task");
    }
  }

  async function handleAddBoard(boardData: Omit<milestoneColumn, "id"> & { id?: string }) {
    try {
      const response = await fetch("/api/milestone/boards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: boardData.title,
          color: boardData.color,
          projectId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create board");
      }

      const data = await response.json();
      const newBoard = data.board;

      setColumns(prev => [
        ...prev,
        {
          id: newBoard.id,
          title: newBoard.title,
          color: newBoard.color,
          position: newBoard.position,
          isDefault: false,
        },
      ]);

      onSuccess("Board created successfully");
    } catch (error) {
      console.error("Error creating board:", error);
      onError("Failed to create board");
    }
  }

  async function handleUpdateCard(taskId: string, updatedTask: Partial<milestoneTask>) {
    try {
      const response = await fetch(`/api/milestone/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: updatedTask.title,
          description: updatedTask.description,
          priority: updatedTask.priority?.toUpperCase(),
          tags: updatedTask.tags,
          dueDate: updatedTask.dueDate,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update task");
      }

      const data = await response.json();
      const updated = data.task;

      setTasks(prev =>
        prev.map(task =>
          task.id === taskId
            ? {
                ...task,
                title: updated.title,
                description: updated.description ?? undefined,
                priority: updated.priority.toLowerCase() as "low" | "medium" | "high",
                tags: updated.tags ?? [],
                dueDate: updated.dueDate
                  ? new Date(updated.dueDate).toISOString().split("T")[0]
                  : undefined,
              }
            : task
        )
      );

      onSuccess("Task updated successfully");

      return true;
    } catch (error) {
      console.error("Error updating task:", error);
      onError("Failed to update task");
      return false;
    }
  }

  async function handleMoveTask(taskId: string, newBoardId: string, newPosition: number) {
    try {
      console.log("Frontend: Moving task", { taskId, newBoardId, newPosition });

      // Check if newBoardId refers to a default column that needs to be created
      const column = columns.find(col => col.id === newBoardId);
      let actualBoardId = newBoardId;

      // If board is default (not in DB), create it first
      if (column?.isDefault) {
        console.log("Creating board for default column:", column.title);

        const createBoardResponse = await fetch("/api/milestone/boards", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: column.title,
            color: column.color,
            projectId,
          }),
        });

        if (!createBoardResponse.ok) {
          throw new Error("Failed to create board");
        }

        const boardData = await createBoardResponse.json();
        actualBoardId = boardData.board.id;

        console.log("Created board with ID:", actualBoardId);

        // Update column to non-default
        setColumns(prev =>
          prev.map(col =>
            col.id === column.id
              ? { ...col, id: actualBoardId, isDefault: false, position: boardData.board.position }
              : col
          )
        );
      }

      const response = await fetch(`/api/milestone/tasks/${taskId}/move`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newBoardId: actualBoardId, newPosition }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.log("API Error:", errorData);
        throw new Error("Failed to move task");
      }

      const data = await response.json();

      // Update from server response (sync with DB)
      const updatedColumns: milestoneColumn[] = [];
      const updatedTasks: milestoneTask[] = [];

      data.boards.forEach((board: ApiBoard) => {
        updatedColumns.push({
          id: board.id,
          title: board.title,
          color: board.color,
          position: board.position,
          isDefault: false,
        });

        board.tasks?.forEach((task: ApiTask) => {
          updatedTasks.push({
            id: task.id,
            title: task.title,
            description: task.description ?? undefined,
            status: board.id,
            priority: task.priority.toLowerCase() as "low" | "medium" | "high",
            assignee: task.assignee?.fullname ?? undefined,
            tags: task.tags,
            dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : undefined,
          });
        });
      });

      setTasks(updatedTasks);
    } catch (error) {
      console.error("Error moving task:", error);
      onError("Failed to move task");
      // TODO: Rollback optimistic update if needed
    }
  }

  async function handleDeleteBoard(boardId: string) {
    try {
      const response = await fetch(`/api/milestone/boards/${boardId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error ?? "Failed to delete board");
      }

      // Remove board from local state
      setColumns(prev => prev.filter(col => col.id !== boardId));

      // Remove tasks from this board
      setTasks(prev => prev.filter(task => task.status !== boardId));

      onSuccess("Board deleted successfully");
    } catch (error) {
      console.error("Error deleting board:", error);
      onError(error instanceof Error ? error.message : "Failed to delete board");
    }
  }

  return { handleAddCard, handleAddBoard, handleUpdateCard, handleMoveTask, handleDeleteBoard };
}
