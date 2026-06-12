"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { PlaneIcon } from "@hugeicons/core-free-icons";
import API from "../../../services/api";
import { toast } from "sonner";

export default function Reminder() {
  const { slug } = useParams();
  const [selectedRecipients, setSelectedRecipients] = useState("going");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [eventName, setEventName] = useState("");
  const [attendees, setAttendees] = useState([]);

  useEffect(() => {
    if (!slug) return;
    Promise.all([
      API.getEvent(slug),
      API.getEventAttendees(slug, { payment_status: "all" }),
    ])
      .then(([event, data]) => {
        setEventName(event.name || "");
        setAttendees(data.attendees || []);
      })
      .catch((err) => console.error("Error loading data:", err));
  }, [slug]);

  const handleSend = async () => {
    if (!subject.trim() || !message.trim()) {
      toast.error("Please enter a subject and message");
      return;
    }

    // Filter attendees by selected recipient type
    const targets = attendees.filter((t) => {
      if (selectedRecipients === "going") {
        return t.payment_status === "paid" || t.payment_status === "free";
      }
      if (selectedRecipients === "waitlist") {
        return t.payment_status === "pending";
      }
      if (selectedRecipients === "not_going") {
        return t.payment_status === "failed";
      }
      return false;
    });

    if (targets.length === 0) {
      toast.error("No attendees match the selected recipient group");
      return;
    }

    setIsSending(true);
    try {
      const emails = targets.map((t) => ({
        type: "reminder",
        to: t.current_owner_email || t.original_owner_email,
        data: {
          name: t.current_owner_name || t.original_owner_name || "Attendee",
          subject,
          message,
          eventName,
        },
      }));

      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emails }),
      });

      if (!res.ok) throw new Error("Failed to send");

      toast.success(`Reminder sent to ${targets.length} attendee${targets.length !== 1 ? "s" : ""}`);
      setSubject("");
      setMessage("");
    } catch (err) {
      toast.error(err.message || "Failed to send reminder");
    } finally {
      setIsSending(false);
    }
  };

  const recipientOptions = [
    { value: "going", label: "Going" },
    { value: "waitlist", label: "Waitlist" },
    { value: "not_going", label: "Not Going" },
  ];

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900 mb-2">Send a reminder</h1>
        <p className="text-gray-600 text-sm">
          Attendees will receive a reminder via email. It will also be shown on the event page.
        </p>
      </div>

      {/* Recipient Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Send to</label>
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 w-fit">
          {recipientOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setSelectedRecipients(option.value)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedRecipients === option.value
                  ? "bg-blue-600 text-white"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Subject */}
      <div className="mb-4">
        <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
          Subject
        </label>
        <input
          type="text"
          id="subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          placeholder="Enter subject"
        />
      </div>

      {/* Message */}
      <div className="mb-6">
        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
          Message
        </label>
        <textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={8}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 resize-none"
          placeholder="Enter your message..."
        />
      </div>

      <button
        onClick={handleSend}
        disabled={isSending}
        className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-medium px-6 py-2 rounded-lg transition-colors flex items-center space-x-2"
      >
        <HugeiconsIcon icon={PlaneIcon} size={16} />
        <span>{isSending ? "Sending..." : "Send"}</span>
      </button>
    </div>
  );
}
