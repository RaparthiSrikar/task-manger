'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { TaskForm, type TaskFormValues } from '@/components/tasks/task-form';
import { useCreateTask } from '@/hooks/use-tasks';
import { getApiErrorMessage } from '@/lib/api-client';

export default function NewTaskPage() {
  const router = useRouter();
  const createTask = useCreateTask();

  const handleSubmit = (values: TaskFormValues) => {
    createTask.mutate(
      {
        ...values,
        dueDate: values.dueDate ? new Date(values.dueDate).toISOString() : undefined,
      },
      {
        onSuccess: (task) => router.replace(`/dashboard/tasks/${task._id}`),
      },
    );
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Back to board
      </Link>

      <div>
        <p className="eyebrow mb-1">New task</p>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Create a task</h1>
        <p className="mt-1 text-sm text-muted">
          You&apos;ll get a confirmation email once it&apos;s created. Add a file after saving.
        </p>
      </div>

      <Card className="p-6">
        {createTask.isError && (
          <p className="mb-4 rounded-md bg-danger-soft px-3 py-2 text-sm text-danger">
            {getApiErrorMessage(createTask.error, 'Could not create task')}
          </p>
        )}
        <TaskForm onSubmit={handleSubmit} submitLabel="Create task" submitting={createTask.isPending} />
      </Card>
    </div>
  );
}
