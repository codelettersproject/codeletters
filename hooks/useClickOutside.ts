import { RefObject } from "react";
import { ssrSafeDocument } from "typesdk/ssr";

import { useEventListener } from "./useEventListener";


export function useClickOutside(ref: RefObject<HTMLElement | null>, callback: ((e: Event) => void)) {
  useEventListener("click", e => {
    if (ref.current == null || ref.current.contains(e.target as any)) return;
    callback(e);
  },
  ssrSafeDocument);
}

export default useClickOutside;
