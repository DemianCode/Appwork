import { createContext, useContext } from 'react';
export const NavigationCtx = createContext<{ setSection: (id: string) => void }>({ setSection: () => {} });
export const useNavigation = () => useContext(NavigationCtx);
