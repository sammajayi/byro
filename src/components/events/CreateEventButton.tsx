// components/events/CreateEventButton.tsx
import React from "react";

interface CreateEventButtonProps {
  onClick: () => void;
}

const CreateEventButton: React.FC<CreateEventButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="bg-green-400 hover:bg-green-500 text-white font-medium py-2 px-6 rounded-full transition-colors"
    >
      Create Event
    </button>
  );
};

export default CreateEventButton;
