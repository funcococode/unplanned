'use client';

import { useEffect, useState } from 'react';
import { Cloud, Sun, CloudRain, CloudSnow, Wind, Loader2, Thermometer, CalendarClock } from 'lucide-react';

interface DayForecast {
  date: string;
  maxTemp: number;
  minTemp: number;
  weatherCode: number;
}

interface Props {
  destination: string;
  startDate: string;
  endDate: string;
}

const WMO: Record<number, { icon: typeof Sun; label: string; color: string }> = {
  0:  { icon: Sun,       label: 'Clear',         color: 'text-amber-400'  },
  1:  { icon: Sun,       label: 'Mainly clear',  color: 'text-amber-400'  },
  2:  { icon: Cloud,     label: 'Partly cloudy', color: 'text-gray-400'   },
  3:  { icon: Cloud,     label: 'Overcast',      color: 'text-gray-500'   },
  45: { icon: Cloud,     label: 'Foggy',         color: 'text-gray-400'   },
  48: { icon: Cloud,     label: 'Foggy',         color: 'text-gray-400'   },
  51: { icon: CloudRain, label: 'Light drizzle', color: 'text-blue-400'   },
  61: { icon: CloudRain, label: 'Light rain',    color: 'text-blue-400'   },
  63: { icon: CloudRain, label: 'Moderate rain', color: 'text-blue-500'   },
  65: { icon: CloudRain, label: 'Heavy rain',    color: 'text-blue-600'   },
  71: { icon: CloudSnow, label: 'Light snow',    color: 'text-sky-300'    },
  80: { icon: CloudRain, label: 'Rain showers',  color: 'text-blue-400'   },
  95: { icon: Wind,      label: 'Thunderstorm',  color: 'text-purple-500' },
};

const FORECAST_DAYS = 16; // Open-Meteo free tier limit

function getIcon(code: number) {
  return WMO[code] ?? WMO[2];
}

function toDateStr(d: Date) {
  return d.toISOString().slice(0, 10);
}

function dayLabel(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' });
}

export function TripWeather({ destination, startDate, endDate }: Props) {
  const [forecast, setForecast]   = useState<DayForecast[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [isCurrent, setIsCurrent] = useState(false); // true = showing current weather instead of trip dates
  const [daysUntil, setDaysUntil] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        // Geocode
        const geoRes  = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(destination)}&count=1&language=en&format=json`);
        const geoData = await geoRes.json();
        const loc = geoData.results?.[0];
        if (!loc) throw new Error('Location not found');

        const today     = new Date();
        today.setHours(0, 0, 0, 0);
        const tripStart = new Date(startDate);
        tripStart.setHours(0, 0, 0, 0);
        const tripEnd   = new Date(endDate);
        const diffDays  = Math.round((tripStart.getTime() - today.getTime()) / 86_400_000);

        let fetchStart: string;
        let fetchEnd:   string;
        let showCurrent = false;

        if (diffDays <= FORECAST_DAYS) {
          // Trip is within forecast window — clamp end to 16 days out
          const maxEnd = new Date(today);
          maxEnd.setDate(today.getDate() + FORECAST_DAYS - 1);
          fetchStart  = toDateStr(diffDays < 0 ? today : tripStart);
          fetchEnd    = toDateStr(tripEnd > maxEnd ? maxEnd : tripEnd);
        } else {
          // Trip too far out — show current 7-day forecast instead
          const weekOut = new Date(today);
          weekOut.setDate(today.getDate() + 6);
          fetchStart  = toDateStr(today);
          fetchEnd    = toDateStr(weekOut);
          showCurrent = true;
        }

        const wxRes = await fetch(
          `https://api.open-meteo.com/v1/forecast` +
          `?latitude=${loc.latitude}&longitude=${loc.longitude}` +
          `&daily=temperature_2m_max,temperature_2m_min,weathercode` +
          `&timezone=auto&start_date=${fetchStart}&end_date=${fetchEnd}`
        );
        const wx = await wxRes.json();
        if (!wx.daily?.time?.length) throw new Error('No data');

        const days: DayForecast[] = wx.daily.time.map((d: string, i: number) => ({
          date:        d,
          maxTemp:     Math.round(wx.daily.temperature_2m_max[i]),
          minTemp:     Math.round(wx.daily.temperature_2m_min[i]),
          weatherCode: wx.daily.weathercode[i],
        }));

        if (!cancelled) {
          setForecast(days);
          setIsCurrent(showCurrent);
          setDaysUntil(diffDays);
        }
      } catch {
        if (!cancelled) setError('Unable to load weather for this destination.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [destination, startDate, endDate]);

  if (loading) return (
    <div className="flex items-center gap-2 text-sm text-gray-400 py-3">
      <Loader2 className="h-4 w-4 animate-spin" /> Loading weather…
    </div>
  );

  if (error) return (
    <div className="flex items-center gap-2 text-xs text-gray-400 py-2">
      <Thermometer className="h-4 w-4 shrink-0" /> {error}
    </div>
  );

  const days = forecast.slice(0, 7);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <Thermometer className="h-4 w-4 text-orange-400 shrink-0" />
        <span className="text-sm font-semibold text-gray-900">
          {isCurrent ? 'Weather Now' : 'Trip Forecast'}
        </span>
        <span className="text-xs text-gray-400 ml-auto truncate">{destination}</span>
      </div>

      {/* "Too far out" notice */}
      {isCurrent && daysUntil > 0 && (
        <div className="flex items-center gap-1.5 text-[11px] text-amber-600 bg-amber-50 rounded-lg px-2.5 py-1.5 mb-3">
          <CalendarClock className="h-3.5 w-3.5 shrink-0" />
          Trip is {daysUntil} days away — showing current weather. Forecast updates closer to departure.
        </div>
      )}

      {/* Day columns */}
      <div className={`grid gap-1`} style={{ gridTemplateColumns: `repeat(${days.length}, 1fr)` }}>
        {days.map((day) => {
          const { icon: Icon, color } = getIcon(day.weatherCode);
          return (
            <div key={day.date} className="flex flex-col items-center gap-1 bg-gray-50 rounded-xl py-2.5 px-1">
              <span className="text-[9px] text-gray-400 font-medium leading-none">{dayLabel(day.date).split(' ')[0]}</span>
              <span className="text-[9px] text-gray-300 leading-none">{dayLabel(day.date).split(' ')[1]}</span>
              <Icon className={`h-4 w-4 mt-0.5 ${color}`} />
              <span className="text-xs font-bold text-gray-800">{day.maxTemp}°</span>
              <span className="text-[9px] text-gray-400">{day.minTemp}°</span>
            </div>
          );
        })}
      </div>

      {forecast.length > 7 && (
        <p className="text-[10px] text-gray-400 mt-2 text-center">
          Showing {days.length} of {forecast.length} forecast days
        </p>
      )}
    </div>
  );
}
