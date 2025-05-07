// app/events/page.tsx
"use client";

import { useState, useEffect } from "react";
import EventsContainer from "../../components/events/EventsContainer";
import EmptyState from "../../components/events/EmptyState";
import EventsTabs from "../../components/events/EventsTabs";
import {
  fetchUpcomingEvents,
  fetchPastEvents,
} from "../../services/eventServices";
import { Event } from "../../types/event";
import { useRouter } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";

export default function EventsPage() {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [pastEvents, setPastEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { authenticated, login } = usePrivy();

  useEffect(() => {
    // Load initial data
    const loadEvents = async () => {
      setLoading(true);
      try {
        const [upcoming, past] = await Promise.all([
          fetchUpcomingEvents(),
          fetchPastEvents(),
        ]);
        setUpcomingEvents(upcoming);
        setPastEvents(past);
      } catch (error) {
        console.error("Failed to load events:", error);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, []);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const handleCreateEvent = () => {
    // Check if user is authenticated
    if (!authenticated) {
      // Prompt the user to log in
      login();
      return;
    }

    // Navigate to create event page or open modal
    router.push("/events/create");
  };

  // Determine which events to display based on active tab
  const events = activeTab === "upcoming" ? upcomingEvents : pastEvents;
  const showEmptyState =
    activeTab === "upcoming" && upcomingEvents.length === 0;

  // Show loading state
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6 bg-transparent">
        <div className="flex items-center gap-6 mb-6">
          <h1 className="text-4xl font-extrabold">Events</h1>
          <EventsTabs activeTab={activeTab} onTabChange={handleTabChange} />
        </div>
        <div className="flex justify-center items-center h-64">
          <p>Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-transparent">
      <div className="flex items-center gap-6 mb-6">
        <h1 className="text-4xl font-extrabold">Events</h1>
        <EventsTabs activeTab={activeTab} onTabChange={handleTabChange} />
      </div>

      {showEmptyState ? (
        <EmptyState onCreateEvent={handleCreateEvent} />
      ) : (
        <EventsContainer events={events} onCreateEvent={handleCreateEvent} />
      )}
    </div>
  );
}
