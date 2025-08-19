"use client";

import React, { useState } from "react";
import { type findAvailabilityTool } from "./base";
import type { ClientToolConfig } from "@/toolkits/types";
import { HStack, VStack } from "@/components/ui/stack";
import { ToolCallComponent } from "../../components/tool-call";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  AlertCircle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const googleCalendarFindAvailabilityToolConfigClient: ClientToolConfig<
  typeof findAvailabilityTool.inputSchema.shape,
  typeof findAvailabilityTool.outputSchema.shape
> = {
  CallComponent: ({ args }) => {
    const startDate = args.startDate ?? "today";
    const endDate = args.endDate ?? "next 7 days";
    const duration = args.durationMinutes ?? 60;
    const startTime = args.startTime ?? "09:00";
    const endTime = args.endTime ?? "17:00";

    return (
      <ToolCallComponent
        action="Finding Availability"
        primaryText={`${duration} minute slots`}
        secondaryText={`${startDate} to ${endDate}, ${startTime}-${endTime}`}
      />
    );
  },
  ResultComponent: ({ result, append }) => {
    const { availableSlots, totalSlotsFound, searchPeriod, conflictingEvents } =
      result;
    const [showAllSlots, setShowAllSlots] = useState(false);

    const INITIAL_SLOTS_TO_SHOW = 6;
    const displayedSlots = showAllSlots
      ? availableSlots
      : availableSlots.slice(0, INITIAL_SLOTS_TO_SHOW);
    const hasMoreSlots = availableSlots.length > INITIAL_SLOTS_TO_SHOW;

    const handleSlotSelect = (slot: (typeof availableSlots)[0]) => {
      append({
        text: `I've selected the time slot on ${slot.dayOfWeek}, ${slot.date} from ${slot.timeRange}. Please create a calendar event for this time slot.`,
      });
    };

    if (availableSlots.length === 0) {
      return (
        <VStack className="items-start gap-3">
          <HStack className="items-center gap-2">
            <AlertCircle className="size-4 text-amber-600" />
            <span className="text-sm font-medium text-amber-700">
              No Available Slots Found
            </span>
          </HStack>

          <p className="text-muted-foreground text-sm">
            No {searchPeriod.duration}-minute slots available in the specified
            time range.
          </p>

          {conflictingEvents.length > 0 && (
            <VStack className="w-full items-start gap-2">
              <h4 className="text-sm font-medium">
                Conflicting Events ({conflictingEvents.length})
              </h4>
              <div className="flex w-full flex-col gap-1">
                {conflictingEvents.slice(0, 3).map((event, index) => (
                  <Card key={index} className="border-l-primary/30 border-l-4">
                    <CardContent className="p-2">
                      <VStack className="items-start gap-0.5">
                        <div className="text-sm font-medium">
                          {event.summary ?? "Untitled Event"}
                        </div>
                        <div className="text-muted-foreground text-xs">
                          {new Date(event.start).toLocaleString()} -{" "}
                          {new Date(event.end).toLocaleString()}
                        </div>
                      </VStack>
                    </CardContent>
                  </Card>
                ))}
                {conflictingEvents.length > 3 && (
                  <p className="text-muted-foreground text-xs">
                    ...and {conflictingEvents.length - 3} more events
                  </p>
                )}
              </div>
            </VStack>
          )}
        </VStack>
      );
    }

    return (
      <VStack className="items-start gap-4">
        <HStack className="w-full items-center justify-between">
          <HStack className="items-center gap-2">
            <CheckCircle className="text-primary size-4" />
            <span className="text-primary text-sm font-medium">
              {totalSlotsFound} Available Slot{totalSlotsFound !== 1 ? "s" : ""}{" "}
              Found
            </span>
          </HStack>

          <HStack className="flex-wrap gap-2">
            <Badge variant="outline" className="text-xs">
              <Clock className="mr-1 size-3" />
              {searchPeriod.duration} minutes
            </Badge>
          </HStack>
        </HStack>

        {/* Grid of available slots with pagination */}
        <div className="grid w-full gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {displayedSlots.map((slot, index) => (
            <Card
              key={index}
              className="cursor-pointer transition-shadow hover:shadow-md"
              onClick={() => handleSlotSelect(slot)}
            >
              <CardContent className="p-3">
                <VStack className="items-start gap-2">
                  <div className="text-sm font-semibold">{slot.dayOfWeek}</div>
                  <div className="text-muted-foreground text-xs">
                    {new Date(slot.date).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                    })}
                  </div>
                  <div className="text-primary text-lg font-bold">
                    {slot.timeRange}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSlotSelect(slot);
                    }}
                  >
                    Select Time
                  </Button>
                </VStack>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Show More/Less button */}
        {hasMoreSlots && (
          <div className="flex w-full justify-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAllSlots(!showAllSlots)}
              className="flex items-center gap-2"
            >
              {showAllSlots ? (
                <>
                  <ChevronUp className="size-4" />
                  Show Less
                </>
              ) : (
                <>
                  <ChevronDown className="size-4" />
                  Show {availableSlots.length - INITIAL_SLOTS_TO_SHOW} More
                  Slots
                </>
              )}
            </Button>
          </div>
        )}

        {conflictingEvents.length > 0 && (
          <VStack className="w-full items-start gap-2">
            <HStack className="items-center gap-2">
              <AlertCircle className="text-muted-foreground size-4" />
              <h4 className="text-muted-foreground text-sm font-medium">
                {conflictingEvents.length} Conflicting Events
              </h4>
            </HStack>
          </VStack>
        )}
      </VStack>
    );
  },
};
