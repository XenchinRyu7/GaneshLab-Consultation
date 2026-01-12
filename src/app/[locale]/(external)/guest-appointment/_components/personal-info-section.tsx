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
      <h3 className="flex items-center gap-2 text-lg font-semibold">
        <User size={18} />
        {t("formTitle")}
      </h3>

      <FormField
        control={control}
        name="guestName"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-black">{t("nameLabel")} *</FormLabel>
            <FormControl>
              <Input
                placeholder="John Doe"
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-black placeholder-gray-500 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
            <FormLabel className="flex items-center gap-2 text-black">
              <Mail size={14} />
              {t("emailLabel")} *
            </FormLabel>
            <FormControl>
              <Input
                type="email"
                placeholder="john@example.com"
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-black placeholder-gray-500 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
            <FormLabel className="flex items-center gap-2 text-black">
              <Phone size={14} />
              {t("phoneLabel")} *
            </FormLabel>
            <FormControl>
              <Input
                placeholder="08123456789"
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-black placeholder-gray-500 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
            <FormLabel className="flex items-center gap-2 text-black">
              <Building2 size={14} />
              {t("companyLabel")}
            </FormLabel>
            <FormControl>
              <Input
                placeholder="PT. Example Indonesia"
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-black placeholder-gray-500 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
                {...field}
              />
            </FormControl>
            <FormDescription className="text-zinc-400">{t("optional")}</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
