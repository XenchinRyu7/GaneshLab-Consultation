"use client";
import { useTranslations } from "next-intl";

import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { Link } from "@/i18n/routing";
import type { NavMainItem } from "@/navigation/sidebar/sidebar-items";

interface NavItemSimpleProps {
  item: NavMainItem;
  isActive: (url: string) => boolean;
}

export function NavItemSimple({ item, isActive }: NavItemSimpleProps) {
  const t = useTranslations();
  const title = item.titleKey ? t(item.titleKey) : item.title;

  return (
    <SidebarMenuItem key={item.title}>
      <SidebarMenuButton
        asChild
        aria-disabled={item.comingSoon}
        tooltip={title}
        isActive={isActive(item.url)}
      >
        <Link href={item.url} target={item.newTab ? "_blank" : undefined}>
          {item.icon && <item.icon />}
          <span>{title}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
