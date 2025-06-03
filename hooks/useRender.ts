import React, { useEffect, useRef } from "react";


export function useRender(callback: () => void, dependencies?: React.DependencyList): void {
  const renderedRef = useRef<boolean>(false);

  useEffect(() => {
    if(renderedRef.current)
      return;

    callback();
    renderedRef.current = true;
  }, dependencies);
}

export default useRender;
