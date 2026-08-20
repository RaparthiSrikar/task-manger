'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, ClipboardList, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/card';
import { Pagination } from '@/components/tasks/pagination';
import { TaskCard } from '@/components/tasks/task-card';
import { TaskFilterBar } from '@/components/tasks/task-filter-bar';
import { useTasks } from '@/hooks/use-tasks';
import { getApiErrorMessage } from '@/lib/api-client';
import type { TaskFilters } from '@/types';

const defaultFilters: TaskFilters = {
  page: 1,
  limit: 9,
  sortBy: 'createdAt',
  sortOrder: 'desc',
};

export default function DashboardPage() {
  const [filters, setFilters] = useState<TaskFilters>(defaultFilters);
  const { data, isLoading, isError, error } = useTasks(filters);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="eyebrow mb-1">Task dashboard</p>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">Your board</h1>
        </div>
        <Link href="/dashboard/tasks/new" className="sm:hidden">
          <Button variant="primary">
            <Plus className="h-4 w-4" /> New task
          </Button>
        </Link>
      </div>

      <TaskFilterBar filters={filters} onChange={setFilters} />

      {isLoading && (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      )}

      {isError && (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-danger-soft bg-danger-soft py-16 text-center">
          <AlertTriangle className="h-6 w-6 text-danger" />
          <p className="text-sm text-danger">{getApiErrorMessage(error, 'Could not load tasks')}</p>
        </div>
      )}

      {!isLoading && !isError && data && data.items.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-line py-16 text-center">
          <ClipboardList className="h-8 w-8 text-faint" />
          <div>
            <p className="font-medium text-ink">No tasks match these filters</p>
            <p className="text-sm text-muted">Create a task or clear a filter to see more.</p>
          </div>
          <Link href="/dashboard/tasks/new">
            <Button variant="primary">
              <Plus className="h-4 w-4" /> New task
            </Button>
          </Link>
        </div>
      )}

      {!isLoading && !isError && data && data.items.length > 0 && (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data.items.map((task) => (
              <TaskCard key={task._id} task={task} />
            ))}
          </div>
          <Pagination meta={data.meta} onPageChange={(page) => setFilters((f) => ({ ...f, page }))} />
        </>
      )}
    </div>
  );
}
