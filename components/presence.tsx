'use client';
import React, { useEffect, useState } from 'react';
import { WeekGrid } from './week-grid'; // Corrected import path and changed to default import
import { WeekSelector } from './week-selector'; // Corrected import path and changed to default import
import { getNextTwoWeeks, formatDate } from '../lib/date-utils';
import { getUsersForPresence } from '../lib/presence-utils'; // Removed unused import getPresenceForDate
import { fetchAPI } from '../lib/api-request-utils'; // Import fetchAPI from api-request-utils
import { getUser } from '../lib/utils'; // Import getUser from utils
import type { PresenceEntry, PresenceType } from '../types/presence';

// Mock users - in a real app, this would come from your backend
const MOCK_USERS = [
  { _id: 'current-user', firstname: 'You', lastname: '' },
  { _id: 'user-1', firstname: 'Alice', lastname: 'Johnson' },
  { _id: 'user-2', firstname: 'Bob', lastname: 'Smith' },
  { _id: 'user-3', firstname: 'Carol', lastname: 'White' },
];

async function fetchPresenceData(startDate: string) {
  try {
    const response = await fetchAPI(`/presence/weekly-presence?startDate=${startDate}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching presence data:', error);
    return [];
  }
}

async function postPresenceData(presenceEntry: PresenceEntry) {
  try {
    const response = await fetchAPI('/presence/presence', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(presenceEntry),
    });
    if (!response.ok) {
      throw new Error('Failed to post presence data');
    }
  } catch (error) {
    console.error('Error posting presence data:', error);
  }
}

// Mock initial presence data - in a real app, this would come from your backend
const INITIAL_PRESENCE: PresenceEntry[] = [
  { user: { _id: 'user-1', firstname: 'Alice', lastname: 'Johnson' }, type: 'office', date: new Date(2024, 2, 18, 9) }, // Matin
  { user: { _id: 'user-2', firstname: 'Bob', lastname: 'Smith' }, type: 'remote', date: new Date(2024, 2, 18, 14) }, // Après-midi
  { user: { _id: 'user-3', firstname: 'Carol', lastname: 'White' }, type: 'client', date: new Date(2024, 2, 19, 9) }, // Matin
];

function Presence() { // Renamed function to match export
  const [presenceEntries, setPresenceEntries] = useState<PresenceEntry[]>(INITIAL_PRESENCE);
  const [selectedWeekIndex, setSelectedWeekIndex] = useState(0);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentUser, setCurrentUser] = useState(getUser());

  const weeks = React.useMemo(() => getNextTwoWeeks(), []); // Utilisez useMemo pour éviter le recalcul
  const loadPresenceData = React.useCallback(async () => {
    const startDate = formatDate(weeks[selectedWeekIndex][0]);
    const data = await fetchPresenceData(startDate);
    setPresenceEntries(data.length ? data : INITIAL_PRESENCE);
  }, [selectedWeekIndex, weeks]);

  useEffect(() => {
    setSelectedDate(new Date());
  }, []);

  useEffect(() => {
    loadPresenceData();
  }, [loadPresenceData]);

  const handlePresenceChange = async (type: PresenceType, day: Date) => {
    const accessToken = sessionStorage.getItem('accessToken') || document.cookie.split('; ').find(row => row.startsWith('accessToken='))?.split('=')[1] || null;
    const userId = accessToken ? parseJwt(accessToken)._id : '';

    if (!currentUser) {
      console.error('Current user information is missing');
      return;
    }

    const period = day.getHours() < 12 ? 'Matin' : 'Après-midi';
    const filtered = presenceEntries.filter(entry =>
      !(new Date(entry.date).toDateString() === day.toDateString() &&
        entry.user._id === userId &&
        (entry.date.getHours() < 12 ? 'Matin' : 'Après-midi') === period)
    );
    const newEntry = {
      date: day,
      type,
      user: {
        _id: userId,
        firstname: currentUser.firstname,
        lastname: currentUser.lastname
      }
    };
    setPresenceEntries([...filtered, newEntry]);
    await postPresenceData(newEntry);
    loadPresenceData();
  };

  function parseJwt(token: string) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error parsing JWT:', error);
      return {};
    }
  }

  const getUserNamesForType = (date: Date, type: PresenceType, period: string) => {
    return getUsersForPresence(presenceEntries, date, type, period).map((user: string | { firstname: string, lastname: string }) => {
      if (typeof user === 'string') {
        const foundUser = MOCK_USERS.find(u => u._id === user);
        return foundUser ? `${foundUser.firstname} ${foundUser.lastname}` : 'Unknown User';
      }

      // Vérification de sécurité pour firstname et lastname
      const formattedFirstName = user.firstname
        ? user.firstname.charAt(0).toUpperCase() + user.firstname.slice(1).toLowerCase()
        : '';

      const formattedLastName = user.lastname
        ? user.lastname.charAt(0).toUpperCase() + user.lastname.slice(1).toLowerCase()
        : '';

      return `${formattedFirstName} ${formattedLastName}`.trim() || 'Utilisateur inconnu';
    });
  };

  const handleWeekChange = (index: number) => {
    setSelectedWeekIndex(index);
    loadPresenceData(); // Recharger les données de présence lors du changement de semaine
    setCurrentUser(getUser()); // Mettre à jour currentUser lors du changement de semaine
  };

  return (
    <div className="min-h-screen">
      <div className="space-y-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Planning de présence
        </h1>

        <div className="space-y-6">
          <WeekSelector
            weeks={weeks}
            selectedWeekIndex={selectedWeekIndex}
            onWeekChange={handleWeekChange}
          />

          <WeekGrid
            days={weeks[selectedWeekIndex]}
            selectedDate={selectedDate}
            onDateSelect={() => { }}
            onPresenceChange={handlePresenceChange}
            getUserNames={getUserNamesForType}
            currentUser={currentUser}
          />
        </div>
      </div>
    </div>
  );
}

export default Presence;