'use client'
import React, { useEffect } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Building2, Home, Briefcase, GraduationCap, DoorOpen, Plus } from 'lucide-react'; // Removed Sun, Moon
import { Button } from './ui/button';
import { PresenceType } from '@/types/presence';
import { cn } from '@/lib/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface WeekGridProps {
  days: Date[];
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  onPresenceChange: (type: PresenceType, day: Date) => void;
  getUserNames: (date: Date, type: PresenceType, period: string) => string[];
  currentUser: { firstname: string; lastname: string } | null;
}

export function WeekGrid({
  days,
  selectedDate,
  onDateSelect,
  onPresenceChange,
  getUserNames,
  currentUser,
}: WeekGridProps) {
  useEffect(() => {
    const initialExpandedType: { [key: string]: PresenceType | null } = {};
    days.forEach(day => {
      const dayKey = day.toISOString();
      initialExpandedType[dayKey] = 'office'; // Par défaut, la catégorie "office" est dépliée
    });
  }, [days]);

  const handleAddClick = (type: PresenceType, day: Date, period: string) => {
    const adjustedDay = new Date(day);
    if (period === 'Matin') {
      adjustedDay.setHours(2, 0, 0, 0); // Minuit pour le matin
    } else if (period === 'Après-midi') {
      adjustedDay.setHours(14, 0, 0, 0); // 12h pour l'après-midi
    }
    onPresenceChange(type, adjustedDay);
  };

  const currentUserName = currentUser ? `${currentUser.firstname} ${currentUser.lastname}` : '';

  const translateType = (type: PresenceType) => {
    switch (type) {
      case 'office':
        return 'bureau';
      case 'remote':
        return 'télétravail';
      case 'client':
        return 'clients';
      case 'school':
        return 'école';
      case 'away':
        return 'absent';
      default:
        return type;
    }
  };

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[1200px]">
        <table className="w-full border-collapse table-fixed">
          <thead>
            <tr>
              <th className="p-4 text-left font-medium text-gray-500 w-1/12"></th>
              {days.map((day) => (
                <th
                  key={day.toISOString()}
                  className={cn(
                    "p-4 text-center font-medium w-1/6 sm:w-auto",
                    formatDate(selectedDate) === formatDate(day) && "text-white bg-primary"
                  )}
                  onClick={() => onDateSelect(day)}
                >
                  <div>{format(day, 'EEE', { locale: fr }).charAt(0).toUpperCase() + format(day, 'EEE', { locale: fr }).slice(1)}</div>
                  <div className={cn("text-sm text-gray-500", formatDate(selectedDate) === formatDate(day) && "text-white")}>{format(day, 'd MMM', { locale: fr })}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {['Matin', 'Après-midi'].map((period) => (
              <tr key={period} className={cn("border-t", period === 'Après-midi' && "bg-gray-100")}>
                <td className="p-4 w-1/12 font-medium flex items-center">
                  {period === 'Matin' ? <span className="inline-block h-6 w-6 mr-2">☀️</span> : <span className="inline-block h-6 w-6 mr-2">🌙</span>}
                  {period}
                </td>
                {days.map((day) => {
                  const dayKey = day.toISOString();

                  return (
                    <td key={`${dayKey}-${period}`} className="p-4 border-l relative w-1/6 sm:w-1/3">
                      <Accordion type="single" collapsible className="w-full" defaultValue="office">
                        {(['office', 'remote', 'client', 'school', 'away'] as PresenceType[]).map((type) => (
                          <AccordionItem key={type} value={type}>
                            <AccordionTrigger>
                              <div className="flex items-center">
                                {type === 'office' && <Building2 className="h-4 w-4" />}
                                {type === 'remote' && <Home className="h-4 w-4" />}
                                {type === 'client' && <Briefcase className="h-4 w-4" />}
                                {type === 'school' && <GraduationCap className="h-4 w-4" />}
                                {type === 'away' && <DoorOpen className="h-4 w-4" />}
                                <span className="ml-2 capitalize">{translateType(type)}</span>
                                <span className="ml-1 text-xs text-gray-500">({getUserNames(day, type, period).length})</span>
                                {getUserNames(day, type, period).includes(currentUserName) && (
                                  <span className="ml-2 h-2 w-2 bg-yellow-500 rounded-full"></span>
                                )}
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="text-sm mt-2 transition-all duration-1000 ease-in-out text-left w-full h-32 overflow-y-auto relative group">
                                <div>
                                  {getUserNames(day, type, period).map((name, index) => (
                                    <React.Fragment key={index}>
                                      {name}
                                      {name === currentUserName && (
                                        <span className="ml-2 inline-block h-2 w-2 bg-yellow-500 rounded-full"></span>
                                      )}
                                      <br />
                                    </React.Fragment>
                                  ))}
                                </div>
                                <div className="absolute inset-0 bg-gray-500 opacity-0 group-hover:opacity-10 transition-opacity"></div>
                                <Button
                                  variant="secondary"
                                  size="icon"
                                  onClick={() => handleAddClick(type, day, period)}
                                  className="absolute inset-0 m-auto bg-black text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                  style={{ top: '50%', transform: 'translateY(-50%)' }}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function formatDate(date: Date) {
  return format(date, 'yyyy-MM-dd');
}