'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronRight, FileCode, Folder, FolderOpen } from 'lucide-react';
import { CodeFile } from '@/types';

interface FileTreeProps {
  tree: any;
  files: CodeFile[];
  onSelect: (file: CodeFile) => void;
  selectedPath?: string;
  level?: number;
  path?: string;
}

export default function FileTree({ tree, files, onSelect, selectedPath, level = 0, path = '' }: FileTreeProps) {
  const [isOpen, setIsOpen] = useState(level === 0); // Root folder open by default

  const entries = Object.entries(tree).filter(([key]) => key !== '_count');

  return (
    <div className="select-none">
      {entries.map(([key, value]: [string, any]) => {
        const currentPath = path ? `${path}/${key}` : key;
        const isFolder = typeof value === 'object' && value !== null;
        const isSelected = selectedPath === currentPath;

        if (isFolder) {
          return (
            <div key={currentPath}>
              <div
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-1.5 py-1 px-2 hover:bg-white/5 cursor-pointer rounded transition-colors group"
                style={{ paddingLeft: `${level * 12 + 8}px` }}
              >
                {isOpen ? (
                  <ChevronDown className="w-3 h-3 text-slate-500" />
                ) : (
                  <ChevronRight className="w-3 h-3 text-slate-500" />
                )}
                {isOpen ? (
                  <FolderOpen className="w-3.5 h-3.5 text-brand-orange/70" />
                ) : (
                  <Folder className="w-3.5 h-3.5 text-slate-500" />
                )}
                <span className="text-[11px] font-bold text-slate-400 group-hover:text-slate-200 uppercase tracking-tighter transition-colors">
                  {key}
                </span>
                <span className="ml-auto text-[9px] text-slate-600 font-mono">{value._count}</span>
              </div>
              
              {isOpen && (
                <FileTree
                  tree={value}
                  files={files}
                  onSelect={onSelect}
                  selectedPath={selectedPath}
                  level={level + 1}
                  path={currentPath}
                />
              )}
            </div>
          );
        }

        // It's a File
        const fileData = files.find(f => f.path === currentPath);
        if (!fileData) return null;

        return (
          <div
            key={currentPath}
            onClick={() => onSelect(fileData)}
            className={`flex items-center gap-2 py-1.5 px-3 cursor-pointer transition-all border-l-2 ${
              isSelected 
                ? 'bg-brand-orange/10 border-brand-orange text-brand-orange shadow-[inset_4px_0_10px_rgba(241,119,32,0.05)]' 
                : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-white/5'
            }`}
            style={{ paddingLeft: `${level * 12 + 20}px` }}
          >
            <FileCode className={`w-3.5 h-3.5 ${isSelected ? 'text-brand-orange' : 'text-slate-600'}`} />
            <span className="text-[11px] font-mono truncate tracking-tight">{key}</span>
          </div>
        );
      })}
    </div>
  );
}