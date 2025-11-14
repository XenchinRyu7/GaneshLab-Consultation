/**
 * Build company data for POST /api/companies
 */

interface CompanyData {
  name: string;
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
  logo?: string | null;
  contactPerson?: string | null;
  contactPhone?: string | null;
  contactEmail?: string | null;
}

/**
 * Build basic company fields
 */
function buildBasicFields(body: CompanyData): Record<string, unknown> {
  return {
    name: body.name,
    website: body.website ?? null,
    description: body.description ?? null,
    industry: body.industry ?? null,
  };
}

/**
 * Build address fields
 */
function buildAddressFields(body: CompanyData): Record<string, unknown> {
  return {
    address: body.address ?? null,
    city: body.city ?? null,
    province: body.province ?? null,
    postalCode: body.postalCode ?? null,
    country: body.country ?? "Indonesia",
  };
}

/**
 * Build contact fields
 */
function buildContactFields(body: CompanyData): Record<string, unknown> {
  return {
    phone: body.phone ?? null,
    email: body.email ?? null,
    logo: body.logo ?? null,
  };
}

/**
 * Build contact person fields
 */
function buildContactPersonFields(body: CompanyData): Record<string, unknown> {
  return {
    contactPerson: body.contactPerson ?? null,
    contactPhone: body.contactPhone ?? null,
    contactEmail: body.contactEmail ?? null,
  };
}

/**
 * Build company data object
 */
export function buildCompanyData(body: CompanyData): Record<string, unknown> {
  return {
    ...buildBasicFields(body),
    ...buildAddressFields(body),
    ...buildContactFields(body),
    ...buildContactPersonFields(body),
  };
}
