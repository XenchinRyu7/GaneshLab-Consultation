"use client";

import { useState } from "react";

import { AlertCircle } from "lucide-react";
import z from "zod";
import { toast } from "sonner";

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

// Validation schema
export const createUserSchema = z.object({
  email: z.string().email("Invalid email address"),
  fullname: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().optional().or(z.literal("")),
  role: z.enum(["pic", "client"], {
    errorMap: () => ({ message: "Role must be PIC or Client" }),
  }),
  password: z.string().optional().or(z.literal("")),
  autoGeneratePassword: z.boolean().default(true),
});

type CreateUserInput = z.infer<typeof createUserSchema>;

interface CreateUserFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

// Generate random color for avatar
function generateRandomColor(): string {
  const colors = [
    "#3b82f6", // blue
    "#10b981", // emerald
    "#f59e0b", // amber
    "#ef4444", // red
    "#8b5cf6", // violet
    "#ec4899", // pink
    "#06b6d4", // cyan
    "#14b8a6", // teal
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

// Generate random password
function generateRandomPassword(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
  let password = "";
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

export function CreateUserForm({ onSuccess, onError }: CreateUserFormProps) {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [autoPassword, setAutoPassword] = useState(true);
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateUserInput>({
    email: "",
    fullname: "",
    phone: "",
    role: "pic",
    password: "",
    autoGeneratePassword: true,
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

  const handleAutoPasswordToggle = () => {
    const newAutoPassword = !autoPassword;
    setAutoPassword(newAutoPassword);

    if (newAutoPassword) {
      const newPass = generateRandomPassword();
      setGeneratedPassword(newPass);
      setFormData(prev => ({ ...prev, password: newPass, autoGeneratePassword: true }));
    } else {
      setFormData(prev => ({ ...prev, autoGeneratePassword: false }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      // Validate form
      const validated = createUserSchema.parse({
        ...formData,
        password: autoPassword
          ? (generatedPassword ?? generateRandomPassword())
          : formData.password,
      });

      if (!autoPassword && !validated.password) {
        setErrors({ password: "Password is required if not auto-generated" });
        return;
      }

      setLoading(true);

      // Call API to create user
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...validated,
          avatarColor: generateRandomColor(),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message ?? "Failed to create user");
      }

      // Reset form
      setFormData({
        email: "",
        fullname: "",
        phone: "",
        role: "pic",
        password: "",
        autoGeneratePassword: true,
      });
      setGeneratedPassword(null);
      setAutoPassword(true);

      toast.success("User created successfully", {
        description: `${validated.fullname} (${validated.email}) has been added to the system.`,
      });
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
        toast.error("Failed to create user", {
          description: message,
        });
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

      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email">Email *</Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleInputChange}
          placeholder="user@example.com"
          disabled={loading}
          className={errors.email ? "border-destructive" : ""}
        />
        {errors.email && <p className="text-destructive text-xs">{errors.email}</p>}
      </div>

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
            variant={autoPassword ? "default" : "outline"}
            size="sm"
            onClick={handleAutoPasswordToggle}
            disabled={loading}
          >
            {autoPassword ? "Auto-Generated" : "Manual"}
          </Button>
        </div>

        {autoPassword && generatedPassword && (
          <div className="bg-muted rounded-md p-2">
            <p className="text-muted-foreground mb-1 text-xs">Generated Password:</p>
            <p className="font-mono text-sm break-all">{generatedPassword}</p>
          </div>
        )}

        {!autoPassword && (
          <div className="space-y-2">
            <Input
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Enter password"
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
              Creating...
            </>
          ) : (
            "Create User"
          )}
        </Button>
      </div>
    </form>
  );
}
