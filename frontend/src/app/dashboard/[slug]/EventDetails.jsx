"use client";
import API from "../../../services/api";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { schedule, Location } from "../../assets";
import Image from "next/image";
import { HugeiconsIcon } from "@hugeicons/react";
import { Link01Icon, PlusSignIcon, Delete04Icon } from "@hugeicons/core-free-icons";
import { toast } from "sonner";

export default function EventDetails() {
  const { slug } = useParams();
  const [event, setEvent] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [showAddHost, setShowAddHost] = useState(false);
  const [newHostEmail, setNewHostEmail] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [hosts, setHosts] = useState([]);
  const [hostsLoading, setHostsLoading] = useState(true);
  const [hostsError, setHostsError] = useState(null);

  useEffect(() => {
    if (!slug) return;
    setHostsLoading(true);
    setHostsError(null);
    API.getEvent(slug)
      .then((data) => {
        setEvent(data);
        const ownerEntry = {
          id: "owner",
          name: data.hosted_by || data.owner_email || "Event Owner",
          email: data.owner_email || "",
          role: "Creator",
        };
        const cohostEntries = (data.cohosts || []).map((c) => ({
          id: c.id,
          name: c.name || c.email,
          email: c.email,
          role: "Co-host",
        }));
        setHosts([ownerEntry, ...cohostEntries]);
      })
      .catch((err) => {
        console.error("Error fetching event:", err);
        setHostsError(err.message || "Failed to load event details");
      })
      .finally(() => setHostsLoading(false));
  }, [slug]);

  const handleCopyLink = async () => {
    const link = `${window.location.origin}/${event?.slug}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch {
      console.error("Failed to copy link");
    }
  };

  const handleAddHost = async () => {
    if (!newHostEmail.trim()) return;
    setIsAdding(true);
    try {
      const data = await API.addCohost(slug, newHostEmail.trim());
      setHosts((prev) => [
        ...prev,
        {
          id: data.cohost_id,
          name: data.cohost?.name || newHostEmail,
          email: data.cohost?.email || newHostEmail,
          role: "Co-host",
        },
      ]);
      setNewHostEmail("");
      setShowAddHost(false);
      toast.success("Co-host added successfully");
    } catch (err) {
      toast.error(err.message || "Error adding co-host. Make sure they have a Byro account.");
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveHost = async (hostId) => {
    try {
      await API.removeCohost(slug, hostId);
      setHosts((prev) => prev.filter((h) => h.id !== hostId));
      toast.success("Co-host removed");
    } catch (err) {
      toast.error(err.message || "Error removing co-host");
    }
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      {/* Main Content Layout */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Column */}
        <div className="lg:w-1/2 flex flex-col">
          <div className="rounded-2xl p-6">
            {/* Schedule */}
            <div className="flex items-start mb-6">
              <div className="w-8 h-8 rounded-full flex items-center justify-center mr-3">
                <Image src={schedule} alt="schedule" />
              </div>
              <div className="flex-1">
                <p className="text-lg font-semibold text-black mb-1">{event?.day}</p>
                <p className="text-base text-black">
                  {event?.time_from} to {event?.time_to}
                </p>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-start">
              <div className="w-8 h-8 flex items-center justify-center mr-3">
                <Image src={Location} alt="location" />
              </div>
              <div className="flex-1">
                <p className="text-lg font-semibold text-black mb-1">{event?.location}</p>
                <p className="text-base text-black">{event?.address}</p>
              </div>
            </div>
          </div>

          {/* Copy Link */}
          <div className="px-6">
            <button
              onClick={handleCopyLink}
              className="flex items-center space-x-2 text-[#4F8BFF] hover:text-blue-700 transition-colors"
            >
              <HugeiconsIcon icon={Link01Icon} size={20} />
              <span className="font-medium">{copySuccess ? "Link Copied!" : "Copy Event Link"}</span>
            </button>
          </div>
        </div>

        {/* Right Column - Image */}
        <div className="lg:w-1/2">
          {event?.event_image_url || event?.event_image ? (
            <img
              src={event.event_image_url || event.event_image}
              alt={event?.name}
              className="w-full h-[244px] object-cover rounded-2xl"
            />
          ) : (
            <div className="w-full h-[244px] bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400 text-sm">
              No image
            </div>
          )}
        </div>
      </div>

      {/* Host Management */}
      <div className="mt-8 bg-white">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Host</h3>
            <p className="text-gray-500 text-sm mt-1">Add, Host, Event Manager</p>
          </div>
          <button
            onClick={() => setShowAddHost(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <HugeiconsIcon icon={PlusSignIcon} size={16} />
            <span>Add Host</span>
          </button>
        </div>

        <div>
          {hostsLoading ? (
            <div className="flex items-center gap-2 py-4">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500" />
              <p className="text-gray-400 text-sm">Loading hosts...</p>
            </div>
          ) : hostsError ? (
            <p className="text-red-400 text-sm py-4">{hostsError}</p>
          ) : hosts.length === 0 ? (
            <p className="text-gray-400 text-sm py-4">No hosts found.</p>
          ) : (
            hosts.map((host) => (
              <div key={host.id} className="flex items-center px-4 py-4 border-b border-gray-100 last:border-b-0">
                <div className="w-[25%] font-semibold text-[#3D4852] text-sm">{host.name}</div>
                <div className="w-[30%] text-sm text-[#3D4852]">{host.email}</div>
                <div className="w-[25%]">
                  <span className="text-sm text-blue-600 font-medium">{host.role}</span>
                </div>
                <div className="flex-1 flex justify-end">
                  {host.id !== "owner" && (
                    <button
                      onClick={() => handleRemoveHost(host.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors p-1"
                      title="Remove co-host"
                    >
                      <HugeiconsIcon icon={Delete04Icon} size={18} />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add Host Modal */}
        {showAddHost && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold mb-2">Add Co-host</h3>
              <p className="text-sm text-gray-500 mb-4">
                Enter the email of a Byro user to add them as a co-host.
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={newHostEmail}
                  onChange={(e) => setNewHostEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddHost()}
                  className="w-full px-3 py-2 border border-gray-300 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="cohost@example.com"
                />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => { setShowAddHost(false); setNewHostEmail(""); }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddHost}
                  disabled={isAdding}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isAdding ? "Adding..." : "Add Co-host"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
