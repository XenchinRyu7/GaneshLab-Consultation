/**
 * Custom hook for company profile checking
 */

import { useCallback, useState } from "react";

import { toast } from "sonner";

import { verifyCompanyProfileForProject } from "../_helpers/projects-page-helpers";

export function useCompanyProfileCheck(
  t: (key: string) => string,
  router: { push: (path: string) => void }
) {
  const [isCheckingCompanyProfile, setIsCheckingCompanyProfile] = useState(false);

  const checkCompanyProfile = useCallback(async () => {
    const profileCheckResult = await verifyCompanyProfileForProject();

    if (!profileCheckResult.isComplete) {
      toast.error(t("completeCompanyProfileFirst"), {
        description: t("missingFields"),
        action: {
          label: t("goToProfile"),
          onClick: () => {
            router.push("/dashboard/account");
          },
        },
      });
      return false;
    }

    return true;
  }, [t, router]);

  const handleCompanyProfileError = useCallback(
    (error: unknown) => {
      console.error("Error checking company profile:", error);
      toast.error(error instanceof Error ? error.message : t("failedToVerifyCompanyProfileRetry"));
    },
    [t]
  );

  return {
    isCheckingCompanyProfile,
    setIsCheckingCompanyProfile,
    checkCompanyProfile,
    handleCompanyProfileError,
  };
}
