import { useEffect } from 'react';

type LoadOptions = {
  /** Called if `load` rejects. Defaults to logging the error. */
  onError?: (error: unknown) => void;
  /** Called after `apply`/`onError`, e.g. to clear a loading flag. */
  onSettled?: () => void;
};

/**
 * Loads data once when a component mounts. `load` fetches; `apply` stores the result. State is only
 * set from the promise callbacks — never synchronously inside the effect — and nothing runs if the
 * component unmounted before the request finished.
 */
export function useLoadOnMount<T>(load: () => Promise<T>, apply: (data: T) => void, options: LoadOptions = {}) {
  useEffect(() => {
    let active = true;
    const { onError = console.error, onSettled } = options;

    load()
      .then((data) => {
        if (active) apply(data);
      })
      .catch((error) => {
        if (active) onError(error);
      })
      .finally(() => {
        if (active) onSettled?.();
      });

    return () => {
      active = false;
    };
    // Mount-only by design: uses the functions from the first render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
