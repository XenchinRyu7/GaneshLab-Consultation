"use client";

import { useTranslations } from "next-intl";

import { useUserStore } from "@/stores/user/user-provider";

import { AdminOverview } from "./_components/admin-overview";
import { ClientOverview } from "./_components/client-overview";
import { PicOverview } from "./_components/pic-overview";

export default function Page() {
  const t = useTranslations("Dashboard");
  const currentUser = useUserStore(state => state.currentUser);

  if (!currentUser) {
    return <div>{t("loading")}</div>;
  }

  const renderOverview = () => {
    switch (currentUser.role) {
      case "admin":
        return <AdminOverview />;
      case "pic":
        return <PicOverview />;
      case "client":
        return <ClientOverview />;
      default:
        return <div>{t("roleNotRecognized")}</div>;
    }
  };

  return <div className="@container/main flex flex-col gap-4 md:gap-6">{renderOverview()}</div>;
}
