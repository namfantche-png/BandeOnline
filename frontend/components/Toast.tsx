'use client';

import React from 'react';
import { AlertCircle, CheckCircle, InfoIcon, XCircle } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  type: ToastType;
  title: string;
  message?: string;
  onClose?: () => void;
}

export function Toast({ type, title, message, onClose }: ToastProps) {
  const styles = {
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      icon: <CheckCircle className="w-5 h-5 text-green-600" />,
      titleColor: 'text-green-800',
      messageColor: 'text-green-700',
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: <XCircle className="w-5 h-5 text-red-600" />,
      titleColor: 'text-red-800',
      messageColor: 'text-red-700',
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      icon: <AlertCircle className="w-5 h-5 text-yellow-600" />,
      titleColor: 'text-yellow-800',
      messageColor: 'text-yellow-700',
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: <InfoIcon className="w-5 h-5 text-blue-600" />,
      titleColor: 'text-blue-800',
      messageColor: 'text-blue-700',
    },
  };

  const style = styles[type];

  return (
    <div
      className={`${style.bg} ${style.border} border rounded-lg p-4 flex gap-4 items-start shadow-md`}
      role="alert"
    >
      {style.icon}
      <div className="flex-1">
        <h3 className={`font-semibold ${style.titleColor}`}>{title}</h3>
        {message && <p className={`text-sm mt-1 ${style.messageColor}`}>{message}</p>}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
          aria-label="Fechar"
        >
          ✕
        </button>
      )}
    </div>
  );
}
