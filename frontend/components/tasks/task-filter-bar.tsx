'use client';

import { Search } from 'lucide-react';
import { Input, Select } from '@/components/ui/field';
import type { TaskFilters as TaskFiltersType } from '@/types';

interface Props {
  filters: TaskFiltersType;
  onChange: (next: TaskFiltersType) => void;
}

export function TaskFilterBar({ filters, onChange }: Props) {
  const update = (patch: Partial<TaskFiltersType>) => onChange({ ...filters, ...patch, page: 1 });

  return (
    <div className="flex flex-wrap items-end gap-3 border-b border-line pb-6">
      <div className="min-w-[200px] flex-1">
        <label className="eyebrow mb-1.5 block">Search</label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
          <Input
            className="pl-9"
            placeholder="Search title or description…"
            value={filters.search ?? ''}
            onChange={(e) => update({ search: e.target.value })}
          />
        </div>
      </div>

      <div>
        <label className="eyebrow mb-1.5 block">Status</label>
        <Select
          className="w-40"
          value={filters.status ?? ''}
          onChange={(e) => update({ status: e.target.value as TaskFiltersType['status'] })}
        >
          <option value="">All</option>
          <option value="todo">To do</option>
          <option value="in-progress">In progress</option>
          <option value="done">Done</option>
        </Select>
      </div>

      <div>
        <label className="eyebrow mb-1.5 block">Priority</label>
        <Select
          className="w-36"
          value={filters.priority ?? ''}
          onChange={(e) => update({ priority: e.target.value as TaskFiltersType['priority'] })}
        >
          <option value="">All</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </Select>
      </div>

      <div>
        <label className="eyebrow mb-1.5 block">Due from</label>
        <Input
          type="date"
          className="w-40"
          value={filters.dueDateFrom ?? ''}
          onChange={(e) => update({ dueDateFrom: e.target.value })}
        />
      </div>

      <div>
        <label className="eyebrow mb-1.5 block">Due to</label>
        <Input
          type="date"
          className="w-40"
          value={filters.dueDateTo ?? ''}
          onChange={(e) => update({ dueDateTo: e.target.value })}
        />
      </div>

      <div>
        <label className="eyebrow mb-1.5 block">Sort by</label>
        <Select
          className="w-40"
          value={`${filters.sortBy}:${filters.sortOrder}`}
          onChange={(e) => {
            const [sortBy, sortOrder] = e.target.value.split(':') as [TaskFiltersType['sortBy'], TaskFiltersType['sortOrder']];
            update({ sortBy, sortOrder });
          }}
        >
          <option value="createdAt:desc">Newest first</option>
          <option value="createdAt:asc">Oldest first</option>
          <option value="dueDate:asc">Due date ↑</option>
          <option value="dueDate:desc">Due date ↓</option>
          <option value="priority:desc">Priority ↓</option>
          <option value="title:asc">Title A–Z</option>
        </Select>
      </div>
    </div>
  );
}
