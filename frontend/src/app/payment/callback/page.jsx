"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import API from "@/services/api";
import { BadgeCheck, XCircle } from "lucide-react";

function PaymentCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState("verifying"); // verifying | success | failed

  useEffect(() => {
    const reference = searchParams.get("reference") || searchParams.get("trxref");
    if (!reference) {
      setStatus("failed");
      return;
    }

    API.verifyPayment(reference)
      .then((data) => {
        if (data.status === "success") {
          const ticket = data.tickets?.[0];
          const payment = data.payment;
          localStorage.setItem(
            "ticketData",
            JSON.stringify({
              attendeeName: payment?.customer_name || "",
              attendeeEmail: payment?.customer_email || "",
              eventName: payment?.event_name || "",
              eventDate: "",
              timeFrom: "",
              ticketId: ticket?.id,
            })
          );
          setStatus("success");
          setTimeout(() => router.push("/ticket-confirmation"), 1500);
        } else {
          setStatus("failed");
        }
      })
      .catch(() => setStatus("failed"));
  }, [searchParams, router]);

  if (status === "verifying") {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
        <div className="animate-spin rounded-full h-14 w-14 border-b-2 border-green-500"></div>
        <p className="text-gray-600 text-lg">Verifying your payment...</p>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
          <BadgeCheck className="w-10 h-10 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Payment Successful!</h2>
        <p className="text-gray-600">Redirecting to your ticket...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
      <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
        <XCircle className="w-10 h-10 text-red-500" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900">Payment Failed</h2>
      <p className="text-gray-600">Your payment could not be verified. Please try again.</p>
      <button
        onClick={() => router.back()}
        className="mt-4 px-6 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-colors"
      >
        Try Again
      </button>
    </div>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="animate-spin rounded-full h-14 w-14 border-b-2 border-green-500"></div>
        </div>
      }
    >
      <PaymentCallbackContent />
    </Suspense>
  );
}
