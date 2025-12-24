"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { signIn } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const FormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  remember: z.boolean().optional(),
});

export function LoginForm() {
  const router = useRouter();
  const t = useTranslations("Auth");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
  });

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    setIsLoading(true);
    console.log("[LoginForm] Starting login for:", data.email);

    try {
      const result = await signIn(data.email, data.password, data.remember ?? false);

      console.log("[LoginForm] SignIn result:", result);

      if (result.error) {
        console.error("[LoginForm] Login error:", result.error);
        toast.error(t("loginFailed"), {
          description: result.error,
          duration: 5000,
        });
        setIsLoading(false);
      } else {
        console.log("[LoginForm] Login successful, redirecting...");
        toast.success(t("loginSuccessMessage"), {
          description: data.remember
            ? t("loginSuccessDescription")
            : t("loginSuccessDescriptionShort"),
        });
        router.refresh();
      }
    } catch (error) {
      console.error("[LoginForm] Unexpected error:", error);

      if (error && typeof error === "object" && "digest" in error) {
        console.log("[LoginForm] Redirect error (expected):", error);
        return;
      }

      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error("[LoginForm] Actual error:", errorMessage);

      toast.error(t("unexpectedError"), {
        description: errorMessage,
        duration: 5000,
      });
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("emailLabel")}</FormLabel>
              <FormControl>
                <Input
                  id="email"
                  type="email"
                  placeholder={t("emailPlaceholder")}
                  autoComplete="email"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("passwordLabel")}</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={t("passwordPlaceholder")}
                    autoComplete="current-password"
                    {...field}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPassword(prev => !prev)}
                    className="absolute top-1/2 right-2 -translate-y-1/2 p-1"
                    aria-label={showPassword ? t("hidePassword") : t("showPassword")}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="remember"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center">
              <FormControl>
                <Checkbox
                  id="login-remember"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className="size-4"
                />
              </FormControl>
              <FormLabel
                htmlFor="login-remember"
                className="text-muted-foreground ml-1 text-sm font-medium"
              >
                {t("rememberMe")}
              </FormLabel>
            </FormItem>
          )}
        />

        <Button className="w-full" type="submit" disabled={isLoading}>
          {isLoading ? t("loggingIn") : t("loginButton")}
        </Button>
      </form>
    </Form>
  );
}
