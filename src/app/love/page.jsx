'use client';

import { useRouter } from 'next/navigation';
import PortraitGenerator from '@/components/PortraitGenerator';
import CustomCursor from '@/components/CustomCursor';

export default function LovePage() {
  const router = useRouter();

  return (
    <main
      className="relative min-h-[100dvh] w-full bg-[#0E0C09] overflow-hidden flex flex-col items-center justify-start text-white font-sans"
      style={{ cursor: 'none' }}
    >
      <div className="absolute inset-0 z-40 w-full h-full">
        <PortraitGenerator onBack={() => router.push('/')} />
      </div>
      <CustomCursor />
    </main>
  );
}
