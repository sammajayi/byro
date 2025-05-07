// components/events/EventsTabs.tsx
import React from "react";
import Tab from "./Tab";

interface EventsTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const EventsTabs: React.FC<EventsTabsProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="flex space-x-2 bg-blue-50 p-1 rounded-full">
      <Tab
        label="Upcoming"
        isActive={activeTab === "upcoming"}
        onClick={() => onTabChange("upcoming")}
      />
      <Tab
        label="Past"
        isActive={activeTab === "past"}
        onClick={() => onTabChange("past")}
      />
    </div>
  );
};

export default EventsTabs;
