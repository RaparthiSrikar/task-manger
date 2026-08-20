import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TaskPriority, TaskStatus } from '@/types';

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn('rounded-lg border border-line bg-surface', className)}>{children}</div>
  );
}

const statusStyles: Record<TaskStatus, string> = {
  todo: 'bg-info-soft text-info',
  'in-progress': 'bg-signal-soft text-signal',
  done: 'bg-success-soft text-success',
};

const statusLabel: Record<TaskStatus, string> = {
  todo: 'To do',
  'in-progress': 'In progress',
  done: 'Done',
};

export function StatusBadge({ status }: { status: TaskStatus }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 font-mono text-[0.6875rem] uppercase tracking-wide',
        statusStyles[status],
      )}
    >
      {statusLabel[status]}
    </span>
  );
}

const priorityStyles: Record<TaskPriority, string> = {
  low: 'text-muted',
  medium: 'text-signal',
  high: 'text-danger',
};

export function PriorityMark({ priority }: { priority: TaskPriority }) {
  return (
    <span className={cn('font-mono text-[0.6875rem] uppercase tracking-wide', priorityStyles[priority])}>
      {priority === 'high' ? '▲▲▲' : priority === 'medium' ? '▲▲' : '▲'} {priority}
    </span>
  );
}

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn('h-5 w-5 animate-spin text-muted', className)} />;
}
