import * as z from "zod";

export const companySchema = z.object({
  name: z.string().min(1, "Company name is required"),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
  description: z.string().optional(),
  industry: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  contactPerson: z.string().optional(),
  contactPhone: z.string().optional(),
  contactEmail: z.string().email("Invalid email").optional().or(z.literal("")),
});

export type CompanyFormValues = z.infer<typeof companySchema>;
