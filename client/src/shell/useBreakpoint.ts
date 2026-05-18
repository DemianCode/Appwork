import { useEffect, useState } from 'react';
export function useBreakpoint(threshold = 700): boolean {
  const [mobile, setMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < threshold);
  useEffect(() => {
    const handler = () => setMobile(window.innerWidth < threshold);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, [threshold]);
  return mobile;
}
