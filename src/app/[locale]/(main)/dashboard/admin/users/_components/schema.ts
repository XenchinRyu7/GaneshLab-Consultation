import z from "zod";

export const recentLeadSchema = z.object({
  id: z.string(),
  name: z.string(),
  company: z.string(),
  status: z.string(),
  source: z.string(),
  lastActivity: z.string(),
});

export const userSchema = z.object({
  id: z.string(),
  userId: z.string(),
  email: z.string(),
  fullname: z.string(),
  role: z.enum(["admin", "pic", "client"]),
  phone: z.string().nullable(),
  avatarColor: z.string().nullable(),
  createdAt: z.string(),
});
