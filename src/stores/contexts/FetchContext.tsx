import { createContext, useContext } from "react";

interface FetchContextProps {
  fetchData: () => void;
}

export const FetchContext = createContext<FetchContextProps | undefined>(undefined);

export const useFetchContext = () => {
  const context = useContext(FetchContext);
  if (!context) {
    throw new Error("useFetchContext phải được sử dụng bên trong FetchProvider");
  }
  return context;
};
