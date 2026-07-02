'use client';

import { useState } from 'react';
import MessageItem from './MessageItem';
import { useAdmin } from '../../AdminProvider';

export default function MessageTable({ messages }) {
  const { handleBulkDelete } = useAdmin();
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [lastSelectedIndex, setLastSelectedIndex] = useState(null);

  const toggleSelectAll = () => {
    if (selectedIds.size === messages.length && messages.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(messages.map(m => m.id)));
    }
  };

  const toggleSelect = (id, index, e) => {
    const isShiftPressed = e && e.nativeEvent && e.nativeEvent.shiftKey;
    const newSet = new Set(selectedIds);
    const targetState = !selectedIds.has(id);

    if (isShiftPressed && lastSelectedIndex !== null) {
      const start = Math.min(lastSelectedIndex, index);
      const end = Math.max(lastSelectedIndex, index);

      for (let i = start; i <= end; i++) {
        const itemId = messages[i].id;
        if (targetState) {
          newSet.add(itemId);
        } else {
          newSet.delete(itemId);
        }
      }
    } else {
      if (targetState) {
        newSet.add(id);
      } else {
        newSet.delete(id);
      }
    }

    setSelectedIds(newSet);
    setLastSelectedIndex(index);
  };

  const onDeleteSelected = async () => {
    if (selectedIds.size === 0) return;
    setIsDeleting(true);

    const itemsToDelete = messages.filter(m => selectedIds.has(m.id));
    await handleBulkDelete(itemsToDelete);

    setSelectedIds(new Set());
    setIsDeleting(false);
  };

  return (
    <div className="border border-zinc-800 bg-zinc-950/50 backdrop-blur-sm rounded-sm overflow-hidden">
      {/* Table Header Section */}
      <div className="border-b border-zinc-800 p-6 flex items-center justify-between bg-zinc-900/20">
        <h2 className="font-mono text-xs text-zinc-400 uppercase tracking-widest flex items-center gap-2">
          <span className="text-zinc-500">●</span> Raw Data Stream
        </h2>
        <div className="flex items-center gap-4">
          {selectedIds.size > 0 && (
            <button
              onClick={onDeleteSelected}
              disabled={isDeleting}
              className="px-3 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-mono rounded-sm transition-colors border border-red-500/20 disabled:opacity-50"
            >
              {isDeleting ? 'Deleting...' : `Delete Selected (${selectedIds.size})`}
            </button>
          )}
          <span className="text-xs font-mono text-zinc-600">
            {messages.length} recorded events
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-800 text-zinc-500 font-mono text-[10px] uppercase tracking-widest bg-zinc-900/10">
              <th className="p-4 font-normal w-12 text-center">
                <input
                  type="checkbox"
                  checked={messages.length > 0 && selectedIds.size === messages.length}
                  onChange={toggleSelectAll}
                  className="accent-emerald-500/80 cursor-pointer"
                />
              </th>
              <th className="p-4 font-normal min-w-[160px]">Timestamp</th>
              <th className="p-4 font-normal min-w-[300px] w-full">Message Data</th>
              <th className="p-4 font-normal min-w-[200px]">Status</th>
            </tr>
          </thead>
          <tbody className="font-mono text-sm text-zinc-300">
            {messages.map((item, index) => (
              <MessageItem
                key={item.id}
                item={item}
                isSelected={selectedIds.has(item.id)}
                onToggle={(e) => toggleSelect(item.id, index, e)}
              />
            ))}
            {messages.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-zinc-600 font-mono text-sm">
                  No messages found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
