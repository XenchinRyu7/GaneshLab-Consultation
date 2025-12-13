import { format } from "date-fns";
import { CalendarIcon, Clock, FileText } from "lucide-react";

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
  return (
    <div className="space-y-4">
      <h3 className="flex items-center gap-2 text-lg font-semibold text-zinc-200">
        <FileText size={18} />
        Detail Janji Temu
      </h3>

      <FormField
        control={control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-zinc-300">Judul Pertemuan *</FormLabel>
            <FormControl>
              <Input
                placeholder="Konsultasi Pengembangan Website"
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
        name="guestPurpose"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-zinc-300">Tujuan/Keperluan *</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Jelaskan tujuan dan keperluan Anda..."
                className="min-h-[100px] resize-none border-zinc-700 bg-zinc-800/50 text-zinc-100 placeholder-zinc-500 focus:border-transparent focus:ring-2 focus:ring-zinc-500"
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
            <FormLabel className="text-zinc-300">Tipe Pertemuan *</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger className="border-zinc-700 bg-zinc-800/50 text-zinc-100">
                  <SelectValue placeholder="Pilih tipe pertemuan" />
                </SelectTrigger>
              </FormControl>
              <SelectContent className="border-zinc-700 bg-zinc-900">
                <SelectItem
                  value="online"
                  className="text-zinc-100 focus:bg-zinc-800 focus:text-zinc-100"
                >
                  Online (Video Call)
                </SelectItem>
                <SelectItem
                  value="offline"
                  className="text-zinc-100 focus:bg-zinc-800 focus:text-zinc-100"
                >
                  Offline (Tatap Muka)
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
            <FormLabel className="flex items-center gap-2 text-zinc-300">
              <CalendarIcon size={14} />
              Tanggal *
            </FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full border-zinc-700 bg-zinc-800/50 pl-3 text-left font-normal text-zinc-100 hover:bg-zinc-800 hover:text-zinc-100",
                      !field.value && "text-zinc-500"
                    )}
                  >
                    {field.value ? format(field.value, "PPP") : <span>Pilih tanggal</span>}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto border-zinc-700 bg-zinc-900 p-0" align="start">
                <Calendar
                  mode="single"
                  selected={field.value}
                  onSelect={field.onChange}
                  disabled={date => date < new Date() || date < new Date("1900-01-01")}
                  initialFocus
                  className="border-zinc-700 bg-zinc-900 text-zinc-100"
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
            <FormLabel className="flex items-center gap-2 text-zinc-300">
              <Clock size={14} className="text-zinc-300" />
              Waktu Preferensi *
            </FormLabel>
            <FormControl>
              <Input
                type="text"
                placeholder="HH:mm (contoh: 14:30)"
                maxLength={5}
                className="border-zinc-700 bg-zinc-800/50 text-zinc-100 placeholder-zinc-500 focus:border-transparent focus:ring-2 focus:ring-zinc-500"
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
            <FormDescription className="text-zinc-500">
              Waktu yang Anda inginkan (akan dikonfirmasi oleh admin). Format: 24 jam (HH:mm)
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="duration"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-zinc-300">Durasi *</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger className="border-zinc-700 bg-zinc-800/50 text-zinc-100">
                  <SelectValue placeholder="Pilih durasi" />
                </SelectTrigger>
              </FormControl>
              <SelectContent className="border-zinc-700 bg-zinc-900">
                <SelectItem
                  value="30"
                  className="text-zinc-100 focus:bg-zinc-800 focus:text-zinc-100"
                >
                  30 menit
                </SelectItem>
                <SelectItem
                  value="60"
                  className="text-zinc-100 focus:bg-zinc-800 focus:text-zinc-100"
                >
                  1 jam
                </SelectItem>
                <SelectItem
                  value="90"
                  className="text-zinc-100 focus:bg-zinc-800 focus:text-zinc-100"
                >
                  1.5 jam
                </SelectItem>
                <SelectItem
                  value="120"
                  className="text-zinc-100 focus:bg-zinc-800 focus:text-zinc-100"
                >
                  2 jam
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
