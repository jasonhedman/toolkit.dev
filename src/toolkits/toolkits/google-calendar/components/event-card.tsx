import React from "react";
import { Badge } from "@/components/ui/badge";
import { VStack } from "@/components/ui/stack";
import { Clock, Users, User } from "lucide-react";
import type { calendar_v3 } from "googleapis";

interface EventCardProps {
  event: calendar_v3.Schema$Event;
  showDetails?: boolean;
}

const getEventDateTime = (
  eventTime: calendar_v3.Schema$EventDateTime,
): string => {
  return eventTime.dateTime ?? eventTime.date ?? new Date().toISOString();
};

const isAllDayEvent = (start: calendar_v3.Schema$EventDateTime): boolean => {
  return !start.dateTime && !!start.date;
};

const formatDateTime = (dateTime: string): string => {
  return new Date(dateTime).toLocaleString();
};

const formatTime = (dateTime: string): string => {
  return new Date(dateTime).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatDate = (dateTime: string): string => {
  return new Date(dateTime).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
};

export const EventCard: React.FC<EventCardProps> = ({
  event,
  showDetails = false,
}) => {
  const startDateTime = getEventDateTime(event.start!);
  const endDateTime = getEventDateTime(event.end!);
  const isAllDay = isAllDayEvent(event.start!);

  const startDate = formatDateTime(startDateTime);
  const endDate = formatDateTime(endDateTime);
  const startTime = isAllDay ? null : formatTime(startDateTime);
  const endTime = isAllDay ? null : formatTime(endDateTime);
  const formattedDate = formatDate(startDateTime);

  return (
    <div className="bg-card w-full rounded-lg border p-4">
      {/* Header Section */}
      <div className="mb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="text-primary mb-1 text-lg font-semibold">
              {event.summary ?? "Untitled Event"}
            </h3>
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <Clock className="size-4" />
              <span>
                {isAllDay
                  ? `${formattedDate} • All day`
                  : startDate.split(" ")[0] === endDate.split(" ")[0]
                    ? `${formattedDate} • ${startTime} - ${endTime}`
                    : `${startDate} ${startTime} - ${endDate} ${endTime}`}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {event.status && event.status !== "confirmed" && (
              <Badge variant="outline" className="text-xs">
                {event.status}
              </Badge>
            )}
          </div>
        </div>

        {event.description && showDetails && (
          <p className="text-muted-foreground mt-2 line-clamp-2 text-sm">
            {event.description}
          </p>
        )}
      </div>

      {/* Details Section - Single Column Layout */}
      {showDetails && (
        <div className="border-t pt-3">
          <VStack className="items-start gap-2">
            {event.organizer && (
              <div className="text-muted-foreground flex items-center gap-2 text-sm">
                <User className="size-4" />
                <span>
                  Organized by{" "}
                  <span className="font-medium">
                    {event.organizer.displayName ?? event.organizer.email}
                  </span>
                </span>
              </div>
            )}

            {event.attendees && event.attendees.length > 0 && (
              <div className="text-muted-foreground flex items-center gap-2 text-sm">
                <Users className="size-4" />
                <span>
                  {event.attendees.length} attendee
                  {event.attendees.length !== 1 ? "s" : ""} invited
                </span>
              </div>
            )}
          </VStack>
        </div>
      )}
    </div>
  );
};
