'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  label?: string;
  className?: string;
}

export function BackButton({ label = 'Voltar', className = '' }: BackButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`inline-flex items-center text-sm text-gray-600 hover:text-gray-900 hover:underline mb-4 ${className}`}
    >
      <ArrowLeft className="w-4 h-4 mr-1" />
      {label}
    </button>
  );
}

