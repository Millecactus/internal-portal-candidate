import React from 'react';
import { Button } from './ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface WeekSelectorProps {
  weeks: Date[][];
  selectedWeekIndex: number;
  onWeekChange: (index: number) => void;
}

export function WeekSelector({ weeks, selectedWeekIndex, onWeekChange }: WeekSelectorProps) {
  const formatWeekRangeInFrench = (week: Date[]) => {
    const start = format(week[0], 'd MMM', { locale: fr });
    const end = format(week[week.length - 1], 'd MMM', { locale: fr });
    return `${start} - ${end}`;
  };

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-black text-white rounded-lg">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onWeekChange(selectedWeekIndex - 1)}
        disabled={selectedWeekIndex === 0}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <div className="text-sm font-medium">
        {formatWeekRangeInFrench(weeks[selectedWeekIndex])}
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => onWeekChange(selectedWeekIndex + 1)}
        disabled={selectedWeekIndex === weeks.length - 1}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}