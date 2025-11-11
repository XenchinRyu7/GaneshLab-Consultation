"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { useUserStore } from "@/stores/user/user-provider";

const companySchema = z.object({
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

type CompanyFormValues = z.infer<typeof companySchema>;

interface Company {
  id: string;
  name: string;
  website?: string | null;
  description?: string | null;
  industry?: string | null;
  address?: string | null;
  city?: string | null;
  province?: string | null;
  postalCode?: string | null;
  country?: string | null;
  phone?: string | null;
  email?: string | null;
  contactPerson?: string | null;
  contactPhone?: string | null;
  contactEmail?: string | null;
  isVerified: boolean;
}

export function CompanyProfile() {
  const currentUser = useUserStore((state) => state.currentUser);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [company, setCompany] = useState<Company | null>(null);
  const [fetching, setFetching] = useState(true);

  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: "",
      website: "",
      description: "",
      industry: "",
      address: "",
      city: "",
      province: "",
      postalCode: "",
      country: "Indonesia",
      phone: "",
      email: "",
      contactPerson: "",
      contactPhone: "",
      contactEmail: "",
    },
  });

  useEffect(() => {
    if (currentUser) {
      fetchCompany();
    }
  }, [currentUser]);

  async function fetchCompany() {
    if (!currentUser) {
      console.error("[CompanyProfile] No user found in store");
      setFetching(false);
      return;
    }

    try {
      setFetching(true);
      const userId = currentUser.id;
      
      console.log("[CompanyProfile] Fetching company for user:", {
        id: userId,
        email: currentUser.email,
        role: currentUser.role,
      });

      const response = await fetch(`/api/companies?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.company) {
          setCompany(data.company);
          form.reset({
            name: data.company.name || "",
            website: data.company.website || "",
            description: data.company.description || "",
            industry: data.company.industry || "",
            address: data.company.address || "",
            city: data.company.city || "",
            province: data.company.province || "",
            postalCode: data.company.postalCode || "",
            country: data.company.country || "Indonesia",
            phone: data.company.phone || "",
            email: data.company.email || "",
            contactPerson: data.company.contactPerson || "",
            contactPhone: data.company.contactPhone || "",
            contactEmail: data.company.contactEmail || "",
          });
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error("[CompanyProfile] Error fetching company:", {
          status: response.status,
          error: errorData,
          userId,
        });
      }
    } catch (error) {
      console.error("[CompanyProfile] Error fetching company:", error);
    } finally {
      setFetching(false);
    }
  }

  async function onSubmit(data: CompanyFormValues) {
    if (!currentUser) {
      console.error("[CompanyProfile] No user found in store");
      toast.error("User not found. Please login again.");
      return;
    }

    if (currentUser.role !== "client") {
      console.error("[CompanyProfile] User is not a client:", currentUser.role);
      toast.error("Only clients can save company profile");
      return;
    }

    try {
      setLoading(true);
      const userId = currentUser.id;
      
      console.log("[CompanyProfile] Saving company profile for user:", {
        id: userId,
        email: currentUser.email,
        role: currentUser.role,
        companyName: data.name,
      });

      const response = await fetch("/api/companies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          ...data,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("[CompanyProfile] Error saving company:", {
          status: response.status,
          error,
          userId,
        });
        
        // Show more detailed error message
        const errorMessage = error.details 
          ? `${error.error}: ${error.details}`
          : error.error || "Failed to save company";
        
        throw new Error(errorMessage);
      }

      const result = await response.json();
      setCompany(result.company);
      setSaved(true);
      toast.success("Company profile saved successfully");
      setTimeout(() => setSaved(false), 3000);
    } catch (error: any) {
      console.error("[CompanyProfile] Error saving company:", error);
      toast.error(error.message || "Failed to save company profile");
    } finally {
      setLoading(false);
    }
  }

  if (fetching) {
    return (
      <Card>
        <CardContent className="py-12">
          <p className="text-center text-muted-foreground">Loading company information...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Company Profile</CardTitle>
        <CardDescription>
          {company
            ? "Update your company information"
            : "Complete your company profile to create projects"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!company && (
          <Alert className="mb-6">
            <Info className="h-4 w-4" />
            <AlertDescription>
              You need to complete your company profile before creating projects. Please fill in all
              required information.
            </AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Basic Information</h3>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter company name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input type="url" placeholder="https://example.com" {...field} value={field.value || ""} />
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
                        placeholder="Company description"
                        className="resize-none"
                        rows={3}
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="industry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Industry</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Technology, Finance, Retail" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Address</h3>
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Street address"
                        className="resize-none"
                        rows={2}
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="City" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="province"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Province</FormLabel>
                      <FormControl>
                        <Input placeholder="Province" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="postalCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Postal Code</FormLabel>
                      <FormControl>
                        <Input placeholder="Postal code" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <FormControl>
                        <Input placeholder="Country" {...field} value={field.value || "Indonesia"} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Contact Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input type="tel" placeholder="Phone number" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="company@example.com" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Contact Person</h3>
              <FormField
                control={form.control}
                name="contactPerson"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Person Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Contact person name" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="contactPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Phone</FormLabel>
                      <FormControl>
                        <Input type="tel" placeholder="Contact phone" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contactEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="contact@example.com" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={loading}>
                {saved ? "Saved!" : loading ? "Saving..." : "Save Company Profile"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

