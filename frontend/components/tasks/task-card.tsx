'use client';

import Link from 'next/link';
import { format } from 'date-fns';
import { MapPin, Paperclip, CalendarClock } from 'lucide-react';
import { Card, PriorityMark, StatusBadge } from '@/components/ui/card';
import { WeatherTicker } from '@/components/tasks/weather-ticker';
import { cn } from '@/lib/utils';
import type { Task } from '@/types';

const priorityBar: Record<Task['priority'], string> = {
  low: 'bg-line',
  medium: 'bg-signal',
  high: 'bg-danger',
};

export function TaskCard({ task }: { task: Task }) {
  return (
    <Link href={`/dashboard/tasks/${task._id}`}>
      <Card className="flex overflow-hidden transition-shadow hover:shadow-sm">
        <div className={cn('w-1.5 shrink-0', priorityBar[task.priority])} aria-hidden />
        <div className="flex-1 space-y-2 p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-medium leading-snug text-ink">{task.title}</h3>
            <StatusBadge status={task.status} />
          </div>

          {task.description && (
            <p className="line-clamp-2 text-sm text-muted">{task.description}</p>
          )}

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1 text-xs text-muted">
            <PriorityMark priority={task.priority} />
            {task.dueDate && (
              <span className="inline-flex items-center gap-1 font-mono uppercase tracking-wide">
                <CalendarClock className="h-3 w-3" /> {format(new Date(task.dueDate), 'MMM d, yyyy')}
              </span>
            )}
            {task.attachmentUrl && (
              <span className="inline-flex items-center gap-1 font-mono uppercase tracking-wide">
                <Paperclip className="h-3 w-3" /> attachment
              </span>
            )}
          </div>

          {task.location && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="inline-flex items-center gap-1 text-xs text-muted">
                <MapPin className="h-3 w-3" /> {task.location}
              </span>
              <WeatherTicker location={task.location} />
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
}
