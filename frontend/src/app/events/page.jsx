"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { HugeiconsIcon } from "@hugeicons/react";
import { Calendar01Icon, MapPinIcon, Settings01Icon } from "@hugeicons/core-free-icons";
import AppLayout from "@/layout/app";
import API from "@/services/api";

function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function EventRow({ event, isOwner }) {
  // dashboard returns event_image_url (full URL); fallback for other shapes
  const imageUrl =
    event.event_image_url ||
    (event.event_image?.startsWith("http")
      ? event.event_image
      : event.event_image
      ? `${(process.env.NEXT_PUBLIC_API_URL || "https://byro.onrender.com").replace(/\/api\/?$/, "")}${event.event_image}`
      : "/assets/images/default-event.jpg");

  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-gray-100">
        <Image
          src={imageUrl}
          alt={event.name}
          fill
          className="object-cover"
          onError={(e) => { e.currentTarget.src = "/assets/images/default-event.jpg"; }}
        />
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-900 truncate">{event.name}</h3>
        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <HugeiconsIcon icon={Calendar01Icon} size={12} />
            {formatDate(event.day)}
          </span>
          {event.location && (
            <span className="flex items-center gap-1 truncate">
              <HugeiconsIcon icon={MapPinIcon} size={12} />
              {event.location}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {isOwner ? (
          <Link
            href={`/dashboard/${event.slug}`}
            className="flex items-center gap-1.5 bg-[#1F6BFF] text-white text-xs font-medium px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <HugeiconsIcon icon={Settings01Icon} size={12} />
            Manage
          </Link>
        ) : (
          <Link
            href={`/${event.slug}`}
            className="text-xs font-medium text-[#007AFF] bg-blue-50 px-3 py-2 rounded-lg hover:bg-blue-100 transition-colors"
          >
            View
          </Link>
        )}
      </div>
    </div>
  );
}

function Section({ title, events, isOwner, emptyText }) {
  if (!events || events.length === 0) {
    return (
      <div className="mb-8">
        <h2 className="text-base font-semibold text-gray-500 uppercase tracking-wide mb-3">
          {title}
        </h2>
        <p className="text-sm text-gray-400 py-4">{emptyText}</p>
      </div>
    );
  }
  return (
    <div className="mb-8">
      <h2 className="text-base font-semibold text-gray-500 uppercase tracking-wide mb-3">
        {title}
      </h2>
      <div className="flex flex-col gap-3">
        {events.map((event) => (
          <EventRow key={event.slug} event={event} isOwner={isOwner} />
        ))}
      </div>
    </div>
  );
}

export default function EventsPage() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("hosting");

  useEffect(() => {
    API.getDashboard()
      .then(setDashboard)
      .catch(() => setDashboard(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Events</h1>
          <Link
            href="/events/create"
            className="bg-[#1F6BFF] text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            + Create Event
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6 w-fit">
              {["hosting", "attending"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                    activeTab === tab
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab === "hosting" ? "Hosting" : "Attending"}
                </button>
              ))}
            </div>

            {activeTab === "hosting" && (
              <>
                <Section
                  title="Upcoming"
                  events={dashboard?.hosting?.upcoming}
                  isOwner={true}
                  emptyText="No upcoming events you're hosting."
                />
                <Section
                  title="Past"
                  events={dashboard?.hosting?.past}
                  isOwner={true}
                  emptyText="No past hosted events."
                />
              </>
            )}

            {activeTab === "attending" && (
              <>
                <Section
                  title="Upcoming"
                  events={dashboard?.attending?.upcoming?.map((t) => t.event)}
                  isOwner={false}
                  emptyText="No upcoming events you're attending."
                />
                <Section
                  title="Past"
                  events={dashboard?.attending?.past?.map((t) => t.event)}
                  isOwner={false}
                  emptyText="No past events attended."
                />
              </>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}
