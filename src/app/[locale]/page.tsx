"use client";
import { useTranslations } from "next-intl";

import { LangSwitcher } from "@/components/lang-switcher";
import Particles from "@/components/particles";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Link } from "@/i18n/routing";

const navigation = [
  { nameKey: "Nav.getStarted", href: "/get-started" },
  { nameKey: "Nav.terms", href: "/terms-of-service" },
  { nameKey: "Nav.privacy", href: "/privacy-policy" },
];

export default function Home() {
  const t = useTranslations();
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center overflow-x-hidden bg-linear-to-tl from-black via-zinc-600/20 to-black">
      <nav className="animate-fade-in my-16">
        <div className="flex items-center justify-center gap-6">
          <ul className="flex items-center justify-center gap-4">
            {navigation.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-zinc-500 duration-500 hover:text-zinc-300"
              >
                {t(item.nameKey)}
              </Link>
            ))}
          </ul>
          <LangSwitcher />
        </div>
      </nav>
      <div className="animate-glow animate-fade-left hidden h-px w-screen bg-linear-to-r from-zinc-300/0 via-zinc-300/50 to-zinc-300/0 md:block" />
      <Particles className="animate-fade-in absolute inset-0 -z-10" quantity={100} />
      <h1 className="text-edge-outline animate-title font-display z-10 cursor-default bg-white bg-clip-text px-0.5 py-3.5 text-4xl whitespace-nowrap text-transparent duration-1000 sm:text-6xl md:text-9xl">
        {t("Common.appName")}
      </h1>

      <div className="animate-glow animate-fade-right hidden h-px w-screen bg-linear-to-r from-zinc-300/0 via-zinc-300/50 to-zinc-300/0 md:block" />
      <div className="animate-fade-in my-16 space-y-4 text-center">
        <h2 className="text-sm text-zinc-500">{t("Home.tagline")}</h2>

        {/* App Description Section */}
        <div className="mx-auto max-w-2xl space-y-4 text-center">
          <p className="text-sm leading-relaxed text-zinc-400">{t("Home.description")}</p>

          <div className="space-y-3 text-left">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="what-we-do">
                <AccordionTrigger className="text-sm font-semibold text-zinc-300 hover:text-zinc-100">
                  {t("Home.whatWeDo")}
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="mt-2 list-inside list-disc space-y-1 text-xs text-zinc-400">
                    <li>{t("Home.features.consultation")}</li>
                    <li>{t("Home.features.calendar")}</li>
                    <li>{t("Home.features.realtime")}</li>
                    <li>{t("Home.features.milestone")}</li>
                    <li>{t("Home.features.sharing")}</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="data-usage">
                <AccordionTrigger className="text-sm font-semibold text-zinc-300 hover:text-zinc-100">
                  {t("Home.dataUsage")}
                </AccordionTrigger>
                <AccordionContent>
                  <div className="mt-2 space-y-2">
                    <p className="text-xs leading-relaxed text-zinc-400">
                      {t("Home.dataUsageText1")}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {t("Home.dataUsageText2Part1")}{" "}
                      <Link
                        href="/privacy-policy"
                        className="text-zinc-300 underline hover:text-zinc-100"
                      >
                        {t("Home.privacyPolicyLink")}
                      </Link>{" "}
                      {t("Home.dataUsageText2Part2")}
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>

        <div className="flex flex-col items-center gap-3">
          <div className="space-y-2 text-center">
            <p className="text-xs text-zinc-400">
              <span className="font-semibold text-zinc-300">{t("Common.clients")}:</span>{" "}
              {t("Home.clientsNoteTail")}
            </p>
            <Link
              href="/get-started"
              className="inline-block rounded-md border border-zinc-700 bg-zinc-800 px-6 py-2 text-sm font-medium text-zinc-100 duration-300 hover:border-zinc-600 hover:bg-zinc-700"
            >
              {t("Home.getStartedCta")}
            </Link>
          </div>

          <span className="text-xs text-zinc-500">{t("Common.or")}</span>

          <div className="space-y-2 text-center">
            <p className="text-xs text-zinc-400">
              <span className="font-semibold text-zinc-300">{t("Common.guests")}:</span>{" "}
              {t("Home.guestsNoteTail")}
            </p>
            <Link
              href="/guest-appointment"
              className="inline-block rounded-md border border-zinc-700 bg-zinc-800 px-6 py-2 text-sm font-medium text-zinc-100 duration-300 hover:border-zinc-600 hover:bg-zinc-700"
            >
              {t("Home.bookAsGuest")}
            </Link>
          </div>

          <p className="mt-2 text-xs text-zinc-500">
            {t("Home.haveAccount")}{" "}
            <Link
              href="/auth/login"
              className="text-zinc-300 underline duration-300 hover:text-zinc-100"
            >
              {t("Common.signIn")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
