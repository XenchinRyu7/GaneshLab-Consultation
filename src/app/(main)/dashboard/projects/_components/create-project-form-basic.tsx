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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { PROJECT_TYPES, type ProjectFormValues } from "./create-project-schema";

interface PIC {
  id: string;
  fullname: string;
  email: string;
}

interface CreateProjectFormBasicProps {
  form: UseFormReturn<ProjectFormValues>;
  pics: PIC[];
  loading: boolean;
}

export function CreateProjectFormBasic({ form, pics, loading }: CreateProjectFormBasicProps) {
  const selectedType = form.watch("type");

  return (
    <>
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Project Name *</FormLabel>
            <FormControl>
              <Input placeholder="Enter project name" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Enter project description"
                className="resize-none"
                rows={4}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Project Type *</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select project type" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {PROJECT_TYPES.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {selectedType === "OTHER" && (
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Custom Category</FormLabel>
              <FormControl>
                <Input placeholder="Enter custom category" {...field} value={field.value ?? ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      <FormField
        control={form.control}
        name="picId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>PIC (Person In Charge) *</FormLabel>
            <Select onValueChange={field.onChange} value={field.value} disabled={loading}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select a PIC" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {pics.map(pic => (
                  <SelectItem key={pic.id} value={pic.id}>
                    {pic.fullname} ({pic.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormDescription>Select the PIC who will manage this project</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
