// types/events.ts
export interface Event {
    id: number;
    title: string;
    date: string;
    type: string;
    host: string;
    isFree: boolean;
    image: string;
    category?: string;
    location?: string;
  }