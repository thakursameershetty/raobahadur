'use client';

import { useState } from 'react';
import { useAdmin } from '../../AdminProvider';

export default function MessageItem({ item, isSelected, onToggle }) {
  const { handleBulkDelete } = useAdmin();
  const [isDeleting, setIsDeleting] = useState(false);

  const onDelete = async () => {
    setIsDeleting(true);
    await handleBulkDelete([item]);
  };

  return (
    <tr className={`border-b border-zinc-800/50 transition-all ${isDeleting ? 'opacity-50 pointer-events-none' : 'hover:bg-zinc-900/50'} ${isSelected ? 'bg-zinc-900/30' : ''}`}>
      <td className="p-4 text-center">
        <input 
          type="checkbox" 
          checked={isSelected}
          onChange={onToggle}
          className="accent-emerald-500/80 cursor-pointer"
        />
      </td>
      <td className="p-4 text-zinc-500 whitespace-nowrap">
        {new Date(item.createdAt).toLocaleString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })}
      </td>
      <td className="p-4 text-white/90 break-words">
        {item.message}
      </td>
      <td className="p-4 flex items-center gap-4 text-zinc-400 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500/80"></span>
          Logged
        </div>
        <button
          onClick={onDelete}
          disabled={isDeleting}
          className="px-3 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-sm transition-colors border border-red-500/20 disabled:opacity-50"
        >
          {isDeleting ? '...' : 'Delete'}
        </button>
      </td>
    </tr>
  );
}
