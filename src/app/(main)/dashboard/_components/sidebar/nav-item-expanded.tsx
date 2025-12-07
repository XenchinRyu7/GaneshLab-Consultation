import Link from "next/link";

import { ChevronRight } from "lucide-react";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import type { NavMainItem } from "@/navigation/sidebar/sidebar-items";
import { useUserStore } from "@/stores/user/user-provider";
import { useNotifications } from "../notifications/notification-context";

const IsComingSoon = () => (
  <span className="ml-auto rounded-md bg-gray-200 px-2 py-1 text-xs dark:text-gray-800">Soon</span>
);

interface NavItemExpandedProps {
  item: NavMainItem;
  isActive: (url: string, subItems?: NavMainItem["subItems"]) => boolean;
  isSubmenuOpen: (subItems?: NavMainItem["subItems"]) => boolean;
}

export function NavItemExpanded({ item, isActive, isSubmenuOpen }: NavItemExpandedProps) {
  const currentUser = useUserStore(state => state.currentUser);
  const { unreadCount } = useNotifications();

  const showBadge = item.url === "/dashboard/notifications" && unreadCount > 0;

  return (
    <Collapsible
      key={item.title}
      asChild
      defaultOpen={isSubmenuOpen(item.subItems)}
      className="group/collapsible"
    >
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          {item.subItems ? (
            <SidebarMenuButton
              disabled={item.comingSoon}
              isActive={isActive(item.url, item.subItems)}
              tooltip={item.title}
            >
              {item.icon && <item.icon />}
              <span>{item.title}</span>
              {item.comingSoon && <IsComingSoon />}
              <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
            </SidebarMenuButton>
          ) : (
            <SidebarMenuButton
              asChild
              aria-disabled={item.comingSoon}
              isActive={isActive(item.url)}
              tooltip={item.title}
            >
              <Link href={item.url} target={item.newTab ? "_blank" : undefined}>
                {item.icon && <item.icon />}
                <span>{item.title}</span>
                {showBadge && (
                  <Badge variant="destructive" className="ml-auto h-5 px-1.5 text-xs">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </Badge>
                )}
                {item.comingSoon && <IsComingSoon />}
              </Link>
            </SidebarMenuButton>
          )}
        </CollapsibleTrigger>
        {item.subItems && (
          <CollapsibleContent>
            <SidebarMenuSub>
              {item.subItems
                .filter(subItem => {
                  if (subItem.roles && currentUser) {
                    return subItem.roles.includes(currentUser.role);
                  }
                  return true;
                })
                .map(subItem => (
                  <SidebarMenuSubItem key={subItem.title}>
                    <SidebarMenuSubButton
                      aria-disabled={subItem.comingSoon}
                      isActive={isActive(subItem.url)}
                      asChild
                    >
                      <Link href={subItem.url} target={subItem.newTab ? "_blank" : undefined}>
                        {subItem.icon && <subItem.icon />}
                        <span>{subItem.title}</span>
                        {subItem.comingSoon && <IsComingSoon />}
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                ))}
            </SidebarMenuSub>
          </CollapsibleContent>
        )}
      </SidebarMenuItem>
    </Collapsible>
  );
}
