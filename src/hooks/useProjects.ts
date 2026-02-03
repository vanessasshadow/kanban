import { useState, useEffect } from 'react';
import axios from 'axios';

export interface Project {
  id: string;
  name: string;
  color: string;
  position: number;
  created_at: string;
}

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data } = await axios.get<Project[]>('/api/projects');
      setProjects(data);
      setIsLoaded(true);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      setIsLoaded(true);
    }
  };

  const addProject = async (name: string, color: string) => {
    try {
      const { data } = await axios.post<Project>('/api/projects', {
        name,
        color,
        position: projects.length,
      });
      setProjects([...projects, data]);
      return data;
    } catch (error) {
      console.error('Failed to add project:', error);
      throw error;
    }
  };

  return {
    projects,
    isLoaded,
    addProject,
    refetch: fetchProjects,
  };
}
