"use client";
import * as React from "react";

import { Search, type LucideIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useRouter } from "@/i18n/routing";
import { sidebarItems } from "@/navigation/sidebar/sidebar-items";
import { useUserStore } from "@/stores/user/user-provider";

export function SearchDialog() {
  const t = useTranslations("Search");
  const currentUser = useUserStore(state => state.currentUser);
  const router = useRouter();
  const [open, setOpen] = React.useState(false);

  // Generate search items from sidebar items based on user role
  const generateSearchItems = () => {
    if (!currentUser) return [];

    const items: Array<{
      group: string;
      icon?: LucideIcon;
      label: string;
      url: string;
      disabled?: boolean;
    }> = [];

    sidebarItems.forEach(group => {
      // Check if group is accessible based on roles
      if (group.roles && !group.roles.includes(currentUser.role)) {
        return; // Skip if user doesn't have access to this group
      }

      group.items.forEach(item => {
        // Check if item is accessible based on roles
        if (item.roles && !item.roles.includes(currentUser.role)) {
          return; // Skip if user doesn't have access
        }

        if (item.comingSoon) {
          return; // Skip coming soon items
        }

        // Add main item
        items.push({
          group: group.label ?? "Pages",
          icon: item.icon,
          label: item.title,
          url: item.url,
        });

        // Add sub items if they exist
        if (item.subItems) {
          item.subItems.forEach(subItem => {
            if (subItem.roles && !subItem.roles.includes(currentUser.role)) {
              return; // Skip if user doesn't have access
            }

            if (subItem.comingSoon) {
              return; // Skip coming soon items
            }

            items.push({
              group: group.label ?? "Pages",
              icon: subItem.icon,
              label: `${item.title} > ${subItem.title}`,
              url: subItem.url,
            });
          });
        }
      });
    });

    return items;
  };

  const searchItems = generateSearchItems();
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(open => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <>
      <Button
        variant="link"
        className="text-muted-foreground px-0! font-normal hover:no-underline"
        onClick={() => setOpen(true)}
      >
        <Search className="size-4" />
        {t("search")}
        <kbd className="bg-muted inline-flex h-5 items-center gap-1 rounded border px-1.5 text-[10px] font-medium select-none">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder={t("placeholder")} />
        <CommandList>
          <CommandEmpty>{t("noResults")}</CommandEmpty>
          {[...new Set(searchItems.map(item => item.group))].map((group, i) => (
            <React.Fragment key={group}>
              {i !== 0 && <CommandSeparator />}
              <CommandGroup heading={group} key={group}>
                {searchItems
                  .filter(item => item.group === group)
                  .map(item => (
                    <CommandItem
                      className="py-1.5!"
                      key={item.label}
                      onSelect={() => {
                        setOpen(false);
                        router.push(item.url);
                      }}
                    >
                      {item.icon && <item.icon />}
                      <span>{item.label}</span>
                    </CommandItem>
                  ))}
              </CommandGroup>
            </React.Fragment>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  );
}
