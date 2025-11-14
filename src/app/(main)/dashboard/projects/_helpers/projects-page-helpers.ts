/**
 * Helper functions for projects page
 */

/**
 * Fetch company ID for project creation
 */
export async function fetchCompanyIdForProject(clientId: string): Promise<string | null> {
  try {
    const companyResponse = await fetch(`/api/companies?userId=${clientId}`);
    if (companyResponse.ok) {
      const companyData = await companyResponse.json();
      if (companyData.company) {
        return companyData.company.id;
      }
    }
  } catch (error) {
    console.error("Error fetching company:", error);
  }
  return null;
}

/**
 * Verify company profile is complete
 */
export async function verifyCompanyProfileForProject(): Promise<{
  isComplete: boolean;
  shouldRedirect: boolean;
}> {
  try {
    const checkResponse = await fetch("/api/companies/check");
    if (checkResponse.ok) {
      const checkData = await checkResponse.json();
      return {
        isComplete: checkData.isComplete ?? false,
        shouldRedirect: !(checkData.isComplete ?? false),
      };
    }
  } catch (error) {
    console.error("Error checking company profile:", error);
  }
  return { isComplete: true, shouldRedirect: false };
}

/**
 * Create project via API
 */
export async function createProjectViaAPI(
  projectData: Record<string, unknown>,
  clientId: string,
  companyId: string | null
) {
  const response = await fetch("/api/projects", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...projectData,
      clientId,
      companyId,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error ?? "Failed to create project");
  }

  return response.json();
}
