'use client';

import { CloudOff } from 'lucide-react';
import { useWeather } from '@/hooks/use-weather';
import { cn } from '@/lib/utils';

export function WeatherTicker({ location, className }: { location?: string; className?: string }) {
  const { data, isLoading, isError } = useWeather(location);

  if (!location) return null;

  if (isLoading) {
    return (
      <span className={cn('font-mono text-[0.6875rem] uppercase tracking-wide text-faint', className)}>
        conditions loading…
      </span>
    );
  }

  if (isError || !data) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 font-mono text-[0.6875rem] uppercase tracking-wide text-faint',
          className,
        )}
      >
        <CloudOff className="h-3 w-3" /> conditions unavailable
      </span>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded border border-line bg-paper px-2 py-1 font-mono text-[0.6875rem] uppercase tracking-wide text-ink',
        className,
      )}
      title={`Feels like ${data.feelsLike}°C · Humidity ${data.humidity}% · Wind ${data.windSpeed} m/s`}
    >
      <img
        src={`https://openweathermap.org/img/wn/${data.icon}.png`}
        alt={data.description}
        className="h-4 w-4"
        loading="lazy"
      />
      {data.temperature}°C · {data.description} · {data.city}
    </span>
  );
}
