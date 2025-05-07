// components/events/Tab.tsx
import React from "react";

interface TabProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const Tab: React.FC<TabProps> = ({ label, isActive, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
        isActive ? "bg-blue-500 text-white" : "bg-blue-100 text-blue-800"
      }`}
    >
      {label}
    </button>
  );
};

export default Tab;
