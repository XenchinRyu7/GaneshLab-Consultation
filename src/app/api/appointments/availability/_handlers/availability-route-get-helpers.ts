/**
 * Helper functions for GET /api/appointments/availability
 */

import { prisma } from "@/lib/prisma";

/**
 * Get PIC IDs to generate availability for
 */
export async function getPicIds(picId: string | null): Promise<string[]> {
  if (picId) {
    return [picId];
  }

  const pics = await prisma.userProfile.findMany({
    where: {
      role: "pic",
    },
    select: {
      id: true,
    },
  });

  return pics.map(pic => pic.id);
}

/**
 * Get PIC availability data
 */
export async function getPicAvailabilities(picIds: string[]) {
  return prisma.picAvailability.findMany({
    where: {
      picId: {
        in: picIds,
      },
    },
    orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
  });
}

/**
 * Get blocked slots
 */
export async function getBlockedSlots(picIds: string[], start: Date, endDate: Date) {
  return prisma.picBlockedSlot.findMany({
    where: {
      picId: {
        in: picIds,
      },
      date: {
        gte: start,
        lt: endDate,
      },
    },
  });
}

/**
 * Get existing appointments
 */
export async function getExistingAppointments(picIds: string[], start: Date, endDate: Date) {
  return prisma.appointment.findMany({
    where: {
      picId: {
        in: picIds,
      },
      date: {
        gte: start,
        lt: endDate,
      },
      status: {
        not: "cancelled",
      },
    },
    select: {
      picId: true,
      date: true,
      startTime: true,
      endTime: true,
    },
  });
}

/**
 * Get PIC names map
 */
export async function getPicNamesMap(picIds: string[]): Promise<Map<string, string>> {
  const pics = await prisma.userProfile.findMany({
    where: {
      id: {
        in: picIds,
      },
    },
    select: {
      id: true,
      fullname: true,
    },
  });

  return new Map(pics.map(pic => [pic.id, pic.fullname]));
}
