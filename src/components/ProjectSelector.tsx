'use client';

import { Project } from '@/types';

interface ProjectSelectorProps {
  projects: Project[];
  selectedProjectId: string | null;
  onSelect: (projectId: string | null) => void;
}

export function ProjectSelector({ projects, selectedProjectId, onSelect }: ProjectSelectorProps) {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-2">
        <span className="text-sm text-zinc-400">Project:</span>
        <select
          value={selectedProjectId || 'all'}
          onChange={(e) => onSelect(e.target.value === 'all' ? null : e.target.value)}
          className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-100
                     focus:outline-none focus:border-blue-500 hover:bg-zinc-700"
        >
          <option value="all">All Projects</option>
          {projects.map(project => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
