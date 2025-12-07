// Utility functions untuk data table users

/**
 * Retry logic dengan exponential backoff
 * @param fn - Async function to retry
 * @param retries - Jumlah retry attempts (default: 3)
 * @param delay - Initial delay dalam ms (default: 1000)
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  retries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Jangan retry untuk error tertentu
      if (
        error instanceof Error &&
        (error.message.includes("401") || error.message.includes("403"))
      ) {
        throw error;
      }

      // Exponential backoff
      if (i < retries - 1) {
        const waitTime = delay * Math.pow(2, i);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }

  throw lastError ?? new Error("Failed after retries");
}

/**
 * Export users to CSV with safe field selection
 * @param users - Array of users to export
 * @param filename - Output filename (default: users.csv)
 */
export function exportUsersToCSV(
  users: Array<{
    id: string;
    userId: string;
    email: string;
    fullname: string;
    role: "admin" | "pic" | "client";
    phone: string | null;
    avatarColor: string | null;
    createdAt: string | Date;
  }>,
  filename: string = "users.csv"
): void {
  if (users.length === 0) {
    throw new Error("No users to export");
  }

  // Header
  const headers = ["Email", "Full Name", "Role", "Phone", "Created At"];
  const headerRow = headers.map(h => `"${h}"`).join(",");

  // Data rows
  const dataRows = users.map(user => {
    const row = [
      user.email,
      user.fullname,
      user.role,
      user.phone ?? "-",
      new Date(user.createdAt).toLocaleDateString("id-ID"),
    ];
    return row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",");
  });

  // Combine
  const csvContent = [headerRow, ...dataRows].join("\n");

  // Create blob and download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Cleanup
  URL.revokeObjectURL(url);
}
