"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  UserAdd01Icon,
  CheckIcon,
  CircleXIcon,
  Search01Icon,
} from "@hugeicons/core-free-icons";
import API from "../../../services/api";
import { toast } from "sonner";

export default function Confirmation() {
  const { slug } = useParams();
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!slug) return;
    // Fetch all tickets including pending (waitlisted)
    API.getEventAttendees(slug, { payment_status: "all" })
      .then((data) => {
        // Map tickets to confirmation entries
        const mapped = (data.attendees || []).map((t) => ({
          id: t.ticket_id,
          name: t.current_owner_name || t.original_owner_name || "",
          email: t.current_owner_email || t.original_owner_email || "",
          // pending = waitlisted, paid/free = going
          status:
            t.payment_status === "paid" || t.payment_status === "free"
              ? "going"
              : "waitlisted",
          payment_status: t.payment_status,
        }));
        setAttendees(mapped);
      })
      .catch((err) => {
        console.error("Error loading attendees:", err);
        toast.error("Failed to load attendees");
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const waitlistCount = attendees.filter((a) => a.status === "waitlisted").length;
  const goingCount = attendees.filter((a) => a.status === "going").length;
  const notGoingCount = attendees.filter((a) => a.status === "not_going").length;

  const filtered = attendees.filter(
    (a) =>
      a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const updateStatus = (id, newStatus) => {
    setAttendees((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
    );
  };

  if (loading) {
    return (
      <div className="p-4 flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="p-4 max-w-6xl mx-auto">
      {/* Stats */}
      <div className="flex justify-start mb-6">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
          <div className="flex justify-center space-x-8">
            <div className="flex flex-col items-center space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-blue-500 rounded-sm flex items-center justify-center">
                  <HugeiconsIcon icon={UserAdd01Icon} size={12} color="white" />
                </div>
                <p className="text-gray-600 text-sm font-medium">Waitlist</p>
              </div>
              <p className="text-gray-900 font-bold text-xl">{waitlistCount}</p>
            </div>

            <div className="flex flex-col items-center space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-500 rounded-sm flex items-center justify-center">
                  <HugeiconsIcon icon={CheckIcon} size={12} color="white" />
                </div>
                <p className="text-gray-600 text-sm font-medium">Going</p>
              </div>
              <p className="text-green-600 font-bold text-xl">{goingCount}</p>
            </div>

            <div className="flex flex-col items-center space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-red-500 rounded-sm flex items-center justify-center">
                  <HugeiconsIcon icon={CircleXIcon} size={12} color="white" />
                </div>
                <p className="text-gray-600 text-sm font-medium">Not Going</p>
              </div>
              <p className="text-red-500 font-bold text-xl">{notGoingCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Header + Search */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-gray-900 font-bold text-xl">Registrations</h1>
        <div className="relative">
          <HugeiconsIcon icon={Search01Icon} size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-gray-50 border-0 pl-9 pr-3 py-2 rounded-lg text-gray-900 placeholder-gray-500 outline-none focus:ring-2 focus:ring-gray-300 w-64 text-sm"
            placeholder="search for attendee..."
          />
        </div>
      </div>

      {/* List */}
      <div className="bg-white border border-gray-100 rounded-lg shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-8">
            <h3 className="text-base font-semibold text-gray-900 mb-2">
              {searchTerm ? "No attendees found" : "No registrations yet"}
            </h3>
            <p className="text-gray-500 text-sm">
              {searchTerm ? "Try adjusting your search" : "Attendees will appear here once they register."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filtered.map((attendee) => (
              <div
                key={attendee.id}
                className="flex items-center justify-between p-4 hover:bg-gray-50"
              >
                <div className="flex items-center space-x-3 flex-1">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#007AFF] to-[#0056CC] rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {(attendee.name || "?").charAt(0).toUpperCase()}
                  </div>
                  <h3 className="text-gray-900 font-medium text-sm">{attendee.name}</h3>
                </div>

                <div className="flex-1 min-w-0 px-4">
                  <p className="text-gray-600 text-sm">{attendee.email}</p>
                </div>

                <div className="flex items-center space-x-3">
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                      attendee.status === "going"
                        ? "bg-green-100 text-green-700"
                        : attendee.status === "not_going"
                        ? "bg-red-100 text-red-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {attendee.status === "going"
                      ? "Going"
                      : attendee.status === "not_going"
                      ? "Not Going"
                      : "Waitlist"}
                  </span>

                  {attendee.status === "waitlisted" && (
                    <div className="flex space-x-1">
                      <button
                        onClick={() => updateStatus(attendee.id, "going")}
                        className="w-7 h-7 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center text-white"
                        title="Approve"
                      >
                        <HugeiconsIcon icon={CheckIcon} size={12} />
                      </button>
                      <button
                        onClick={() => updateStatus(attendee.id, "not_going")}
                        className="w-7 h-7 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white"
                        title="Decline"
                      >
                        <HugeiconsIcon icon={CircleXIcon} size={12} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
