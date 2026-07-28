import { createContext, useContext, useReducer } from 'react';
import type { ReactNode } from 'react';
import type { ParsedChat, FilterState } from '../types/chat';

interface ChatState {
  chat: ParsedChat | null;
  myName: string | null;
  filters: FilterState;
}

type ChatAction =
  | { type: 'SET_CHAT'; chat: ParsedChat; myName: string }
  | { type: 'CLEAR_CHAT' }
  | { type: 'SET_FILTER'; key: keyof FilterState; value: boolean };

const defaultFilters: FilterState = {
  onlyMine: false,
  onlyOther: false,
  mediaOnly: false,
  linksOnly: false,
  deletedOnly: false,
  systemOnly: false,
};

const initialState: ChatState = {
  chat: null,
  myName: null,
  filters: defaultFilters,
};

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'SET_CHAT':
      return { ...state, chat: action.chat, myName: action.myName };
    case 'CLEAR_CHAT':
      return { ...state, chat: null, myName: null, filters: defaultFilters };
    case 'SET_FILTER':
      return {
        ...state,
        filters: { ...state.filters, [action.key]: action.value },
      };
    default:
      return state;
  }
}

interface ChatContextType extends ChatState {
  setChat: (chat: ParsedChat, myName: string) => void;
  clearChat: () => void;
  setFilter: (key: keyof FilterState, value: boolean) => void;
}

const ChatContext = createContext<ChatContextType>({
  ...initialState,
  setChat: () => undefined,
  clearChat: () => undefined,
  setFilter: () => undefined,
});

export function useChat(): ChatContextType {
  return useContext(ChatContext);
}

export function ChatProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  const setChat = (chat: ParsedChat, myName: string) =>
    dispatch({ type: 'SET_CHAT', chat, myName });
  const clearChat = () => dispatch({ type: 'CLEAR_CHAT' });
  const setFilter = (key: keyof FilterState, value: boolean) =>
    dispatch({ type: 'SET_FILTER', key, value });

  return (
    <ChatContext.Provider value={{ ...state, setChat, clearChat, setFilter }}>
      {children}
    </ChatContext.Provider>
  );
}
