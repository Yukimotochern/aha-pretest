import { useEffect, useRef, JSX } from 'react';

export const WithDidMountAction = ({
  children,
  action,
}: {
  action: () => unknown;
  children: JSX.Element;
}) => {
  const effectTriggered = useRef(false);
  useEffect(() => {
    /**
     * React 18 will trigger effect twice in dev mode.
     * This may not make sense in some cases.
     */
    if (!effectTriggered.current) {
      action();
      effectTriggered.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return children;
};
