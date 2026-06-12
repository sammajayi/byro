"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useWeb3AuthConnect } from "@web3auth/modal/react";
import { useRouter } from "next/navigation";
import EventCreationForm from "../../../components/events/EventCreationForm";
import AppLayout from "@/layout/app";
import API from "@/services/api";
import { toast } from "react-toastify";

export default function CreateEventPage() {
  const { connect, isConnected } = useWeb3AuthConnect();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isConnected) {
      connect();
    } else {
      setIsLoading(false);
    }
  }, [isConnected, connect]);

  const handleEventCreated = useCallback(
    async (eventData) => {
      try {
        setIsLoading(true);

        const token = localStorage.getItem("authToken");
        if (!token) {
          connect();
          throw new Error("Not authenticated");
        }

        const created = await API.createEvent(eventData);
        console.log("Event created", created);

        const userEmail = created?.owner_email || localStorage.getItem("userEmail");
        if (userEmail) {
          try {
            await fetch("/api/send-email", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                emails: [
                  {
                    type: "event_created",
                    to: userEmail,
                    data: {
                      name: created?.owner_name || "Organizer",
                      eventName: created?.name || eventData?.name,
                      eventDate: created?.day || eventData?.day,
                      eventTime: created?.time_from || eventData?.time_from,
                      eventLocation: created?.location,
                      eventLink: `${window.location.origin}/${created?.slug}`,
                    },
                  },
                ],
              }),
            });
          } catch (e) {
            console.error("Failed to send event created email:", e);
          }
        }

        toast.success("Event created successfully!");
        router.push("/events");
      } catch (error) {
        console.error("Create event failed:", error);
        toast.error("Failed to create event");
      } finally {
        setIsLoading(false);
      }
    },
    [connect, router]
  );

  return (
    <AppLayout>
      <div className="bg-white min-h-screen">
        <div className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <EventCreationForm onSuccess={handleEventCreated} />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
