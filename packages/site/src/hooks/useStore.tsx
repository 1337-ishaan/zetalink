import { createContext, useState, useContext } from 'react';

import FlexColumnWrapper from '../components/utils/wrappers/FlexColumnWrapper';
import { getLocalStorage } from '../utils';

type StoreProviderProps = {
  children: React.ReactNode;
};

const StoreContext = createContext<any | undefined>(undefined);

export const useStore = () => {
  const context = useContext(StoreContext);

  if (context === undefined) {
    throw new Error('useStore must be used within a Provider');
  }
  return context;
};

const StoreProvider = ({ children }: StoreProviderProps) => {
  const persistState = JSON.parse(getLocalStorage('zeta-snap')!);
  const [globalState, setGlobalState] = useState(persistState || null);

  return (
    <StoreContext.Provider value={{ globalState, setGlobalState }}>
      <FlexColumnWrapper style={{ width: '100%' }}>
        {children}
      </FlexColumnWrapper>
    </StoreContext.Provider>
  );
};

export { StoreContext, StoreProvider };
