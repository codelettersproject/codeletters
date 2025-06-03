import { useEffect, useRef } from "react";
import { ssrSafeWindow } from "typesdk/ssr";


export function useEventListener<K extends keyof HTMLElementEventMap>(event: K, callback: ((event: HTMLElementEventMap[K]) => void), element: HTMLElement | Document | Window | undefined = ssrSafeWindow) {
  if(!element) return;

  const callbackRef = useRef<((__event: HTMLElementEventMap[K]) => unknown)>(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if(!element || element == null) return;

    const handler = (e: Event) => callbackRef.current(e as any);
    element.addEventListener(event, handler);

    return () => {
      element.removeEventListener(event, handler);
    };
  }, [event, element]);
}

export default useEventListener;
