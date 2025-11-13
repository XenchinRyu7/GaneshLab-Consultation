/**
 * Build update data for PUT /api/companies/[userId]
 */

interface UpdateCompanyBody {
  name?: string;
  website?: string | null;
  description?: string | null;
  industry?: string | null;
  address?: string | null;
  city?: string | null;
  province?: string | null;
  postalCode?: string | null;
  country?: string | null;
  phone?: string | null;
  email?: string | null;
  taxId?: string | null;
  logo?: string | null;
  contactPerson?: string | null;
  contactPhone?: string | null;
  contactEmail?: string | null;
  isVerified?: boolean;
}

/**
 * Build basic company fields
 */
function buildBasicFields(body: UpdateCompanyBody): Record<string, unknown> {
  const data: Record<string, unknown> = {};
  if (body.name !== undefined) data.name = body.name;
  if (body.website !== undefined) data.website = body.website ?? null;
  if (body.description !== undefined) data.description = body.description ?? null;
  if (body.industry !== undefined) data.industry = body.industry ?? null;
  return data;
}

/**
 * Build location fields
 */
function buildLocationFields(body: UpdateCompanyBody): Record<string, unknown> {
  const data: Record<string, unknown> = {};
  if (body.address !== undefined) data.address = body.address ?? null;
  if (body.city !== undefined) data.city = body.city ?? null;
  if (body.province !== undefined) data.province = body.province ?? null;
  return data;
}

/**
 * Build postal fields
 */
function buildPostalFields(body: UpdateCompanyBody): Record<string, unknown> {
  const data: Record<string, unknown> = {};
  if (body.postalCode !== undefined) data.postalCode = body.postalCode ?? null;
  if (body.country !== undefined) data.country = body.country ?? "Indonesia";
  return data;
}

/**
 * Build address fields
 */
function buildAddressFields(body: UpdateCompanyBody): Record<string, unknown> {
  return {
    ...buildLocationFields(body),
    ...buildPostalFields(body),
  };
}

/**
 * Build contact fields
 */
function buildContactFields(body: UpdateCompanyBody): Record<string, unknown> {
  const data: Record<string, unknown> = {};
  if (body.phone !== undefined) data.phone = body.phone ?? null;
  if (body.email !== undefined) data.email = body.email ?? null;
  if (body.taxId !== undefined) data.taxId = body.taxId ?? null;
  if (body.logo !== undefined) data.logo = body.logo ?? null;
  return data;
}

/**
 * Build contact person fields
 */
function buildContactPersonFields(body: UpdateCompanyBody): Record<string, unknown> {
  const data: Record<string, unknown> = {};
  if (body.contactPerson !== undefined) data.contactPerson = body.contactPerson ?? null;
  if (body.contactPhone !== undefined) data.contactPhone = body.contactPhone ?? null;
  if (body.contactEmail !== undefined) data.contactEmail = body.contactEmail ?? null;
  return data;
}

/**
 * Build verification field
 */
function buildVerificationField(body: UpdateCompanyBody): Record<string, unknown> {
  const data: Record<string, unknown> = {};
  if (body.isVerified !== undefined) data.isVerified = body.isVerified;
  return data;
}

/**
 * Build complete update data object
 */
export function buildCompanyUpdateData(body: UpdateCompanyBody): Record<string, unknown> {
  return {
    ...buildBasicFields(body),
    ...buildAddressFields(body),
    ...buildContactFields(body),
    ...buildContactPersonFields(body),
    ...buildVerificationField(body),
  };
}
