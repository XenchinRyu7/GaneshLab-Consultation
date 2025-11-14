/**
 * Helper functions for create-project-dialog
 */

/**
 * Clean form data by converting empty strings to undefined
 */
export function cleanFormData<T extends Record<string, unknown>>(data: T): T {
  const cleaned = { ...data } as Record<string, unknown>;
  const fieldsToClean = [
    "category",
    "budgetMin",
    "budgetMax",
    "timeline",
    "startDate",
    "endDate",
    "technologyStack",
    "requirements",
    "features",
    "deliverables",
    "clientNotes",
  ] as const;

  fieldsToClean.forEach(key => {
    if (key in cleaned && (cleaned[key] === undefined || cleaned[key] === "")) {
      cleaned[key] = undefined;
    }
  });

  return cleaned as T;
}

/**
 * Convert undefined values to null for API
 */
export function convertUndefinedToNull<T extends Record<string, unknown>>(
  data: T
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  Object.keys(data).forEach(key => {
    result[key] = data[key] === undefined || data[key] === "" ? null : data[key];
  });
  return result;
}
