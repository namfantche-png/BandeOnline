'use client';

import React, { useState, useEffect } from 'react';
import { Loader } from 'lucide-react';

interface LoadingProps {
  fullscreen?: boolean;
  message?: string;
}

export function Loading({ fullscreen = false, message = 'Carregando...' }: LoadingProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-4 ${
        fullscreen ? 'fixed inset-0 bg-white/80 z-50' : 'h-64'
      }`}
    >
      <Loader className="w-8 h-8 text-blue-600 animate-spin" />
      <p className="text-gray-600 text-sm">{message}</p>
    </div>
  );
}
