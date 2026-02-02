import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Loading({ content }: { content: string }) {
  return (
    <div className="mx-auto flex h-[calc(100vh-60px)] max-w-4xl items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <p className="text-lg font-medium">{content}</p>
      </div>
    </div>
  );
}

