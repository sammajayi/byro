"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import EventCreationForm from "../../../components/events/EventCreationForm";
import AppLayout from "@/layout/app";
import API from "@/services/api";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import axiosInstance from "@/utils/axios";

export default function CreateEventPage() {
  const { ready, authenticated, login, getAccessToken } = usePrivy();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const { token } = useSelector((state) => state.auth);

  const headerConfig = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  };

  // Handle authentication
  useEffect(() => {
    if (ready) {
      if (!authenticated) {
        login();
      }
      setIsLoading(false);
    }
  }, [ready, authenticated, router]);

  const handleEventCreated = async (eventData) => {
    try {
      const response = await axiosInstance.post(
        "/events/",
        eventData,
        headerConfig
      );

      console.log("Event created:", response);
      toast.success("Event created successfully!");
      // router.push(`/events/${response.slug}`);
    } catch (error) {
      console.error("Error creating event:", error);
      toast.error("Failed to create event");
    }
  };

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
