'use client';

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { deleteMessages, restoreMessages } from './actions';

const AdminContext = createContext();

export function AdminProvider({ children }) {
  // deletedBatches stores objects like: { id: 'batch-123', items: [...] }
  const [deletedBatches, setDeletedBatches] = useState([]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        if (deletedBatches.length > 0) {
          const batchToRestore = deletedBatches[deletedBatches.length - 1];
          
          // Trigger restore action outside of state updater!
          restoreMessages(batchToRestore.items);
          
          // Remove from the deleted batches list
          setDeletedBatches(prev => prev.slice(0, -1));
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [deletedBatches]);

  const handleBulkDelete = useCallback(async (items) => {
    const batchId = Date.now().toString();
    setDeletedBatches(prev => [...prev, { id: batchId, items }]);
    await deleteMessages(items.map(i => i.id));
  }, []);

  const handleUndoBatch = useCallback(async (batch) => {
    setDeletedBatches(prev => prev.filter(b => b.id !== batch.id));
    await restoreMessages(batch.items);
  }, []);

  const handleDismissBatch = useCallback((batch) => {
    setDeletedBatches(prev => prev.filter(b => b.id !== batch.id));
  }, []);

  return (
    <AdminContext.Provider value={{ handleBulkDelete }}>
      {children}
      {deletedBatches.length > 0 && (
        <div className="fixed top-6 right-6 z-50 flex flex-col gap-3">
          {deletedBatches.map((batch) => (
            <ToastItem 
              key={batch.id} 
              batch={batch} 
              onUndo={handleUndoBatch} 
              onDismiss={handleDismissBatch}
            />
          ))}
        </div>
      )}
    </AdminContext.Provider>
  );
}

function ToastItem({ batch, onUndo, onDismiss }) {
  const [isRestoring, setIsRestoring] = useState(false);

  useEffect(() => {
    // Auto-dismiss the toast after 10 seconds
    const timer = setTimeout(() => {
      onDismiss(batch);
    }, 10000);
    return () => clearTimeout(timer);
  }, [batch, onDismiss]);

  const handleUndoClick = async () => {
    setIsRestoring(true);
    await onUndo(batch);
  };

  const isMultiple = batch.items.length > 1;

  return (
    <div className="bg-zinc-900 border border-zinc-700 text-zinc-300 p-4 rounded-sm shadow-2xl flex items-center justify-between gap-6 font-mono text-sm animate-in slide-in-from-top-2 fade-in duration-300">
      <div className="flex flex-col gap-1 max-w-[250px]">
        <span className="text-red-400 font-semibold tracking-widest text-xs uppercase">
          {isMultiple ? `${batch.items.length} Messages Deleted` : 'Message Deleted'}
        </span>
        <span className="truncate text-zinc-400">
          {isMultiple ? `Multiple items removed.` : `"${batch.items[0].message}"`}
        </span>
      </div>
      <button 
        onClick={handleUndoClick}
        disabled={isRestoring}
        className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded-sm transition-colors border border-zinc-600 disabled:opacity-50 whitespace-nowrap"
      >
        {isRestoring ? 'Restoring...' : 'Undo (Cmd+Z)'}
      </button>
    </div>
  );
}

export const useAdmin = () => useContext(AdminContext);
