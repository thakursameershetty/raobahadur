import { prisma } from '@/lib/prisma';
import { createMessage } from '../../actions';
import SearchBar from './SearchBar';
import MessageTable from './MessageTable';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminMessagesPage({ searchParams }) {
  const params = await searchParams;
  const q = params?.q || '';

  const messages = await prisma.userMessageBox.findMany({
    where: {
      message: {
        contains: q,
        mode: 'insensitive',
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="min-h-screen bg-zinc-950 p-4 md:p-12 text-zinc-300">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-mono text-zinc-100 uppercase tracking-widest">
              Message Log
            </h1>
            <p className="text-sm font-mono text-zinc-500 mt-2">
              Admin Dashboard / Users / Messages
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto">
            <SearchBar />
            <form action={createMessage} className="flex flex-1 sm:flex-initial">
              <input
                type="text"
                name="message"
                required
                maxLength={100}
                placeholder="Type a new message..."
                className="w-full sm:w-64 px-3 py-2 bg-zinc-900 border border-zinc-800 text-zinc-300 font-mono text-sm rounded-l-sm focus:outline-none focus:border-zinc-600"
              />
              <button
                type="submit"
                className="w-full sm:w-auto px-4 py-2 bg-emerald-900/30 hover:bg-emerald-900/50 text-emerald-400 font-mono text-xs uppercase tracking-widest rounded-r-sm transition-colors border border-l-0 border-emerald-900/50 whitespace-nowrap"
              >
                + Add
              </button>
            </form>
          </div>
        </header>

        <MessageTable messages={messages} />
      </div>
    </div>
  );
}
