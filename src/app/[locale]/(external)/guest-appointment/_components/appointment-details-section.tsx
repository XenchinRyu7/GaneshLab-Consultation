import { format } from "date-fns";
import { CalendarIcon, Clock, FileText } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export function AppointmentDetailsSection({ control }: { control: any }) {
  const t = useTranslations("GuestAppointment");

  return (
    <div className="space-y-4">
      <h3 className="flex items-center gap-2 text-lg font-semibold">
        <FileText size={18} />
        {t("formTitle")}
      </h3>

      <FormField
        control={control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-black">{t("meetingTitleLabel")} *</FormLabel>
            <FormControl>
              <Input
                placeholder={t("meetingTitlePlaceholder")}
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
        name="guestPurpose"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-black">{t("purposeLabel")} *</FormLabel>
            <FormControl>
              <Textarea
                placeholder={t("purposePlaceholder")}
                className="w-full resize-none rounded-lg border border-gray-300 bg-white px-4 py-3 text-black placeholder-gray-500 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="type"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-black">{t("meetingTypeLabel")} *</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-black placeholder-gray-500 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none">
                  <SelectValue placeholder={t("meetingTypePlaceholder")} />
                </SelectTrigger>
              </FormControl>
              <SelectContent className="border-gray-300 bg-white">
                <SelectItem value="online" className="focus:bg-blue-500 focus:text-white">
                  {t("onlineMeeting")}
                </SelectItem>
                <SelectItem value="offline" className="focus:bg-blue-500 focus:text-white">
                  {t("offlineMeeting")}
                </SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="date"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel className="flex items-center gap-2 text-black">
              <CalendarIcon size={14} />
              {t("dateLabel")} *
            </FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full border-gray-300 bg-white pl-3 text-left font-normal text-black",
                      !field.value && "text-gray-500"
                    )}
                  >
                    {field.value ? format(field.value, "PPP") : <span>{t("selectDate")}</span>}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto border-gray-300 bg-white p-0" align="start">
                <Calendar
                  mode="single"
                  selected={field.value}
                  onSelect={field.onChange}
                  disabled={date => date < new Date() || date < new Date("1900-01-01")}
                  initialFocus
                  className="border-gray-300 bg-white text-black"
                />
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="preferredTime"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2 text-black">
              <Clock size={14} />
              {t("timeLabel")} *
            </FormLabel>
            <FormControl>
              <Input
                type="text"
                placeholder={t("timePlaceholder")}
                maxLength={5}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-black placeholder-gray-500 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
                {...field}
                onChange={e => {
                  let value = e.target.value;
                  // Hanya izinkan angka dan colon
                  value = value.replace(/[^0-9:]/g, "");
                  // Auto insert colon setelah 2 digit pertama
                  if (value.length === 2 && !value.includes(":")) {
                    value = value + ":";
                  }
                  // Batasi panjang maksimal 5 karakter (HH:mm)
                  if (value.length <= 5) {
                    field.onChange(value);
                  }
                }}
              />
            </FormControl>
            <FormDescription className="text-zinc-400">{t("timeDescription")}</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="duration"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-black">{t("durationLabel")} *</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-black focus:outline-none">
                  <SelectValue placeholder={t("durationPlaceholder")} />
                </SelectTrigger>
              </FormControl>
              <SelectContent className="border-gray-300 bg-white">
                <SelectItem value="30" className="focus:bg-blue-500 focus:text-white">
                  {t("30minutes")}
                </SelectItem>
                <SelectItem value="60" className="focus:bg-blue-500 focus:text-white">
                  {t("1hour")}
                </SelectItem>
                <SelectItem value="90" className="focus:bg-blue-500 focus:text-white">
                  {t("1_5hours")}
                </SelectItem>
                <SelectItem value="120" className="focus:bg-blue-500 focus:text-white">
                  {t("2hours")}
                </SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
