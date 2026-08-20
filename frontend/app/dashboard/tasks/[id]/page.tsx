'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { AlertTriangle, ArrowLeft, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, Spinner } from '@/components/ui/card';
import { AttachmentCard } from '@/components/tasks/attachment-card';
import { TaskForm, type TaskFormValues } from '@/components/tasks/task-form';
import { WeatherPanel } from '@/components/tasks/weather-panel';
import { useDeleteTask, useTask, useUpdateTask } from '@/hooks/use-tasks';
import { getApiErrorMessage } from '@/lib/api-client';

export default function TaskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const { data: task, isLoading, isError, error } = useTask(id);
  const updateTask = useUpdateTask(id);
  const deleteTask = useDeleteTask();

  const handleSubmit = (values: TaskFormValues) => {
    updateTask.mutate({
      ...values,
      dueDate: values.dueDate ? new Date(values.dueDate).toISOString() : undefined,
    });
  };

  const handleDelete = () => {
    deleteTask.mutate(id, { onSuccess: () => router.replace('/dashboard') });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }

  if (isError || !task) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-danger-soft bg-danger-soft py-16 text-center">
        <AlertTriangle className="h-6 w-6 text-danger" />
        <p className="text-sm text-danger">{getApiErrorMessage(error, 'Task not found')}</p>
        <Link href="/dashboard" className="text-sm font-medium text-navy hover:underline">
          Back to board
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Back to board
      </Link>

      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="eyebrow mb-1">Task detail</p>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">{task.title}</h1>
          <p className="mt-1 font-mono text-xs uppercase tracking-wide text-faint">
            Created {format(new Date(task.createdAt), 'MMM d, yyyy')} · Updated{' '}
            {format(new Date(task.updatedAt), 'MMM d, yyyy')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card className="p-6 md:col-span-2">
          {updateTask.isError && (
            <p className="mb-4 rounded-md bg-danger-soft px-3 py-2 text-sm text-danger">
              {getApiErrorMessage(updateTask.error, 'Could not save changes')}
            </p>
          )}
          {updateTask.isSuccess && (
            <p className="mb-4 rounded-md bg-success-soft px-3 py-2 text-sm text-success">Saved.</p>
          )}
          <TaskForm
            defaultValues={{
              title: task.title,
              description: task.description ?? '',
              status: task.status,
              priority: task.priority,
              dueDate: task.dueDate ? task.dueDate.slice(0, 10) : '',
              location: task.location ?? '',
            }}
            onSubmit={handleSubmit}
            submitLabel="Save changes"
            submitting={updateTask.isPending}
          />
        </Card>

        <div className="space-y-6">
          <WeatherPanel location={task.location} weather={task.weather} />
          <AttachmentCard taskId={task._id} attachmentUrl={task.attachmentUrl} />

          <Card className="p-4">
            {!confirmingDelete ? (
              <Button variant="danger" className="w-full" onClick={() => setConfirmingDelete(true)}>
                <Trash2 className="h-4 w-4" /> Delete task
              </Button>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-ink">Delete this task? This can&apos;t be undone.</p>
                <div className="flex gap-2">
                  <Button variant="danger" className="flex-1" loading={deleteTask.isPending} onClick={handleDelete}>
                    Confirm delete
                  </Button>
                  <Button variant="secondary" className="flex-1" onClick={() => setConfirmingDelete(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
