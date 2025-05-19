import { startOfWeek, addDays, addWeeks, format, isSaturday, isSunday } from 'date-fns';

export function getWeekDays(date: Date) {
  const start = startOfWeek(date, { weekStartsOn: 1 }); // Start week on Monday
  const weekdays: Date[] = [];
  
  // Add only weekdays (Monday to Friday)
  for (let i = 0; i < 5; i++) {
    weekdays.push(addDays(start, i));
  }
  
  return weekdays;
}

export function getNextTwoWeeks() {
  const today = new Date();
  return [
    getWeekDays(today),
    getWeekDays(addWeeks(today, 1))
  ];
}

export function formatDate(date: Date) {
  return format(date, 'yyyy-MM-dd');
}

export function formatWeekRange(days: Date[]) {
  return `${format(days[0], 'MMM d')} - ${format(days[days.length - 1], 'MMM d')}`;
}

export function isWeekend(date: Date) {
  return isSaturday(date) || isSunday(date);
}