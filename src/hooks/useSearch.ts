import { useCallback, useEffect, useReducer } from 'react';
import { searchMessages } from '../utils/search';
import type { ChatMessage } from '../types/chat';

interface SearchState {
  query: string;
  results: number[];
  currentIndex: number;
  isOpen: boolean;
}

type SearchAction =
  | { type: 'OPEN' }
  | { type: 'CLOSE' }
  | { type: 'SET_QUERY'; query: string; messages: ChatMessage[] }
  | { type: 'NEXT' }
  | { type: 'PREV' };

function searchReducer(state: SearchState, action: SearchAction): SearchState {
  switch (action.type) {
    case 'OPEN':
      return { ...state, isOpen: true };
    case 'CLOSE':
      return { ...state, isOpen: false, query: '', results: [], currentIndex: 0 };
    case 'SET_QUERY': {
      const { matchIndices } = searchMessages(action.messages, action.query);
      return {
        ...state,
        query: action.query,
        results: matchIndices,
        currentIndex: 0,
      };
    }
    case 'NEXT':
      return {
        ...state,
        currentIndex:
          state.results.length > 0
            ? (state.currentIndex + 1) % state.results.length
            : 0,
      };
    case 'PREV':
      return {
        ...state,
        currentIndex:
          state.results.length > 0
            ? (state.currentIndex - 1 + state.results.length) % state.results.length
            : 0,
      };
    default:
      return state;
  }
}

const initial: SearchState = {
  query: '',
  results: [],
  currentIndex: 0,
  isOpen: false,
};

export interface UseSearchReturn {
  searchState: SearchState;
  openSearch: () => void;
  closeSearch: () => void;
  setQuery: (q: string, messages: ChatMessage[]) => void;
  goNext: () => void;
  goPrev: () => void;
  currentMatchIndex: number | null;
}

export function useSearch(): UseSearchReturn {
  const [searchState, dispatch] = useReducer(searchReducer, initial);

  const openSearch = useCallback(() => dispatch({ type: 'OPEN' }), []);
  const closeSearch = useCallback(() => dispatch({ type: 'CLOSE' }), []);
  const setQuery = useCallback(
    (q: string, messages: ChatMessage[]) =>
      dispatch({ type: 'SET_QUERY', query: q, messages }),
    []
  );
  const goNext = useCallback(() => dispatch({ type: 'NEXT' }), []);
  const goPrev = useCallback(() => dispatch({ type: 'PREV' }), []);

  // Ctrl+F / Escape global shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        openSearch();
      }
      if (e.key === 'Escape') {
        closeSearch();
      }
      if (e.key === 'ArrowDown' && searchState.isOpen) {
        e.preventDefault();
        goNext();
      }
      if (e.key === 'ArrowUp' && searchState.isOpen) {
        e.preventDefault();
        goPrev();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [openSearch, closeSearch, goNext, goPrev, searchState.isOpen]);

  const currentMatchIndex =
    searchState.results.length > 0
      ? searchState.results[searchState.currentIndex]
      : null;

  return {
    searchState,
    openSearch,
    closeSearch,
    setQuery,
    goNext,
    goPrev,
    currentMatchIndex,
  };
}
