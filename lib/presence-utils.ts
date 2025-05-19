import { PresenceEntry, PresenceType } from '@/types/presence';
import { formatDate } from './date-utils';

export function getPresenceForDate(entries: PresenceEntry[], date: Date, user: string): PresenceType | undefined {
  const entry = entries.find(
    entry => formatDate(entry.date) === formatDate(date) && entry.user._id === user
  );
  return entry?.type;
}

export function getUsersForPresence(entries: PresenceEntry[], date: Date, type: PresenceType, period: string): { _id: string, firstname: string, lastname: string }[] {

  return entries
    .filter(entry =>
      (period === 'Matin' ? (new Date(entry.date).getHours() >= 0 && new Date(entry.date).getHours() < 12) :
        (period === 'Après-midi' ? (new Date(entry.date).getHours() >= 12 && new Date(entry.date).getHours() < 24) : true)) &&
      formatDate(entry.date) === formatDate(date) &&
      entry.type === type
    )
    .map(entry => entry.user);
}