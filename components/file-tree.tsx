'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronRight, FileCode, Folder, FolderOpen } from 'lucide-react';
import { CodeFile } from '@/types';

interface FileTreeProps {
  tree: unknown;
  files: CodeFile[];
  onSelect: (file: CodeFile) => void;
  selectedPath?: string;
  level?: number;
  path?: string;
}

function FolderNode({
  name, value, files, onSelect, selectedPath, level, path,
}: {
  name: string; value: unknown; files: CodeFile[];
  onSelect: (f: CodeFile) => void; selectedPath?: string;
  level: number; path: string;
}) {
  const [open, setOpen] = useState(level === 0);
  return (
    <div>
      <div
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 py-1 px-2 hover:bg-white/5 cursor-pointer rounded transition-colors group"
        style={{ paddingLeft: `${level * 12 + 8}px` }}
      >
        {open ? <ChevronDown className="w-3 h-3 text-slate-500" /> : <ChevronRight className="w-3 h-3 text-slate-500" />}
        {open ? <FolderOpen className="w-3.5 h-3.5 text-brand-orange/70" /> : <Folder className="w-3.5 h-3.5 text-slate-500" />}
        <span className="text-[11px] font-bold text-slate-400 group-hover:text-slate-200 uppercase tracking-tighter transition-colors">
          {name}
        </span>
        <span className="ml-auto text-[9px] text-slate-600 font-mono">{String((value as Record<string, unknown>)._count)}</span>
      </div>
      {open && (
        <FileTreeEntries
          tree={value} files={files} onSelect={onSelect}
          selectedPath={selectedPath} level={level + 1} path={path}
        />
      )}
    </div>
  );
}

function FileTreeEntries({ tree, files, onSelect, selectedPath, level = 0, path = '' }: FileTreeProps) {
  const entries = Object.entries(tree as Record<string, unknown>).filter(([key]) => key !== '_count');

  return (
    <div>
      {entries.map(([key, value]: [string, unknown]) => {
        const currentPath = path ? `${path}/${key}` : key;
        const isFolder = typeof value === 'object' && value !== null && '_count' in value;

        if (isFolder) {
          return (
            <FolderNode
              key={currentPath}
              name={key}
              value={value}
              files={files}
              onSelect={onSelect}
              selectedPath={selectedPath}
              level={level}
              path={currentPath}
            />
          );
        }

        const fileData = files.find(f => f.path === currentPath);
        if (!fileData) return null;
        const isSelected = selectedPath === currentPath;

        return (
          <div
            key={currentPath}
            onClick={() => onSelect(fileData)}
            className={`flex items-center gap-2 py-1.5 cursor-pointer transition-all border-l-2 ${
              isSelected
                ? 'bg-brand-orange/10 border-brand-orange text-brand-orange shadow-[inset_4px_0_10px_rgba(241,119,32,0.05)]'
                : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-white/5'
            }`}
            style={{ paddingLeft: `${level * 12 + 20}px` }}
          >
            <FileCode className={`w-3.5 h-3.5 flex-shrink-0 ${isSelected ? 'text-brand-orange' : 'text-slate-600'}`} />
            <span className="text-[11px] font-mono truncate tracking-tight">{key}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function FileTree(props: FileTreeProps) {
  return <FileTreeEntries {...props} />;
}
