import { createContext, useContext, useReducer, useMemo } from 'react';

const UIContext = createContext();

const initialState = {
  vibeLevel: 5,
  isAuthenticated: false,
  userData: null,
  isAuthModalOpen: false,
  notifications: [],
  unreadCount: 0,
};

function uiReducer(state, action) {
  switch (action.type) {
    case 'SET_VIBE':
      return { ...state, vibeLevel: action.payload };
    case 'SET_AUTH':
      return { 
        ...state, 
        isAuthenticated: action.payload.isAuthenticated,
        userData: action.payload.user 
      };
    case 'SET_AUTH_MODAL':
      return { ...state, isAuthModalOpen: action.payload };
    case 'SET_NOTIFICATIONS':
      return { 
        ...state, 
        notifications: action.payload.list,
        unreadCount: action.payload.count 
      };
    case 'MARK_READ':
      return {
        ...state,
        notifications: state.notifications.map(n => n.id === action.payload ? { ...n, isRead: true } : n),
        unreadCount: Math.max(0, state.unreadCount - 1)
      };
    case 'LOGOUT':
      return { ...state, isAuthenticated: false, userData: null };
    default:
      return state;
  }
}

export function UIProvider({ children }) {
  const [state, dispatch] = useReducer(uiReducer, initialState);

  // Memoize the value to prevent unnecessary re-renders of consumers
  const value = useMemo(() => ({ state, dispatch }), [state]);

  return (
    <UIContext.Provider value={value}>
      {children}
    </UIContext.Provider>
  );
}

export function useUI() {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
}
