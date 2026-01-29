'use client';

import { useState, useEffect, useCallback } from 'react';
import { Task, ColumnId, Priority } from '@/types';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'kanban-tasks';

// Check if we should use API (set via env var at build time)
const USE_API = process.env.NEXT_PUBLIC_USE_API === 'true';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch tasks from API or localStorage
  useEffect(() => {
    async function loadTasks() {
      if (USE_API) {
        try {
          const res = await fetch('/api/tasks');
          if (!res.ok) throw new Error('Failed to fetch tasks');
          const data = await res.json();
          // Map API response to frontend Task type
          setTasks(data.map((t: Record<string, unknown>) => ({
            id: t.id as string,
            title: t.title as string,
            description: t.description as string | undefined,
            priority: t.priority as Priority,
            columnId: t.columnId as ColumnId,
            createdAt: new Date(t.createdAt as string).getTime(),
          })));
        } catch (err) {
          console.error('API fetch failed, falling back to localStorage:', err);
          loadFromLocalStorage();
        }
      } else {
        loadFromLocalStorage();
      }
      setIsLoaded(true);
    }

    function loadFromLocalStorage() {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          setTasks(JSON.parse(stored));
        } catch {
          console.error('Failed to parse stored tasks');
        }
      }
    }

    loadTasks();
  }, []);

  // Save to localStorage as backup (when not using API or as fallback)
  useEffect(() => {
    if (isLoaded && !USE_API) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    }
  }, [tasks, isLoaded]);

  const addTask = useCallback(async (
    title: string,
    description: string,
    priority: Priority,
    columnId: ColumnId = 'backlog'
  ) => {
    if (USE_API) {
      try {
        const res = await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, description, priority, columnId }),
        });
        if (!res.ok) throw new Error('Failed to create task');
        const newTask = await res.json();
        setTasks(prev => [...prev, {
          id: newTask.id,
          title: newTask.title,
          description: newTask.description,
          priority: newTask.priority,
          columnId: newTask.columnId,
          createdAt: new Date(newTask.createdAt).getTime(),
        }]);
        return newTask;
      } catch (err) {
        setError('Failed to create task');
        console.error(err);
      }
    } else {
      const newTask: Task = {
        id: uuidv4(),
        title,
        description: description || undefined,
        priority,
        columnId,
        createdAt: Date.now(),
      };
      setTasks(prev => [...prev, newTask]);
      return newTask;
    }
  }, []);

  const updateTask = useCallback(async (
    id: string,
    updates: Partial<Omit<Task, 'id' | 'createdAt'>>
  ) => {
    if (USE_API) {
      try {
        const res = await fetch(`/api/tasks/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        });
        if (!res.ok) throw new Error('Failed to update task');
        setTasks(prev => prev.map(task =>
          task.id === id ? { ...task, ...updates } : task
        ));
      } catch (err) {
        setError('Failed to update task');
        console.error(err);
      }
    } else {
      setTasks(prev => prev.map(task =>
        task.id === id ? { ...task, ...updates } : task
      ));
    }
  }, []);

  const deleteTask = useCallback(async (id: string) => {
    if (USE_API) {
      try {
        const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed to delete task');
        setTasks(prev => prev.filter(task => task.id !== id));
      } catch (err) {
        setError('Failed to delete task');
        console.error(err);
      }
    } else {
      setTasks(prev => prev.filter(task => task.id !== id));
    }
  }, []);

  const moveTask = useCallback(async (taskId: string, newColumnId: ColumnId) => {
    // Optimistic update
    setTasks(prev => prev.map(task =>
      task.id === taskId ? { ...task, columnId: newColumnId } : task
    ));

    if (USE_API) {
      try {
        const res = await fetch(`/api/tasks/${taskId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ columnId: newColumnId }),
        });
        if (!res.ok) throw new Error('Failed to move task');
      } catch (err) {
        // Revert on failure
        setError('Failed to move task');
        console.error(err);
      }
    }
  }, []);

  const getTasksByColumn = useCallback((columnId: ColumnId) => {
    return tasks.filter(task => task.columnId === columnId);
  }, [tasks]);

  return {
    tasks,
    isLoaded,
    error,
    addTask,
    updateTask,
    deleteTask,
    moveTask,
    getTasksByColumn,
  };
}
