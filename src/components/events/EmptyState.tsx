// components/events/EmptyState.tsx
import { emptyEventImg } from "@/src/app/assets";
import Image from "next/image";
import React from "react";

interface EmptyStateProps {
  onCreateEvent: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ onCreateEvent }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div>
        <Image src={emptyEventImg} alt="empty sign" width={150} height={150} />
      </div>
      <h3 className="text-xl font-semibold mt-6">No Upcoming Events</h3>
      <p className="text-gray-500 text-center mt-2">
        You have no upcoming events. Why not host one?
      </p>
      <button
        onClick={onCreateEvent}
        className="mt-6 bg-green-400 hover:bg-green-500 text-white font-medium py-2 px-6 rounded-full transition-colors"
      >
        Create Event
      </button>
    </div>
  );
};

export default EmptyState;
