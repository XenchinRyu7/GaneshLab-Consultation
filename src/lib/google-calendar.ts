import { google, type Auth } from "googleapis";

import { prisma } from "@/lib/prisma";

export interface CalendarEvent {
  summary: string;
  description: string;
  start: Date;
  end: Date;
  attendees?: string[];
  location?: string;
}

export async function createCalendarEvent(userId: string, event: CalendarEvent): Promise<void> {
  try {
    // Get user tokens
    const userProfile = await prisma.userProfile.findUnique({
      where: { id: userId },
      select: {
        googleAccessToken: true,
        googleRefreshToken: true,
        googleTokenExpiry: true,
      },
    });

    if (!userProfile?.googleAccessToken) {
      throw new Error("User not connected to Google Calendar");
    }

    // Setup OAuth client
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({
      access_token: userProfile.googleAccessToken,
      refresh_token: userProfile.googleRefreshToken,
    });

    // Check if token is expired and refresh if needed
    if (userProfile.googleTokenExpiry && new Date() > userProfile.googleTokenExpiry) {
      if (userProfile.googleRefreshToken) {
        const { credentials } = await oauth2Client.refreshAccessToken();
        oauth2Client.setCredentials(credentials);

        // Update tokens in database
        await prisma.userProfile.update({
          where: { id: userId },
          data: {
            googleAccessToken: credentials.access_token,
            googleRefreshToken: credentials.refresh_token ?? userProfile.googleRefreshToken,
            googleTokenExpiry: credentials.expiry_date ? new Date(credentials.expiry_date) : null,
          },
        });
      } else {
        throw new Error("Refresh token not available");
      }
    }

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    const calendarEvent = {
      summary: event.summary,
      description: event.description,
      location: event.location,
      start: {
        dateTime: event.start.toISOString(),
        timeZone: "Asia/Jakarta",
      },
      end: {
        dateTime: event.end.toISOString(),
        timeZone: "Asia/Jakarta",
      },
      attendees: event.attendees?.map(email => ({ email })),
      reminders: {
        useDefault: false,
        overrides: [
          { method: "popup", minutes: 15 },
          { method: "email", minutes: 30 },
        ],
      },
    };

    await calendar.events.insert({
      calendarId: "primary",
      requestBody: calendarEvent,
      sendUpdates: "all",
    });
  } catch (error) {
    console.error("Error creating calendar event:", error);
    throw new Error("Failed to create calendar event");
  }
}

export interface CalendarEventWithMeet {
  summary: string;
  description: string;
  start: Date;
  end: Date;
  attendees?: string[];
  type: "online" | "offline";
  location?: string;
}

export async function createCalendarEventWithMeet(
  picData: {
    id: string;
    googleAccessToken: string | null;
    googleRefreshToken: string | null;
    googleTokenExpiry: Date | null;
  },
  event: CalendarEventWithMeet
): Promise<{ eventId: string; meetLink: string | null; htmlLink: string } | null> {
  try {
    if (!picData.googleAccessToken) {
      throw new Error("PIC not connected to Google Calendar");
    }

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({
      access_token: picData.googleAccessToken,
      refresh_token: picData.googleRefreshToken,
    });

    await refreshTokenIfNeeded(oauth2Client, picData);

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    const eventData = buildEventData(event);

    const response = await calendar.events.insert({
      calendarId: "primary",
      requestBody: eventData,
      conferenceDataVersion: event.type === "online" ? 1 : undefined,
      sendUpdates: "all",
    });

    return {
      eventId: response.data.id ?? "",
      meetLink: response.data.hangoutLink ?? null,
      htmlLink: response.data.htmlLink ?? "",
    };
  } catch (error) {
    console.error("Error creating calendar event with meet:", error);
    return null;
  }
}

interface PicData {
  id: string;
  googleRefreshToken: string | null;
  googleTokenExpiry: Date | null;
}

async function refreshTokenIfNeeded(oauth2Client: Auth.OAuth2Client, picData: PicData) {
  if (picData.googleTokenExpiry && new Date() > picData.googleTokenExpiry) {
    if (picData.googleRefreshToken) {
      try {
        const { credentials } = await oauth2Client.refreshAccessToken();
        oauth2Client.setCredentials(credentials);

        await prisma.userProfile.update({
          where: { id: picData.id },
          data: {
            googleAccessToken: credentials.access_token,
            googleRefreshToken: credentials.refresh_token ?? picData.googleRefreshToken,
            googleTokenExpiry: credentials.expiry_date ? new Date(credentials.expiry_date) : null,
          },
        });
      } catch (refreshError: unknown) {
        console.error("Failed to refresh Google access token:", refreshError);
        // If refresh fails, clear the tokens and throw error
        await prisma.userProfile.update({
          where: { id: picData.id },
          data: {
            googleAccessToken: null,
            googleRefreshToken: null,
            googleTokenExpiry: null,
          },
        });
        throw new Error(
          "Google Calendar connection expired. PIC needs to reconnect their Google account."
        );
      }
    } else {
      throw new Error("Refresh token not available for PIC");
    }
  }
}

function buildEventData(event: CalendarEventWithMeet) {
  const baseData = {
    summary: event.summary,
    description: event.description,
    start: { dateTime: event.start.toISOString(), timeZone: "Asia/Jakarta" },
    end: { dateTime: event.end.toISOString(), timeZone: "Asia/Jakarta" },
    attendees: event.attendees?.map(email => ({ email })),
    reminders: {
      useDefault: false,
      overrides: [
        { method: "popup", minutes: 15 },
        { method: "email", minutes: 30 },
      ],
    },
  };

  if (event.type === "online") {
    return {
      ...baseData,
      conferenceData: {
        createRequest: {
          requestId: `meet-${Date.now()}`,
          conferenceSolutionKey: { type: "hangoutsMeet" },
        },
      },
    };
  } else {
    return {
      ...baseData,
      location: event.location,
    };
  }
}
