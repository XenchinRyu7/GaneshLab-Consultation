"use client";

import { useState, useEffect, useCallback } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Info } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { useUserStore } from "@/stores/user/user-provider";

import { CompanyProfileFormAddress } from "./company-profile-form-address";
import { CompanyProfileFormBasic } from "./company-profile-form-basic";
import { CompanyProfileFormContact } from "./company-profile-form-contact";
import { companySchema, type CompanyFormValues } from "./company-profile-schema";

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
  const currentUser = useUserStore(state => state.currentUser);
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

  const buildBasicFormData = useCallback(
    (company: Company) => ({
      name: company.name,
      website: company.website ?? "",
      description: company.description ?? "",
      industry: company.industry ?? "",
    }),
    []
  );

  const buildAddressFormData = useCallback(
    (company: Company) => ({
      address: company.address ?? "",
      city: company.city ?? "",
      province: company.province ?? "",
      postalCode: company.postalCode ?? "",
      country: company.country ?? "Indonesia",
    }),
    []
  );

  const buildContactFormData = useCallback(
    (company: Company) => ({
      phone: company.phone ?? "",
      email: company.email ?? "",
      contactPerson: company.contactPerson ?? "",
      contactPhone: company.contactPhone ?? "",
      contactEmail: company.contactEmail ?? "",
    }),
    []
  );

  const resetFormWithCompanyData = useCallback(
    (company: Company) => {
      form.reset({
        ...buildBasicFormData(company),
        ...buildAddressFormData(company),
        ...buildContactFormData(company),
      });
    },
    [form, buildBasicFormData, buildAddressFormData, buildContactFormData]
  );

  const fetchCompany = useCallback(async () => {
    if (!currentUser) {
      console.error("[CompanyProfile] No user found in store");
      setFetching(false);
      return;
    }

    try {
      setFetching(true);
      const response = await fetch(`/api/companies?userId=${currentUser.id}`);

      if (response.ok) {
        const data = await response.json();
        if (data.company) {
          setCompany(data.company);
          resetFormWithCompanyData(data.company);
        }
      } else {
        console.error("[CompanyProfile] Error fetching company:", {
          status: response.status,
          userId: currentUser.id,
        });
      }
    } catch (error) {
      console.error("[CompanyProfile] Error fetching company:", error);
    } finally {
      setFetching(false);
    }
  }, [currentUser, resetFormWithCompanyData]);

  useEffect(() => {
    if (currentUser) {
      fetchCompany();
    }
  }, [currentUser, fetchCompany]);

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
          : (error.error ?? "Failed to save company");

        throw new Error(errorMessage);
      }

      const result = await response.json();
      setCompany(result.company);
      setSaved(true);
      toast.success("Company profile saved successfully");
      setTimeout(() => setSaved(false), 3000);
    } catch (error: unknown) {
      console.error("[CompanyProfile] Error saving company:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save company profile");
    } finally {
      setLoading(false);
    }
  }

  if (fetching) {
    return (
      <Card>
        <CardContent className="py-12">
          <p className="text-muted-foreground text-center">Loading company information...</p>
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
              <CompanyProfileFormBasic form={form} />
            </div>

            <div className="space-y-4">
              <CompanyProfileFormAddress form={form} />
            </div>

            <div className="space-y-4">
              <CompanyProfileFormContact form={form} />
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
