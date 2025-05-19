export type PresenceType = 'office' | 'remote' | 'client' | 'school' | 'away' ;

export interface User {
  id: string;
  name: string;
  avatar?: string;
}

export interface PresenceEntry {
  date: Date;
  type: PresenceType;
  user: {
    _id: string;
    firstname: string;
    lastname: string;
  };
}

export interface WeekPresence {
  weekStart: Date;
  entries: PresenceEntry[];
}