"use client";

import { useTranslations } from "next-intl";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUserStore } from "@/stores/user/user-provider";

import { AccountProfile } from "./_components/account-profile";
import { CompanyProfile } from "./_components/company-profile";
import { GaneshlabInfo } from "./_components/ganeshlab-info";

export default function AccountPage() {
  const t = useTranslations("Account");
  const currentUser = useUserStore(state => state.currentUser);
  const isClient = currentUser?.role === "client";

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>

      <Tabs defaultValue="account" className="w-full">
        <TabsList>
          <TabsTrigger value="account">{t("accountTab")}</TabsTrigger>
          {isClient ? (
            <TabsTrigger value="company">{t("companyProfileTab")}</TabsTrigger>
          ) : (
            <TabsTrigger value="company">{t("companyInformationTab")}</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="account" className="mt-6">
          <AccountProfile />
        </TabsContent>

        <TabsContent value="company" className="mt-6">
          {isClient ? <CompanyProfile /> : <GaneshlabInfo />}
        </TabsContent>
      </Tabs>
    </div>
  );
}
