/**
 * Build update data for PUT /api/projects/[id]
 */

interface UpdateProjectBody {
  name?: string;
  description?: string;
  picId?: string;
  status?: string;
  type?: string;
  category?: string;
  budgetMin?: number | null;
  budgetMax?: number | null;
  estimatedCost?: number | null;
  complexity?: string;
  priority?: string;
  timeline?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  technologyStack?: string | null;
  requirements?: string | null;
  features?: string | null;
  deliverables?: string | null;
  companyId?: string | null;
  progress?: number;
  notes?: string | null;
  clientNotes?: string | null;
}

/**
 * Build basic fields
 */
function buildBasicFields(body: UpdateProjectBody): Record<string, unknown> {
  const data: Record<string, unknown> = {};
  if (body.name !== undefined) data.name = body.name;
  if (body.description !== undefined) data.description = body.description;
  if (body.picId !== undefined) data.picId = body.picId;
  if (body.status !== undefined) data.status = body.status;
  if (body.type !== undefined) data.type = body.type;
  if (body.category !== undefined) data.category = body.category;
  return data;
}

/**
 * Build budget fields
 */
function buildBudgetFields(body: UpdateProjectBody): Record<string, unknown> {
  const data: Record<string, unknown> = {};
  if (body.budgetMin !== undefined) data.budgetMin = body.budgetMin ?? null;
  if (body.budgetMax !== undefined) data.budgetMax = body.budgetMax ?? null;
  if (body.estimatedCost !== undefined) data.estimatedCost = body.estimatedCost ?? null;
  return data;
}

/**
 * Build project details fields
 */
function buildProjectDetailsFields(body: UpdateProjectBody): Record<string, unknown> {
  const data: Record<string, unknown> = {};
  if (body.complexity !== undefined) data.complexity = body.complexity;
  if (body.priority !== undefined) data.priority = body.priority;
  if (body.timeline !== undefined) data.timeline = body.timeline ?? null;
  if (body.progress !== undefined) data.progress = body.progress;
  return data;
}

/**
 * Build date fields
 */
function buildDateFields(body: UpdateProjectBody): Record<string, unknown> {
  const data: Record<string, unknown> = {};
  if (body.startDate !== undefined)
    data.startDate = body.startDate ? new Date(body.startDate) : null;
  if (body.endDate !== undefined) data.endDate = body.endDate ? new Date(body.endDate) : null;
  return data;
}

/**
 * Build project detail text fields
 */
function buildProjectDetailTextFields(body: UpdateProjectBody): Record<string, unknown> {
  const data: Record<string, unknown> = {};
  if (body.technologyStack !== undefined) data.technologyStack = body.technologyStack ?? null;
  if (body.requirements !== undefined) data.requirements = body.requirements ?? null;
  if (body.features !== undefined) data.features = body.features ?? null;
  if (body.deliverables !== undefined) data.deliverables = body.deliverables ?? null;
  return data;
}

/**
 * Build notes fields
 */
function buildNotesFields(body: UpdateProjectBody): Record<string, unknown> {
  const data: Record<string, unknown> = {};
  if (body.notes !== undefined) data.notes = body.notes ?? null;
  if (body.clientNotes !== undefined) data.clientNotes = body.clientNotes ?? null;
  return data;
}

/**
 * Build text fields
 */
function buildTextFieldFields(body: UpdateProjectBody): Record<string, unknown> {
  return {
    ...buildProjectDetailTextFields(body),
    ...buildNotesFields(body),
  };
}

/**
 * Build company field
 */
function buildCompanyField(body: UpdateProjectBody): Record<string, unknown> {
  const data: Record<string, unknown> = {};
  if (body.companyId !== undefined) data.companyId = body.companyId ?? null;
  return data;
}

/**
 * Build complete update data object
 */
export function buildUpdateData(body: UpdateProjectBody): Record<string, unknown> {
  return {
    ...buildBasicFields(body),
    ...buildBudgetFields(body),
    ...buildProjectDetailsFields(body),
    ...buildDateFields(body),
    ...buildTextFieldFields(body),
    ...buildCompanyField(body),
  };
}
