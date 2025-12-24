import { getTranslations } from "next-intl/server";

import { Navigation } from "@/components/nav";

export async function generateMetadata() {
  const t = await getTranslations("Metadata");

  return {
    title: t("privacyTitle"),
    description: t("privacyDescription"),
  };
}

export default async function PrivacyPolicy() {
  const t = await getTranslations("PrivacyPolicy");

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />
      <div className="container mx-auto min-h-screen px-4 pt-24 pb-8">
        <h1 className="mb-6 text-3xl font-bold text-white">{t("title")}</h1>
        <p className="mb-8 text-sm text-zinc-400">{t("lastUpdated")}</p>

        <div className="space-y-6">
          <section>
            <h2 className="mb-3 text-xl font-semibold text-white">
              {t("informationWeCollect.title")}
            </h2>
            <p className="text-zinc-300">{t("informationWeCollect.content")}</p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-white">{t("howWeUse.title")}</h2>
            <p className="text-zinc-300">{t("howWeUse.content")}</p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-white">{t("dataSecurity.title")}</h2>
            <p className="text-zinc-300">{t("dataSecurity.content")}</p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-white">{t("contactUs.title")}</h2>
            <p className="text-zinc-300">{t("contactUs.content")}</p>
          </section>
        </div>
      </div>
    </div>
  );
}
