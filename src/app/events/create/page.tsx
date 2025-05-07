// app/events/create/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createEvent } from "../../../services/eventServices";
import { EventType } from "../../../constants/eventTypes";
import { usePrivy } from "@privy-io/react-auth";

export default function CreateEventPage() {
  const router = useRouter();
  const { authenticated, login, user } = usePrivy();

  const [formData, setFormData] = useState({
    title: "",
    date: "",
    time: "",
    type: EventType.ONLINE,
    location: "",
    isFree: true,
    category: "Education",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if not authenticated
  if (!authenticated) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold mb-6">Create Event</h1>
          <p className="mb-6">You need to sign in to create an event.</p>
          <button
            onClick={() => login()}
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-md transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;

    // Handle checkboxes
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({
        ...formData,
        [name]: checked,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Combine date and time
      const fullDateTime = `${formData.date} ${formData.time}`;

      // Create event
      await createEvent({
        title: formData.title,
        date: fullDateTime,
        type: formData.type,
        host: user?.displayName || "Host Name",
        isFree: formData.isFree,
        image: "/images/event-placeholder.jpg", // Default placeholder
        category: formData.category,
        location: formData.location,
      });

      // Redirect to events page
      router.push("/events");
    } catch (err) {
      setError("Failed to create event. Please try again.");
      console.error("Error creating event:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold mb-6">Create Event</h1>

        {error && (
          <div className="bg-red-50 text-red-500 p-4 rounded-md mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Event Title*
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label
                htmlFor="date"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Date*
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                required
              />
            </div>

            <div>
              <label
                htmlFor="time"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Time*
              </label>
              <input
                type="time"
                id="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                required
              />
            </div>
          </div>

          <div className="mb-6">
            <label
              htmlFor="type"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Event Type*
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              required
            >
              <option value={EventType.ONLINE}>Online Event</option>
              <option value={EventType.IN_PERSON}>In-Person Event</option>
              <option value={EventType.HYBRID}>Hybrid Event</option>
            </select>
          </div>

          <div className="mb-6">
            <label
              htmlFor="location"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Location
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              placeholder={
                formData.type === EventType.ONLINE
                  ? "Zoom link, website, etc."
                  : "Physical address"
              }
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="category"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Category
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="Education">Education</option>
              <option value="Business">Business</option>
              <option value="Technology">Technology</option>
              <option value="Arts">Arts & Entertainment</option>
              <option value="Health">Health & Wellness</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="mb-8">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="isFree"
                checked={formData.isFree}
                onChange={handleChange}
                className="h-4 w-4 text-blue-500 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">
                This is a free event
              </span>
            </label>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Creating..." : "Create Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
