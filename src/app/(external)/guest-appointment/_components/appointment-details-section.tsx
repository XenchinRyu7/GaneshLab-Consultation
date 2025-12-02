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
              <SelectContent>
                <SelectItem value="online">Online (Video Call)</SelectItem>
                <SelectItem value="offline">Offline (Tatap Muka)</SelectItem>
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
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={field.value}
                  onSelect={field.onChange}
                  disabled={date => date < new Date() || date < new Date("1900-01-01")}
                  initialFocus
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
              <Clock size={14} />
              Waktu Preferensi *
            </FormLabel>
            <FormControl>
              <Input
                type="time"
                className="border-zinc-700 bg-zinc-800/50 text-zinc-100 focus:border-transparent focus:ring-2 focus:ring-zinc-500"
                {...field}
              />
            </FormControl>
            <FormDescription className="text-zinc-500">
              Waktu yang Anda inginkan (akan dikonfirmasi oleh admin)
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
              <SelectContent>
                <SelectItem value="30">30 menit</SelectItem>
                <SelectItem value="60">1 jam</SelectItem>
                <SelectItem value="90">1.5 jam</SelectItem>
                <SelectItem value="120">2 jam</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
