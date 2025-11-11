"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { useUserStore } from "@/stores/user/user-provider";

const accountSchema = z.object({
  fullname: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
});

type AccountFormValues = z.infer<typeof accountSchema>;

interface UserProfile {
  id: string;
  email: string;
  fullname: string;
  phone: string | null;
  role: string;
  avatarColor: string | null;
}

export function AccountProfile() {
  const currentUser = useUserStore((state) => state.currentUser);
  const setCurrentUser = useUserStore((state) => state.setCurrentUser);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [fetching, setFetching] = useState(true);

  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      fullname: "",
      email: "",
      phone: "",
    },
  });

  useEffect(() => {
    if (currentUser) {
      fetchUserProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  async function fetchUserProfile() {
    if (!currentUser) {
      console.error("[AccountProfile] No user found in store");
      setFetching(false);
      return;
    }

    try {
      setFetching(true);
      console.log("[AccountProfile] Fetching user profile for user:", {
        id: currentUser.id,
        email: currentUser.email,
      });

      const response = await fetch("/api/users/profile");
      if (response.ok) {
        const data = await response.json();
        if (data.user) {
          const userProfile: UserProfile = data.user;
          form.reset({
            fullname: userProfile.fullname || "",
            email: userProfile.email || "",
            phone: userProfile.phone || "",
          });
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error("[AccountProfile] Error fetching user profile:", {
          status: response.status,
          error: errorData,
        });
        toast.error("Failed to load user profile");
      }
    } catch (error) {
      console.error("[AccountProfile] Error fetching user profile:", error);
      toast.error("Failed to load user profile");
    } finally {
      setFetching(false);
    }
  }

  async function onSubmit(data: AccountFormValues) {
    if (!currentUser) {
      console.error("[AccountProfile] No user found in store");
      toast.error("User not found. Please login again.");
      return;
    }

    try {
      setLoading(true);
      console.log("[AccountProfile] Updating user profile:", {
        id: currentUser.id,
        fullname: data.fullname,
        phone: data.phone,
      });

      const response = await fetch("/api/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullname: data.fullname,
          phone: data.phone || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("[AccountProfile] Error updating user profile:", {
          status: response.status,
          error,
        });
        throw new Error(error.error || "Failed to update profile");
      }

      const result = await response.json();
      const updatedUser = result.user;

      // Update user store with new fullname
      if (setCurrentUser && currentUser) {
        setCurrentUser({
          ...currentUser,
          name: updatedUser.fullname,
        });
      }

      setSaved(true);
      toast.success("Profile updated successfully");
      setTimeout(() => setSaved(false), 3000);
    } catch (error: any) {
      console.error("[AccountProfile] Error updating user profile:", error);
      toast.error(error.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  }

  if (fetching) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center text-muted-foreground">Loading profile...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Information</CardTitle>
        <CardDescription>Update your account information and preferences</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="fullname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your full name" {...field} disabled={loading} />
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
                    <Input type="email" placeholder="Enter your email" {...field} disabled />
                  </FormControl>
                  <FormDescription>Email cannot be changed</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input 
                      type="tel" 
                      placeholder="Enter your phone number" 
                      {...field} 
                      value={field.value || ""}
                      disabled={loading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <Button type="submit" disabled={loading || fetching}>
                {saved ? "Saved!" : loading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

