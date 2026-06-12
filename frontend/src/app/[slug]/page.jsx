"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Transfer, Location, nft, schedule } from "../assets/index";
import Image from "next/image";
import { HugeiconsIcon } from "@hugeicons/react";
import { Ticket01Icon } from "@hugeicons/core-free-icons";
import RegisterModal from "../../components/auth/RegisterModal";
import API from "../../services/api";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import { TbArrowBackUp } from "react-icons/tb";
import { Providers } from "@/redux/Providers";

const ViewEvent = () => {
  const { slug } = useParams();
  const router = useRouter();
  const [registered, setRegistered] = useState(false);
  const [ticketId, setTicketId] = useState(null);
  const [showTransferInput, setShowTransferInput] = useState(false);
  const [transferEmail, setTransferEmail] = useState("");
  const [transferName, setTransferName] = useState("");
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [imageError] = useState(false);

  // Get image URL with fallback
  const getImageUrl = () => {
    if (imageError) {
      return "/assets/images/default-event.jpg";
    }

    // Prefer the full URL from the serializer
    if (event.event_image_url) {
      return event.event_image_url;
    }

    if (!event.event_image) {
      return "/assets/images/default-event.jpg";
    }

    // If it's already a full URL
    if (event.event_image.startsWith("http")) {
      return event.event_image;
    }

    // Relative path - build from the API base (strip /api/ suffix if present)
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "https://byro.onrender.com";
    const base = apiBase.replace(/\/api\/?$/, "");
    return `${base}${event.event_image}`;
  };

  const handleRegister = async () => {
    router.push(`/event-registration/${slug}`);
    // setLoading(true);

    // await new Promise((resolve) => setTimeout(resolve, 2000));

    // setLoading(false);
  };

  // const handleOpen = useCallback(() => setShowRegisterModal(true), []);

  const handleClose = useCallback(() => {
    setShowRegisterModal(false);
    if (window.location.pathname.includes(`/events/${slug}/register`)) {
      router.replace(`/events/${slug}`);
    }
  }, [slug, router]);

  const handleTransferClick = useCallback(() => {
    if (!event?.transferable) {
      toast.error("Tickets for this event are not transferable");
      return;
    }
    if (!ticketId) {
      toast.error("No ticket found for transfer");
      return;
    }
    setShowTransferInput((prev) => !prev);
  }, [event?.transferable, ticketId]);

  const handleTransferSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      try {
        await API.transferTicket(ticketId, {
          to_user_name: transferName,
          to_user_email: transferEmail,
        });
        toast.success(
          `Ticket transfer request sent to ${transferName} (${transferEmail})`
        );
        setShowTransferInput(false);
        setTransferEmail("");
        setTransferName("");
      } catch (err) {
        console.error("Error transferring ticket:", err);
        toast.error(err.message || "Failed to transfer ticket");
      }
    },
    [ticketId, transferName, transferEmail]
  );

  // const handleRegister = useCallback(() => {
  //   setShowRegisterModal(true);
  // }, []);

  const handleRegistrationSuccess = useCallback((ticketId) => {
    setShowRegisterModal(false);
    setRegistered(true);
    setTicketId(ticketId);
    toast.success("Successfully registered for the event!");
  }, []);

  const handleCancelRegistration = useCallback(async () => {
    if (!ticketId) {
      toast.error("No ticket found for cancellation");
      return;
    }
    try {
      await API.cancelRegistration(ticketId);
      setRegistered(false);
      setTicketId(null);
      toast.success("Registration canceled successfully");
    } catch (err) {
      console.error("Error canceling registration:", err);
      toast.error(err.message || "Failed to cancel registration");
    }
  }, [ticketId]);

  // Memoize formatted date
  const formattedDate = useMemo(() => {
    if (!event?.day) return "";
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date(event.day).toLocaleDateString("en-US", options);
  }, [event?.day]);

  // Fetch event data
  useEffect(() => {
    if (!slug) {
      setError("No event slug provided");
      setLoading(false);
      return;
    }

    if (
      typeof window !== "undefined" &&
      window.location.pathname.includes(`/events/${slug}/register`)
    ) {
      setShowRegisterModal(true);
    }

    const fetchEvent = async () => {
      try {
        setLoading(true);
        const [eventData, ticketData] = await Promise.all([
          API.getEvent(slug),
          API.getMyTicket(slug),
        ]);
        if (eventData?.id || eventData?.slug) {
          setEvent(eventData);
          if (eventData.slug && eventData.slug !== slug) {
            router.replace(`/${eventData.slug}`);
          }
          if (window.location.search.includes("preview=true")) {
            toast.success("Event created successfully! Here's your preview.");
          }
        } else {
          throw new Error("Invalid event data received from server");
        }
        if (ticketData?.registered) {
          setRegistered(true);
          setTicketId(ticketData.ticket_id || null);
        }
      } catch (err) {
        console.error("Error fetching event:", err);
        setError(err.message || "Failed to fetch event");
        if (err.message.includes("404")) {
          setError(
            "Event not found. It may not exist or you lack permission to view it."
          );
        }
        toast.error(err.message || "Failed to fetch event");
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [slug, router]);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div
          className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"
          role="status"
        >
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="text-center text-red-600 p-8">
        <h2 className="text-2xl font-bold mb-4">Event Not Found</h2>
        <p className="mb-4">{error}</p>
        <button
          onClick={() => router.push("/events")}
          className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
          aria-label="Return to events list"
        >
          Back to Events
        </button>
      </div>
    );

  if (!event) return null;

  const ticketPrice = parseFloat(event?.ticket_price ?? 0);
  const priceLabel = ticketPrice === 0 ? "Free" : `$${ticketPrice}`;
  const attendeeCount = event?.attendee_count ?? 0;

  return (
    <Providers>
      <div className="relative min-h-screen bg-white">
        <Navbar />

        {/* Main Content */}
        <div className="max-w-[720px] mx-auto px-4 py-8">

          {/* Hero Banner */}
          <div className="relative w-full h-[240px] rounded-2xl overflow-hidden mb-6">
            {event.event_image || event.event_image_url ? (
              <img
                src={getImageUrl()}
                alt={event.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900" />
            )}
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            {/* Event name + host */}
            <div className="absolute bottom-4 left-4">
              <h1 className="text-white text-2xl font-bold leading-tight">{event.name}</h1>
              <p className="text-white/80 text-sm mt-0.5">
                Hosted by {event.hosted_by || event.owner_email || "Byro Africa"}
              </p>
            </div>
            {/* Attendee badge */}
            {attendeeCount > 0 && (
              <div className="absolute bottom-4 right-4 flex items-center gap-1.5 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1.5">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                </svg>
                <span className="text-white text-xs font-medium">{attendeeCount}+ Attendees</span>
              </div>
            )}
            {/* Manage button for owner */}
            {event?.role?.is_owner && (
              <button
                onClick={() => router.push(`/dashboard/${event.slug}`)}
                className="absolute top-4 right-4 flex items-center gap-1.5 bg-[#1F6BFF] text-white text-xs font-medium px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Manage Event
              </button>
            )}
          </div>

          {/* Info Row */}
          <div className="flex flex-wrap gap-6 mb-6 pb-6 border-b border-gray-100">
            {/* Date / Time */}
            <div className="flex items-center gap-3">
              <Image src={schedule} alt="date" className="w-10 h-10" />
              <div>
                <p className="font-semibold text-gray-800 text-sm">{formattedDate}</p>
                <p className="text-gray-500 text-xs">
                  {event.time_from && new Date(`1970-01-01T${event.time_from}`).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })}
                  {event.time_to && ` to ${new Date(`1970-01-01T${event.time_to}`).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })}`}
                </p>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-center gap-3">
              <Image src={Location} alt="location" className="w-10 h-10" />
              <div>
                <p className="font-semibold text-gray-800 text-sm">{event.location || "TBD"}</p>
                {event.address && <p className="text-gray-500 text-xs">{event.address}</p>}
              </div>
            </div>

            {/* Price */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center rotate-12">
                <HugeiconsIcon icon={Ticket01Icon} size={20} color="white" />
              </div>
              <div>
                <p className="font-bold text-gray-800 text-sm">{priceLabel}</p>
                <p className="text-gray-500 text-xs">
                  {ticketPrice > 0 ? "USDC ON BASE" : "No charge"}
                </p>
              </div>
            </div>
          </div>

          {/* About Event */}
          <div className="mb-8">
            <h2 className="font-bold text-gray-900 text-xl mb-3">About Event</h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              {event.description || "No description provided."}
            </p>
          </div>

          {/* Transfer ticket (if registered + transferable) */}
          {registered && event.transferable && (
            <div className="mb-6">
              <button
                onClick={handleTransferClick}
                className="flex items-center gap-2 text-blue-600 text-sm font-medium"
              >
                <Image src={Transfer} alt="transfer" width={16} height={16} />
                <span className="underline">Transfer Ticket</span>
              </button>
              {showTransferInput && (
                <form onSubmit={handleTransferSubmit} className="mt-4 space-y-3 max-w-sm">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Recipient&apos;s Name</label>
                    <input type="text" value={transferName} onChange={(e) => setTransferName(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="John Doe" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Recipient&apos;s Email</label>
                    <input type="email" value={transferEmail} onChange={(e) => setTransferEmail(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="example@email.com" required />
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">Send</button>
                    <button type="button" onClick={() => setShowTransferInput(false)} className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm">Cancel</button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 px-8 py-3 rounded-full border-2 border-gray-300 text-gray-700 font-semibold text-sm hover:border-gray-400 transition-colors"
            >
              <TbArrowBackUp className="w-4 h-4" />
              Back to Events
            </button>

            {registered ? (
              <div className="flex gap-3">
                <button
                  onClick={() => router.push(`/ticket-confirmation`)}
                  className="px-8 py-3 rounded-full text-white font-semibold text-sm"
                  style={{ background: "linear-gradient(90deg, #63D0A5 0%, #16B979 100%)" }}
                >
                  View Ticket
                </button>
                <button
                  onClick={handleCancelRegistration}
                  className="px-6 py-3 rounded-full border border-red-300 text-red-500 font-semibold text-sm hover:bg-red-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={handleRegister}
                className="flex items-center gap-2 px-8 py-3 rounded-full text-white font-semibold text-sm"
                style={{ background: "linear-gradient(90deg, #63D0A5 0%, #16B979 100%)" }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
                {ticketPrice > 0 ? `Register Now - ${priceLabel}` : "Register Now - Free"}
              </button>
            )}
          </div>

          {/* old structure removed */}
          <div style={{display:"none"}}>
            <div className="space-y-6">
              <div className=" rounded-lg p-1">
                <div className="rounded-[20px] px-6 py-4 border border-[#8E8E93]">
                  <h1 className="text-[#007AFF] font-semibold text-[27px]">
                    {event.name}
                  </h1>
                </div>
              </div>

              {/* Event Details */}
              <div className="bg-white rounded-lg p-6 space-y-4">
                <div className="flex items-center text-red-600 text-sm">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center mr-3">
                    <Image src={schedule} alt="schedule" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium">{formattedDate}</span>
                    <div className="text-gray-600 text-sm">
                      {event.time_from &&
                        new Date(
                          `1970-01-01T${event.time_from}`
                        ).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })}{" "}
                      to{" "}
                      {event.time_to &&
                        new Date(
                          `1970-01-01T${event.time_to}`
                        ).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })}{" "}
                      {/* {event.timezone && `(${event.timezone})`} */}
                    </div>
                  </div>
                </div>

                <div className="flex items-center text-gray-700 text-sm">
                  <div className="w-8 h-8 flex items-center justify-center mr-3">
                    <Image src={Location} alt="location" />
                  </div>
                  <div>
                    <div className="font-medium">
                      {event.location || "Byro Headquarters"}
                    </div>
                    <div className="text-gray-500 text-xs">Lagos, Nigeria</div>
                  </div>
                </div>

                {/* Registration Status */}
                {registered ? (
                  <div className="mt-6 space-y-3 rounded-[18px] shadow-md bg-white p-[20px] w-fit">
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        You've Registered
                      </h3>
                      <div className="text-xs text-gray-500">
                        Check in status:{" "}
                        <span className="text-green-600 font-medium">
                          Approved
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        No longer able to attend?{" "}
                        <button
                          onClick={handleCancelRegistration}
                          className="text-blue-600 underline"
                        >
                          cancel registration
                        </button>
                      </div>
                    </div>

                    <div className="flex space-x-3">
                      <button
                        className=" text-white px-6 py-2 rounded-full text-sm font-medium transition-colors"
                        style={{
                          background:
                            "linear-gradient(90deg, #63D0A5 0%, #16B979 100%)",
                        }}
                      >
                        View ticket
                      </button>
                      <button className="bg-[#007AFF] hover:bg-blue-700 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center transition-colors">
                        <Image
                          src={nft}
                          alt="NFT icon"
                          width={16}
                          height={16}
                          className="mr-2"
                        />
                        Mint Byro NFT
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-6 space-y-3 rounded-[18px] shadow-md bg-white p-[20px] w-fit">
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        Registration
                      </h3>
                      <div className="text-xs text-gray-500">
                        To join the event, please click register
                      </div>
                    </div>

                    <button
                      onClick={handleRegister}
                      className="text-white px-8 py-3 rounded-full text-sm font-medium transition-colors bg-gradient-to-r"
                      style={{
                        background:
                          "linear-gradient(90deg, #63D0A5 0%, #16B979 100%)",
                      }}
                    >
                      {loading ? "Loading..." : "Register"}
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              \
              <div className="bg-white rounded-lg overflow-hidden">
                {event.event_image ? (
                  <img
                    src={getImageUrl()}
                    alt={event.name}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div
                    className="h-48 bg-cover bg-center relative"
                    style={{
                      backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 400"><rect fill="%23111827" width="100%" height="100%"/><g transform="translate(100,100)"><circle cx="50" cy="50" r="20" fill="%23f59e0b" opacity="0.7"/><circle cx="150" cy="80" r="15" fill="%23f59e0b" opacity="0.5"/><circle cx="250" cy="60" r="18" fill="%23f59e0b" opacity="0.6"/><circle cx="350" cy="90" r="12" fill="%23f59e0b" opacity="0.4"/><circle cx="450" cy="70" r="16" fill="%23f59e0b" opacity="0.8"/><circle cx="550" cy="85" r="14" fill="%23f59e0b" opacity="0.5"/></g><g transform="translate(50,200)"><rect x="20" y="20" width="30" height="60" rx="15" fill="%23e5e7eb" opacity="0.9"/><rect x="80" y="10" width="30" height="70" rx="15" fill="%23e5e7eb" opacity="0.8"/><rect x="140" y="25" width="30" height="55" rx="15" fill="%23e5e7eb" opacity="0.9"/><rect x="200" y="15" width="30" height="65" rx="15" fill="%23e5e7eb" opacity="0.7"/><rect x="260" y="30" width="30" height="50" rx="15" fill="%23e5e7eb" opacity="0.8"/><rect x="320" y="20" width="30" height="60" rx="15" fill="%23e5e7eb" opacity="0.9"/><rect x="380" y="25" width="30" height="55" rx="15" fill="%23e5e7eb" opacity="0.8"/><rect x="440" y="10" width="30" height="70" rx="15" fill="%23e5e7eb" opacity="0.7"/><rect x="500" y="20" width="30" height="60" rx="15" fill="%23e5e7eb" opacity="0.9"/><rect x="560" y="15" width="30" height="65" rx="15" fill="%23e5e7eb" opacity="0.8"/><rect x="620" y="25" width="30" height="55" rx="15" fill="%23e5e7eb" opacity="0.9"/></g></svg>')`,
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  </div>
                )}
              </div>
              {/* Event Info Card */}
              <div className="bg-white flex gap-6 rounded-lg p-6 space-y-4">
                <div>
                  {" "}
                  <div>
                    <h3 className="font-medium text-gray-800 mb-2">
                      Hosted by
                    </h3>
                    <div className="text-sm text-gray-600">Byro africa</div>
                  </div>
                  {!registered && (
                    <div className="pt-2">
                      <div className="text-sm font-medium text-gray-800 mb-1">
                        Is ticket transferrable?
                      </div>
                      <div className="text-sm text-gray-600">
                        {event.transferable ? "Yes" : "No"}
                      </div>
                    </div>
                  )}
                  {registered && event.transferable && (
                    <div>
                      <button
                        onClick={handleTransferClick}
                        className="flex items-center text-blue-600 text-sm"
                      >
                        <Image
                          src={Transfer}
                          alt="Transfer Icon"
                          width={16}
                          height={16}
                          className="mr-2"
                        />
                        <span className="underline cursor-pointer">
                          Transfer Ticket
                        </span>
                      </button>
                      {showTransferInput && (
                        <form
                          onSubmit={handleTransferSubmit}
                          className="mt-4 space-y-3"
                        >
                          <div>
                            <label
                              htmlFor="name"
                              className="block text-sm font-medium text-gray-700 mb-1"
                            >
                              Recipient's Name:
                            </label>
                            <input
                              type="text"
                              id="name"
                              value={transferName}
                              onChange={(e) => setTransferName(e.target.value)}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="John Doe"
                              required
                            />
                          </div>
                          <div>
                            <label
                              htmlFor="email"
                              className="block text-sm font-medium text-gray-700 mb-1"
                            >
                              Recipient's Email:
                            </label>
                            <input
                              type="email"
                              id="email"
                              value={transferEmail}
                              onChange={(e) => setTransferEmail(e.target.value)}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="example@email.com"
                              required
                            />
                          </div>
                          <div className="flex space-x-2">
                            <button
                              type="submit"
                              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                            >
                              Send
                            </button>
                            <button
                              type="button"
                              onClick={() => setShowTransferInput(false)}
                              className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg text-sm transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  )}
                  {/* Capacity Info */}
                  {event.capacity && (
                    <div className="pt-2 border-t border-gray-200">
                      <div className="text-sm font-medium text-gray-800 mb-1">
                        Capacity
                      </div>
                      <div className="text-sm text-gray-600">
                        {event.capacity}
                      </div>
                    </div>
                  )}
                  {/* Virtual Link */}
                  {event.virtual_link && (
                    <div className="pt-2">
                      <a
                        href={event.virtual_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm"
                      >
                        Join Virtual Event
                      </a>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3 transform rotate-12">
                      <HugeiconsIcon icon={Ticket01Icon} size={16} color="white" />
                    </div>
                    <div>
                      <div className="font-bold text-xl text-gray-800">
                        {parseFloat(event.ticket_price) === 0
                          ? "Free"
                          : `$${event.ticket_price}`}
                      </div>
                      <div className="text-xs text-gray-500">USDC ON BASE</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <RegisterModal
          isOpen={showRegisterModal}
          onClose={handleClose}
          onSuccess={handleRegistrationSuccess}
          eventSlug={slug}
        />
      </div>
    </Providers>
  );
};

export default ViewEvent;
