import { CloudOff, Droplets, Wind } from 'lucide-react';
import { Card } from '@/components/ui/card';
import type { Weather } from '@/types';

export function WeatherPanel({ location, weather }: { location?: string; weather?: Weather | null }) {
  if (!location) return null;

  return (
    <Card className="p-4">
      <p className="eyebrow mb-3">Conditions at {location}</p>

      {!weather ? (
        <div className="flex items-center gap-2 text-sm text-faint">
          <CloudOff className="h-4 w-4" /> Weather unavailable for this location right now.
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <img
              src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
              alt={weather.description}
              className="h-12 w-12"
            />
            <div>
              <p className="text-2xl font-semibold tracking-tight text-ink">{weather.temperature}°C</p>
              <p className="text-sm capitalize text-muted">{weather.description}</p>
            </div>
          </div>
          <div className="flex gap-4 border-t border-line pt-3 font-mono text-xs uppercase tracking-wide text-muted">
            <span>Feels {weather.feelsLike}°C</span>
            <span className="inline-flex items-center gap-1">
              <Droplets className="h-3 w-3" /> {weather.humidity}%
            </span>
            <span className="inline-flex items-center gap-1">
              <Wind className="h-3 w-3" /> {weather.windSpeed} m/s
            </span>
          </div>
        </div>
      )}
    </Card>
  );
}
