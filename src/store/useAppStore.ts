import { create } from 'zustand';
import type { NavTab, Task } from '../types/database.types';
import { format } from 'date-fns';

interface AppState {
  activeDate: string;
  folderExpanded: boolean;
  addTaskOpen: boolean;
  activeNav: NavTab;
  editingTask: Task | null;
  setActiveDate: (d: string) => void;
  setFolderExpanded: (v: boolean) => void;
  setAddTaskOpen: (v: boolean) => void;
  setActiveNav: (nav: NavTab) => void;
  setEditingTask: (t: Task | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  activeDate: format(new Date(), 'yyyy-MM-dd'),
  folderExpanded: false,
  addTaskOpen: false,
  activeNav: 'home',
  editingTask: null,
  setActiveDate: (activeDate) => set({ activeDate }),
  setFolderExpanded: (folderExpanded) => set({ folderExpanded }),
  setAddTaskOpen: (addTaskOpen) => set({ addTaskOpen }),
  setActiveNav: (activeNav) => set({ activeNav }),
  setEditingTask: (editingTask) => set({ editingTask }),
}));
