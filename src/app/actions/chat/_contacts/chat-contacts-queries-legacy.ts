"use server";

import { prisma } from "@/lib/prisma";

export async function getAvailablePICsForClient(): Promise<
  Array<{
    id: string;
    name: string;
    avatar?: string;
    email: string;
  }>
> {
  const pics = await prisma.userProfile.findMany({
    where: { role: "pic" },
    select: {
      id: true,
      fullname: true,
      avatarColor: true,
      email: true,
    },
    orderBy: { fullname: "asc" },
  });

  return pics.map(pic => ({
    id: pic.id,
    name: pic.fullname,
    avatar: pic.avatarColor ?? undefined,
    email: pic.email,
  }));
}
