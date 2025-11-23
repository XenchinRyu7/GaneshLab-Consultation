"use client";

import { useState } from "react";

import { AlertCircle } from "lucide-react";
import z from "zod";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";

// Validation schema for edit
export const editUserSchema = z.object({
  fullname: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().optional().or(z.literal("")),
  role: z.enum(["pic", "client"], {
    errorMap: () => ({ message: "Role must be PIC or Client" }),
  }),
  password: z.string().optional().or(z.literal("")),
  changePassword: z.boolean().default(false),
});

type EditUserInput = z.infer<typeof editUserSchema>;

interface EditUserFormProps {
  userId: string;
  initialData: {
    fullname: string;
    phone?: string | null;
    role: "pic" | "client";
  };
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function EditUserForm({ userId, initialData, onSuccess, onError }: EditUserFormProps) {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [changePassword, setChangePassword] = useState(false);
  const [formData, setFormData] = useState<EditUserInput>({
    fullname: initialData.fullname,
    phone: initialData.phone ?? "",
    role: initialData.role,
    password: "",
    changePassword: false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleRoleChange = (value: string) => {
    setFormData(prev => ({ ...prev, role: value as "pic" | "client" }));
    if (errors.role) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.role;
        return newErrors;
      });
    }
  };

  const handleChangePasswordToggle = () => {
    const newChangePassword = !changePassword;
    setChangePassword(newChangePassword);
    setFormData(prev => ({ ...prev, changePassword: newChangePassword }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      const toValidate = {
        fullname: formData.fullname,
        phone: formData.phone,
        role: formData.role,
        password: changePassword ? formData.password : "",
        changePassword,
      };

      // Validate form
      const validated = editUserSchema.parse(toValidate);

      if (changePassword && !validated.password) {
        setErrors({ password: "Password is required when changing password" });
        return;
      }

      setLoading(true);

      // Call API to update user
      const response = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullname: validated.fullname,
          phone: validated.phone ?? null,
          role: validated.role,
          ...(changePassword && { password: validated.password }),
        }),
      });

      console.log("Edit API response status:", response.status);

      if (!response.ok) {
        const error = await response.json();
        console.error("Edit API error response:", error, "Status:", response.status);
        const errorMessage = error.error ?? error.message ?? "Failed to update user";
        setErrors({ submit: errorMessage });
        onError?.(errorMessage);
        setLoading(false);
        return;
      }

      const data = await response.json();
      console.log("Edit API success:", data);
      onSuccess?.();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach(err => {
          const field = err.path[0];
          if (field) {
            fieldErrors[field.toString()] = err.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        const message = error instanceof Error ? error.message : "An error occurred";
        console.error("Edit form error:", message);
        onError?.(message);
        setErrors({ submit: message });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Error Alert */}
      {errors.submit && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertDescription>{errors.submit}</AlertDescription>
        </Alert>
      )}

      {/* Full Name */}
      <div className="space-y-2">
        <Label htmlFor="fullname">Full Name *</Label>
        <Input
          id="fullname"
          name="fullname"
          type="text"
          value={formData.fullname}
          onChange={handleInputChange}
          placeholder="John Doe"
          disabled={loading}
          className={errors.fullname ? "border-destructive" : ""}
        />
        {errors.fullname && <p className="text-destructive text-xs">{errors.fullname}</p>}
      </div>

      {/* Phone */}
      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number (Optional)</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={handleInputChange}
          placeholder="+62 812 3456 7890"
          disabled={loading}
        />
        {errors.phone && <p className="text-destructive text-xs">{errors.phone}</p>}
      </div>

      {/* Role */}
      <div className="space-y-2">
        <Label htmlFor="role">Role *</Label>
        <Select value={formData.role} onValueChange={handleRoleChange} disabled={loading}>
          <SelectTrigger className={errors.role ? "border-destructive" : ""}>
            <SelectValue placeholder="Select a role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pic">PIC (Project In Charge)</SelectItem>
            <SelectItem value="client">Client</SelectItem>
          </SelectContent>
        </Select>
        {errors.role && <p className="text-destructive text-xs">{errors.role}</p>}
      </div>

      {/* Password Section */}
      <div className="space-y-3 rounded-lg border p-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Password Management</Label>
          <Button
            type="button"
            variant={changePassword ? "default" : "outline"}
            size="sm"
            onClick={handleChangePasswordToggle}
            disabled={loading}
          >
            {changePassword ? "Changing Password" : "Keep Current"}
          </Button>
        </div>

        {changePassword && (
          <div className="space-y-2">
            <Input
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Enter new password"
              disabled={loading}
              className={errors.password ? "border-destructive" : ""}
            />
            {errors.password && <p className="text-destructive text-xs">{errors.password}</p>}
          </div>
        )}
      </div>

      {/* Buttons */}
      <div className="flex gap-2 pt-4">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? (
            <>
              <Spinner className="mr-2 size-4" />
              Updating...
            </>
          ) : (
            "Update User"
          )}
        </Button>
      </div>
    </form>
  );
}
