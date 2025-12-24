import { getTranslations } from "next-intl/server";

import { Navigation } from "@/components/nav";

export async function generateMetadata() {
  const t = await getTranslations("Metadata");

  return {
    title: t("termsTitle"),
    description: t("termsDescription"),
  };
}

export default async function TermsOfService() {
  const t = await getTranslations("TermsOfService");

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />
      <div className="container mx-auto min-h-screen px-4 pt-24 pb-8">
        <h1 className="mb-6 text-3xl font-bold text-white">{t("title")}</h1>
        <p className="mb-8 text-sm text-zinc-400">{t("lastUpdated")}</p>

        <div className="space-y-6">
          <section>
            <h2 className="mb-3 text-xl font-semibold text-white">
              {t("acceptanceOfTerms.title")}
            </h2>
            <p className="text-zinc-300">{t("acceptanceOfTerms.content")}</p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-white">{t("useLicense.title")}</h2>
            <p className="text-zinc-300">{t("useLicense.content")}</p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-white">
              {t("userResponsibilities.title")}
            </h2>
            <p className="text-zinc-300">{t("userResponsibilities.content")}</p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-white">
              {t("serviceAvailability.title")}
            </h2>
            <p className="text-zinc-300">{t("serviceAvailability.content")}</p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-white">
              {t("limitationOfLiability.title")}
            </h2>
            <p className="text-zinc-300">{t("limitationOfLiability.content")}</p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-white">
              {t("contactInformation.title")}
            </h2>
            <p className="text-zinc-300">{t("contactInformation.content")}</p>
          </section>
        </div>
      </div>
    </div>
  );
}
