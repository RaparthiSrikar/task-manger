import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

export interface WeatherResult {
  city: string;
  temperature: number;
  feelsLike: number;
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;
}

interface CacheEntry {
  data: WeatherResult;
  expiresAt: number;
}

@Injectable()
export class WeatherService {
  private readonly logger = new Logger(WeatherService.name);
  private readonly cache = new Map<string, CacheEntry>();
  private readonly CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes — avoids hammering the free API tier

  constructor(
    private http: HttpService,
    private config: ConfigService,
  ) {}

  async getCurrentWeather(location: string): Promise<WeatherResult | null> {
    if (!location) return null;

    const cacheKey = location.trim().toLowerCase();
    const cached = this.cache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.data;
    }

    const apiKey = this.config.get<string>('weather.apiKey');
    if (!apiKey) {
      this.logger.warn('OPENWEATHER_API_KEY not set — skipping weather lookup');
      return null;
    }

    try {
      const { data } = await firstValueFrom(
        this.http.get('https://api.openweathermap.org/data/2.5/weather', {
          params: { q: location, appid: apiKey, units: 'metric' },
        }),
      );

      const result: WeatherResult = {
        city: data.name || location,
        temperature: Math.round(data.main.temp),
        feelsLike: Math.round(data.main.feels_like),
        description: data.weather?.[0]?.description ?? '',
        icon: data.weather?.[0]?.icon ?? '',
        humidity: data.main.humidity,
        windSpeed: data.wind?.speed ?? 0,
      };

      this.cache.set(cacheKey, { data: result, expiresAt: Date.now() + this.CACHE_TTL_MS });
      return result;
    } catch (err) {
      // A bad/unknown location or a flaky API should never break task CRUD.
      this.logger.warn(
        `Weather lookup failed for "${location}": ${err instanceof Error ? err.message : err}`,
      );
      return null;
    }
  }
}
