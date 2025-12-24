import { Building2, Mail, Phone, User } from "lucide-react";
import { useTranslations } from "next-intl";

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

export function PersonalInfoSection({ control }: { control: any }) {
  const t = useTranslations("GuestAppointment");

  return (
    <div className="space-y-4">
      <h3 className="flex items-center gap-2 text-lg font-semibold text-zinc-200">
        <User size={18} />
        {t("formTitle")}
      </h3>

      <FormField
        control={control}
        name="guestName"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-zinc-300">{t("nameLabel")} *</FormLabel>
            <FormControl>
              <Input
                placeholder="John Doe"
                className="border-zinc-700 bg-zinc-800/50 text-zinc-100 placeholder-zinc-500 focus:border-transparent focus:ring-2 focus:ring-zinc-500"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="guestEmail"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2 text-zinc-300">
              <Mail size={14} />
              {t("emailLabel")} *
            </FormLabel>
            <FormControl>
              <Input
                type="email"
                placeholder="john@example.com"
                className="border-zinc-700 bg-zinc-800/50 text-zinc-100 placeholder-zinc-500 focus:border-transparent focus:ring-2 focus:ring-zinc-500"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="guestPhone"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2 text-zinc-300">
              <Phone size={14} />
              {t("phoneLabel")} *
            </FormLabel>
            <FormControl>
              <Input
                placeholder="08123456789"
                className="border-zinc-700 bg-zinc-800/50 text-zinc-100 placeholder-zinc-500 focus:border-transparent focus:ring-2 focus:ring-zinc-500"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="guestOrganization"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2 text-zinc-300">
              <Building2 size={14} />
              {t("companyLabel")}
            </FormLabel>
            <FormControl>
              <Input
                placeholder="PT. Example Indonesia"
                className="border-zinc-700 bg-zinc-800/50 text-zinc-100 placeholder-zinc-500 focus:border-transparent focus:ring-2 focus:ring-zinc-500"
                {...field}
              />
            </FormControl>
            <FormDescription className="text-zinc-500">{t("optional")}</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
