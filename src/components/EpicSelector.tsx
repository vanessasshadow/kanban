'use client';

import { useState } from 'react';
import { Epic } from '@/types';

interface EpicSelectorProps {
  epics: Epic[];
  selectedEpicId: string | null;
  onSelect: (epicId: string | null) => void;
  onAddEpic: (name: string, color: string) => void;
  onDeleteEpic: (id: string) => void;
}

const COLORS = [
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#f97316', // orange
  '#22c55e', // green
  '#06b6d4', // cyan
  '#eab308', // yellow
  '#ef4444', // red
];

export function EpicSelector({ epics, selectedEpicId, onSelect, onAddEpic, onDeleteEpic }: EpicSelectorProps) {
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(COLORS[0]);
  const [showMenu, setShowMenu] = useState<string | null>(null);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    onAddEpic(newName.trim(), newColor);
    setNewName('');
    setNewColor(COLORS[0]);
    setShowCreate(false);
  };

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 flex-wrap">
        {/* All tasks tab */}
        <button
          onClick={() => onSelect(null)}
          className={`
            px-4 py-2 rounded-lg text-sm font-medium transition-colors
            ${selectedEpicId === null
              ? 'bg-zinc-700 text-zinc-100'
              : 'bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-300'
            }
          `}
        >
          All Tasks
        </button>

        {/* Epic tabs */}
        {epics.map(epic => (
          <div key={epic.id} className="relative">
            <button
              onClick={() => onSelect(epic.id)}
              onContextMenu={(e) => {
                e.preventDefault();
                setShowMenu(showMenu === epic.id ? null : epic.id);
              }}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2
                ${selectedEpicId === epic.id
                  ? 'text-white'
                  : 'bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-300'
                }
              `}
              style={selectedEpicId === epic.id ? { backgroundColor: epic.color } : {}}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: epic.color }}
              />
              {epic.name}
            </button>

            {/* Context menu */}
            {showMenu === epic.id && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowMenu(null)}
                />
                <div className="absolute top-full left-0 mt-1 bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg z-50 py-1 min-w-[120px]">
                  <button
                    onClick={() => {
                      if (confirm(`Delete "${epic.name}" epic? Tasks will be unassigned.`)) {
                        onDeleteEpic(epic.id);
                      }
                      setShowMenu(null);
                    }}
                    className="w-full px-3 py-1.5 text-left text-sm text-red-400 hover:bg-zinc-700"
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        ))}

        {/* Add epic button */}
        {showCreate ? (
          <form onSubmit={handleCreate} className="flex items-center gap-2">
            <input
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="Epic name..."
              autoFocus
              className="px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded-lg text-sm
                         text-zinc-100 focus:outline-none focus:border-blue-500 w-32"
            />
            <div className="flex gap-1">
              {COLORS.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setNewColor(color)}
                  className={`w-5 h-5 rounded-full transition-transform ${newColor === color ? 'scale-125 ring-2 ring-white/50' : ''}`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <button
              type="submit"
              disabled={!newName.trim()}
              className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium
                         hover:bg-blue-500 disabled:opacity-50"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => setShowCreate(false)}
              className="px-3 py-1.5 text-zinc-400 hover:text-zinc-200 text-sm"
            >
              Cancel
            </button>
          </form>
        ) : (
          <button
            onClick={() => setShowCreate(true)}
            className="px-3 py-2 text-zinc-500 hover:text-zinc-300 text-sm"
          >
            + Epic
          </button>
        )}
      </div>
    </div>
  );
}
