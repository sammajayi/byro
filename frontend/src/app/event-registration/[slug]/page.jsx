"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import EventMiniCard from "@/components/EventMiniCard";
import Footer from "@/components/Footer";
import { Tix } from "../../assets/index";
import PaymentMethod from "@/components/PaymentMethod";
import { useParams, useRouter } from "next/navigation";
import API from "../../../services/api";
import { toast } from "sonner";
import { Undo2, BadgeCheck } from "lucide-react";

export default function EventRegistration() {
  const { slug } = useParams();
  const router = useRouter();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    source: "",
  });
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("paystack");

  useEffect(() => {
    const fetchEventData = async () => {
      if (!slug) return;
      try {
        setLoading(true);
        setError(null);
        const response = await API.getEvent(slug);
        setEvent(response);
      } catch (err) {
        console.error("Error fetching event:", err);
        setError(err.message || "Failed to load event");
        toast.error(err.response?.data?.message || "Failed to load event details");
      } finally {
        setLoading(false);
      }
    };
    fetchEventData();
  }, [slug]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      router.push(`/${slug}`);
    }
  };

  const handleCompletePayment = async () => {
    const customerName = `${formData.firstName} ${formData.lastName}`.trim();
    const isFree = parseFloat(event.ticket_price) === 0;

    setIsProcessing(true);
    try {
      if (isFree) {
        const result = await API.initializePayment({
          event_slug: slug,
          customer_email: formData.email,
          customer_name: customerName,
        });

        const ticket = result.tickets?.[0];
        localStorage.setItem(
          "ticketData",
          JSON.stringify({
            attendeeName: customerName,
            attendeeEmail: formData.email,
            eventName: event.name,
            eventDate: event.day,
            timeFrom: event.time_from,
            ticketId: ticket?.id,
          })
        );
        router.push("/ticket-confirmation");
        return;
      }

      if (selectedPaymentMethod === "paystack") {
        const result = await API.initializePayment({
          event_slug: slug,
          customer_email: formData.email,
          customer_name: customerName,
        });

        if (result?.data?.authorization_url) {
          window.location.href = result.data.authorization_url;
        } else {
          toast.error("Could not get payment link. Please try again.");
        }
        return;
      }

      toast.error("Wallet payment coming soon. Please use Paystack.");
    } catch (err) {
      console.error("Payment error:", err);
      toast.error(err.message || "Payment failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleContinue = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      handleCompletePayment();
    }
  };

  const steps = [
    { number: 1, title: "Basic", subtitle: "Information" },
    { number: 2, title: "Review", subtitle: "Details" },
    { number: 3, title: "Make Payment", subtitle: "" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Event Not Found</h2>
          <p className="text-gray-600 mb-4">
            {error || "The event you're looking for doesn't exist."}
          </p>
          <button
            onClick={() => router.push("/events")}
            className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  const isFree = parseFloat(event.ticket_price) === 0;
  const step3ButtonLabel = isFree ? "Complete Registration" : "Complete Payment";

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-7xl mx-auto mb-20">
        <div className="flex gap-24 ">
          {currentStep === 3 ? (
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Image src={Tix} alt="ticket-icon" />
                <h1 className="text-3xl font-bold text-gray-900">
                  {isFree ? "Complete Registration" : "Choose Payment Method"}
                </h1>
              </div>
              <p className="text-gray-600">
                {isFree
                  ? "Review and confirm your free event registration"
                  : "Select your preferred payment method to complete your ticket purchase"}
              </p>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Image src={Tix} alt="ticket-icon" />
                <h1 className="text-3xl font-bold text-gray-900">Event Registration</h1>
              </div>
              <p className="text-gray-600">
                Complete your registration for <strong>{event.name}</strong>
              </p>
            </div>
          )}

          <div className="flex items-center justify-end gap-4 mb-8">
            {steps.map((step) => (
              <div key={step.number} className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center font-semibold text-lg ${
                      currentStep === step.number
                        ? "bg-green-500 text-white"
                        : currentStep > step.number
                        ? "bg-green-100 text-green-600 border-2 border-green-500"
                        : "bg-white text-gray-400 border-2 border-gray-200"
                    }`}
                  >
                    {step.number}
                  </div>
                  <div>
                    <div
                      className={`font-semibold ${
                        currentStep === step.number ? "text-gray-900" : "text-gray-500"
                      }`}
                    >
                      {step.title}
                    </div>
                    {step.subtitle && (
                      <div
                        className={`text-sm ${
                          currentStep === step.number ? "text-gray-600" : "text-gray-400"
                        }`}
                      >
                        {step.subtitle}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-xl p-8">
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-normal text-[#090909] mb-2">First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="text-black w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#090909] mb-2">Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="text-black w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#090909] mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="text-black w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#090909] mb-2">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="text-black w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#090909] mb-2">
                    How did you hear about this event
                  </label>
                  <input
                    type="text"
                    name="source"
                    value={formData.source}
                    onChange={handleInputChange}
                    className="text-black w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#090909] mb-2">First Name</label>
                    <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">{formData.firstName}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#090909] mb-2">Last Name</label>
                    <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">{formData.lastName}</div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#090909] mb-2">Email</label>
                  <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">{formData.email}</div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#090909] mb-2">Phone Number</label>
                  <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">{formData.phone}</div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#090909] mb-2">
                    How did you hear about this event
                  </label>
                  <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">{formData.source}</div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6 bg-none">
                {isFree ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <BadgeCheck className="w-8 h-8 text-green-500" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Free Event Registration</h3>
                    <p className="text-gray-600">No payment required. Click Complete Registration to finish.</p>
                  </div>
                ) : (
                  <PaymentMethod
                    selectedMethod={selectedPaymentMethod}
                    onSelect={setSelectedPaymentMethod}
                  />
                )}
              </div>
            )}

            <div className="flex gap-4 mt-8">
              <button
                onClick={handleBack}
                className="flex-1 px-6 py-3 border-2 border-blue-500 text-blue-500 rounded-xl font-semibold hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
              >
                <Undo2 size={20} />
                {currentStep === 1 ? "Back to Event" : "Back"}
              </button>
              <button
                onClick={handleContinue}
                disabled={
                  isProcessing ||
                  (currentStep === 1 &&
                    (!formData.firstName || !formData.lastName || !formData.email || !formData.phone))
                }
                className="flex-1 px-6 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing
                  ? "Processing..."
                  : currentStep === 3
                  ? step3ButtonLabel
                  : "Continue"}
              </button>
            </div>
          </div>

          <EventMiniCard event={event} />
        </div>
      </div>
      <Footer />
    </div>
  );
}
