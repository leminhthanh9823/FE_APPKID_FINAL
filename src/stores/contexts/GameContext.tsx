import { createContext, useContext, useReducer, ReactNode } from 'react';
import { Game, GameState, GameStatus } from '../../types/game';

// Action types
type GameAction =
  | { type: 'SET_GAMES'; payload: Game[] }
  | { type: 'SELECT_GAME'; payload: Game }
  | { type: 'UPDATE_GAME'; payload: Game }
  | { type: 'DELETE_GAME'; payload: number }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

// Initial state
const initialState: GameState = {
  games: [],
  selectedGame: null,
  loading: false,
  error: null,
};

// Reducer
const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'SET_GAMES':
      return {
        ...state,
        games: action.payload,
        loading: false,
      };
    case 'SELECT_GAME':
      return {
        ...state,
        selectedGame: action.payload,
      };
    case 'UPDATE_GAME':
      return {
        ...state,
        games: state.games.map((game) =>
          game.id === action.payload.id ? action.payload : game
        ),
      };
    case 'DELETE_GAME':
      return {
        ...state,
        games: state.games.filter((game) => game.id !== action.payload),
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    default:
      return state;
  }
};

// Context
const GameContext = createContext<{
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
} | null>(null);

// Provider component
export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
};

// Custom hook to use the game context
export const useGameContext = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGameContext must be used within a GameProvider');
  }
  return context;
};