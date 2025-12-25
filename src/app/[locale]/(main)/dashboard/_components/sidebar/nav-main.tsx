"use client";

import { useTranslations } from "next-intl";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  useSidebar,
} from "@/components/ui/sidebar";
import { usePathname } from "@/i18n/routing";
import { type NavGroup, type NavMainItem } from "@/navigation/sidebar/sidebar-items";
import { useUserStore } from "@/stores/user/user-provider";

import { NavCreateProjectButton } from "./nav-create-project-button";
import { NavItemCollapsed } from "./nav-item-collapsed";
import { NavItemExpanded } from "./nav-item-expanded";
import { NavItemSimple } from "./nav-item-simple";
import { ProjectSelector } from "./project-selector";

interface NavMainProps {
  readonly items: readonly NavGroup[];
}

export function NavMain({ items }: NavMainProps) {
  const path = usePathname();
  const { state, isMobile } = useSidebar();
  const currentUser = useUserStore(state => state.currentUser);
  const t = useTranslations();

  const isItemActive = (url: string, subItems?: NavMainItem["subItems"]) => {
    if (subItems?.length) {
      // For items with subItems, only be active if current path exactly matches the main URL
      return path === url;
    }
    return path === url;
  };

  const isSubmenuOpen = (subItems?: NavMainItem["subItems"]) => {
    return subItems?.some(sub => path.startsWith(sub.url)) ?? false;
  };

  return (
    <>
      <NavCreateProjectButton />
      {/* Only show ProjectSelector for CLIENT role */}
      {currentUser?.role === "client" && (
        <SidebarGroup>
          <SidebarGroupContent>
            <ProjectSelector />
          </SidebarGroupContent>
        </SidebarGroup>
      )}
      {items
        .filter(group => {
          if (group.roles && currentUser) {
            return group.roles.includes(currentUser.role);
          }
          return true;
        })
        .map(group => (
          <SidebarGroup key={group.id}>
            {group.label && (
              <SidebarGroupLabel>
                {group.labelKey ? t(group.labelKey) : group.label}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent className="flex flex-col gap-2">
              <SidebarMenu>
                {group.items
                  .filter(item => {
                    if (item.roles && currentUser) {
                      return item.roles.includes(currentUser.role);
                    }
                    return true;
                  })
                  .map(item => {
                    if (state === "collapsed" && !isMobile) {
                      if (!item.subItems) {
                        return (
                          <NavItemSimple key={item.title} item={item} isActive={isItemActive} />
                        );
                      }
                      return (
                        <NavItemCollapsed key={item.title} item={item} isActive={isItemActive} />
                      );
                    }
                    return (
                      <NavItemExpanded
                        key={item.title}
                        item={item}
                        isActive={isItemActive}
                        isSubmenuOpen={isSubmenuOpen}
                      />
                    );
                  })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
    </>
  );
}
