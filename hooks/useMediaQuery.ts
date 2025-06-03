import { useState, useEffect } from "react";


export function useMediaQuery(query: string): boolean {
  const [isMatch, setIsMatch] = useState<boolean>(false);
  const [mediaQueryList, setMediaQueryList] = useState<MediaQueryList | null>(null);

  useEffect(() => {
    const list = window.matchMedia(query);
    setMediaQueryList(list);
    setIsMatch(list.matches);
  }, [query]);

  mediaQueryList?.addEventListener("change", e => setIsMatch(e.matches));
  return isMatch;
}

export default useMediaQuery;
