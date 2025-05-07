// services/eventService.ts
import { Event } from '../types/event';
import { EventType } from '../constants/eventTypes';

// Sample event data - in a real application, this would come from an API
export const sampleEvents: Event[] = [
  {
    id: 1,
    title: 'BestSeller Book Bootcamp -write, Market & Publish Your Book -Lucknow',
    date: 'Saturday, March 18, 9:30PM',
    type: EventType.ONLINE,
    host: 'Host Name',
    isFree: true,
    image: '/images/event-bonfire.jpg',
    category: 'Education',
    location: 'Lucknow',
  },
  {
    id: 2,
    title: 'BestSeller Book Bootcamp -write, Market & Publish Your Book -Lucknow',
    date: 'Saturday, March 18, 9:30PM',
    type: EventType.ONLINE,
    host: 'Host Name',
    isFree: true,
    image: '/images/event-concert.jpg',
    category: 'Education',
    location: 'Lucknow',
  },
  {
    id: 3,
    title: 'BestSeller Book Bootcamp -write, Market & Publish Your Book -Lucknow',
    date: 'Saturday, March 18, 9:30PM',
    type: EventType.ONLINE,
    host: 'Host Name',
    isFree: true,
    image: '/images/event-crowd.jpg',
    category: 'Education',
    location: 'Lucknow',
  },
];

/**
 * Fetch upcoming events
 * @returns {Promise<Event[]>} - Promise resolving to array of upcoming events
 */
export const fetchUpcomingEvents = async (): Promise<Event[]> => {
  // In a real app, you would make an API call with filters
  // return await fetch('/api/events?status=upcoming').then(res => res.json());
  
  // For demo purposes, return empty array to show empty state
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([]);
    }, 500);
  });
};

/**
 * Fetch past events
 * @returns {Promise<Event[]>} - Promise resolving to array of past events
 */
export const fetchPastEvents = async (): Promise<Event[]> => {
  // In a real app, you would make an API call with filters
  // return await fetch('/api/events?status=past').then(res => res.json());
  
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(sampleEvents);
    }, 500);
  });
};

/**
 * Create a new event
 * @param {Partial<Event>} eventData - Event data
 * @returns {Promise<Event>} - Promise resolving to created event
 */
export const createEvent = async (eventData: Partial<Event>): Promise<Event> => {
  // In a real app, you would make a POST request
  // return await fetch('/api/events', {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify(eventData),
  // }).then(res => res.json());
  
  return new Promise((resolve) => {
    setTimeout(() => {
      const newEvent = {
        id: Math.floor(Math.random() * 1000) + 4,
        ...eventData,
      } as Event;
      resolve(newEvent);
    }, 500);
  });
};