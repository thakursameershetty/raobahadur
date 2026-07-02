'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useTransition, useState, useEffect } from 'react';

export default function SearchBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState(searchParams.get('q') || '');

  useEffect(() => {
    const currentQ = searchParams.get('q') || '';
    if (query === currentQ) return;

    const timeoutId = setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      if (query) {
        params.set('q', query);
      } else {
        params.delete('q');
      }
      startTransition(() => {
        router.replace(`${pathname}?${params.toString()}`);
      });
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [query, pathname, router, searchParams]);

  return (
    <div className="flex items-center flex-1 sm:flex-initial relative">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search messages..."
        className="w-full sm:w-64 px-3 py-2 bg-zinc-900 border border-zinc-800 text-zinc-300 font-mono text-sm rounded-sm focus:outline-none focus:border-zinc-600 pr-10"
      />
      {isPending && (
        <div className="absolute right-3 animate-spin w-4 h-4 border-2 border-zinc-500 border-t-transparent rounded-full" />
      )}
    </div>
  );
}
