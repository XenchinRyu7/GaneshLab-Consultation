import { Link } from "@/i18n/routing";

import type { UseFormReturn } from "react-hook-form";

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import type { ProjectFormValues } from "./create-project-schema";

interface CreateProjectFormBudgetProps {
  form: UseFormReturn<ProjectFormValues>;
}

export function CreateProjectFormBudget({ form }: CreateProjectFormBudgetProps) {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="budgetMin"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Budget Minimum (IDR)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Minimum budget"
                  {...field}
                  value={field.value ?? ""}
                  onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="budgetMax"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Budget Maximum (IDR)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Maximum budget"
                  {...field}
                  value={field.value ?? ""}
                  onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <p className="text-muted-foreground text-sm">
        Enter your budget range. PIC will provide estimated cost after reviewing the project.
      </p>

      <FormField
        control={form.control}
        name="clientNotes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Notes</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Additional notes (visible to client and PIC)"
                className="resize-none"
                rows={4}
                {...field}
                value={field.value ?? ""}
              />
            </FormControl>
            <FormDescription>
              Add any additional notes or information about this project.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="bg-muted/50 rounded-lg border p-4">
        <p className="text-muted-foreground text-sm">
          <strong>Note:</strong> Company information is managed in your{" "}
          <Link href="/dashboard/account" className="text-primary underline">
            Company Profile
          </Link>
          . Make sure your company profile is complete before creating projects.
        </p>
      </div>
    </>
  );
}
