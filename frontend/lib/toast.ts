/**
 * Toast utility para exibir notificações
 * Usa eventos customizados para comunicar com o componente Toast
 */

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

class ToastManager {
  private listeners: Set<(toast: ToastMessage) => void> = new Set();
  private toasts: Map<string, ToastMessage> = new Map();

  subscribe(listener: (toast: ToastMessage) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(toast: ToastMessage) {
    this.toasts.set(toast.id, toast);
    this.listeners.forEach((listener) => listener(toast));

    // Auto-remove after duration
    const duration = toast.duration || 3000;
    setTimeout(() => {
      this.toasts.delete(toast.id);
    }, duration);
  }

  success(title: string, message?: string, duration?: number) {
    this.notify({
      id: `${Date.now()}-${Math.random()}`,
      type: 'success',
      title,
      message,
      duration,
    });
  }

  error(title: string, message?: string, duration?: number) {
    this.notify({
      id: `${Date.now()}-${Math.random()}`,
      type: 'error',
      title,
      message,
      duration,
    });
  }

  warning(title: string, message?: string, duration?: number) {
    this.notify({
      id: `${Date.now()}-${Math.random()}`,
      type: 'warning',
      title,
      message,
      duration,
    });
  }

  info(title: string, message?: string, duration?: number) {
    this.notify({
      id: `${Date.now()}-${Math.random()}`,
      type: 'info',
      title,
      message,
      duration,
    });
  }
}

export const toastManager = new ToastManager();
