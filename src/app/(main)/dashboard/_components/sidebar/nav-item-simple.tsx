import Link from "next/link";

import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import type { NavMainItem } from "@/navigation/sidebar/sidebar-items";

interface NavItemSimpleProps {
  item: NavMainItem;
  isActive: (url: string) => boolean;
}

export function NavItemSimple({ item, isActive }: NavItemSimpleProps) {
  return (
    <SidebarMenuItem key={item.title}>
      <SidebarMenuButton
        asChild
        aria-disabled={item.comingSoon}
        tooltip={item.title}
        isActive={isActive(item.url)}
      >
        <Link href={item.url} target={item.newTab ? "_blank" : undefined}>
          {item.icon && <item.icon />}
          <span>{item.title}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
