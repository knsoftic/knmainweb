"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';

/**
 * Admin feedback: toast messages and a confirm dialog, replacing the browser's alert() and
 * confirm() pop-ups. Both are called as plain functions from anywhere:
 *
 *   notify('Saved successfully');            // styled toast, top right
 *   if (!(await confirmAction('Delete?')))   // styled dialog, resolves true / false
 *
 * `<AdminFeedback />` renders them and is mounted once by AdminShell.
 */

export type ToastTone = 'success' | 'error' | 'info';
type Toast = { id: number; message: string; tone: ToastTone };
type ConfirmRequest = { id: number; message: string; resolve: (value: boolean) => void };

const listeners = new Set<() => void>();
let toasts: Toast[] = [];
let confirmRequest: ConfirmRequest | null = null;
let nextId = 1;

const emit = () => listeners.forEach((listener) => listener());
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
};
const snapshot = () => ({ toasts, confirmRequest });
let cached = snapshot();
const getSnapshot = () => {
  if (cached.toasts !== toasts || cached.confirmRequest !== confirmRequest) cached = snapshot();
  return cached;
};

const dismiss = (id: number) => {
  toasts = toasts.filter((toast) => toast.id !== id);
  emit();
};

/** Messages that report a problem, so a plain notify() call still looks right. */
const FAILURE = /\b(fail|failed|error|unable|cannot|can't|invalid|required|must|no longer|not found|denied|wrong|too many)\b/i;
const WARNING = /^(please|pick|select|maximum|minimum|enter|choose|this post|site url)/i;

export function notify(message: string, tone?: ToastTone) {
  const text = String(message || '').trim();
  if (!text) return;
  const resolved: ToastTone = tone || (FAILURE.test(text) ? 'error' : WARNING.test(text) ? 'info' : 'success');
  const toast: Toast = { id: nextId++, message: text, tone: resolved };
  toasts = [...toasts, toast];
  emit();
  setTimeout(() => dismiss(toast.id), resolved === 'error' ? 7000 : 4500);
}

notify.success = (message: string) => notify(message, 'success');
notify.error = (message: string) => notify(message, 'error');
notify.info = (message: string) => notify(message, 'info');

/** Asks the question in a styled dialog; resolves true when confirmed. */
export function confirmAction(message: string): Promise<boolean> {
  return new Promise((resolve) => {
    confirmRequest = { id: nextId++, message, resolve };
    emit();
  });
}

const TONE_ICON: Record<ToastTone, string> = {
  success: 'fa-check-circle',
  error: 'fa-exclamation-circle',
  info: 'fa-info-circle',
};

export function AdminFeedback() {
  const { toasts: items, confirmRequest: request } = useSyncExternalStore(subscribe, getSnapshot, () => cached);
  const confirmButton = useRef<HTMLButtonElement>(null);
  const [closing, setClosing] = useState(false);

  const answer = useCallback((value: boolean) => {
    if (!confirmRequest) return;
    const { resolve } = confirmRequest;
    confirmRequest = null;
    emit();
    setClosing(false);
    resolve(value);
  }, []);

  useEffect(() => {
    if (!request) return;
    confirmButton.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') answer(false);
      if (event.key === 'Enter') answer(true);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [request, answer]);

  return (
    <>
      <div className="ks-toasts" role="status" aria-live="polite">
        {items.map((toast) => (
          <div key={toast.id} className={`ks-toast ks-toast--${toast.tone}`}>
            <i className={`fa ${TONE_ICON[toast.tone]}`} aria-hidden="true"></i>
            <span>{toast.message}</span>
            <button type="button" onClick={() => dismiss(toast.id)} aria-label="Dismiss">
              <i className="fa fa-times" aria-hidden="true"></i>
            </button>
          </div>
        ))}
      </div>

      {request && (
        <div className={`ks-dialog${closing ? ' is-closing' : ''}`} role="dialog" aria-modal="true" aria-labelledby="ks-dialog-message">
          <div className="ks-dialog__backdrop" onClick={() => answer(false)}></div>
          <div className="ks-dialog__box">
            <span className="ks-dialog__icon" aria-hidden="true"><i className="fa fa-exclamation-triangle"></i></span>
            <p className="ks-dialog__message" id="ks-dialog-message">{request.message}</p>
            <div className="ks-dialog__actions">
              <button type="button" className="ks-dialog__btn" onClick={() => answer(false)}>Cancel</button>
              <button type="button" className="ks-dialog__btn ks-dialog__btn--confirm" ref={confirmButton} onClick={() => answer(true)}>
                Yes, continue
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
