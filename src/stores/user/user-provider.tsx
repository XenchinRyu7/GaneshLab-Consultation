"use client";

import { createContext, useContext, useRef } from "react";
import { useStore, type StoreApi } from "zustand";

import { createUserStore, type UserState } from "./user-store";

const UserStoreContext = createContext<StoreApi<UserState> | null>(null);

export const UserStoreProvider = ({
  children,
  initialUser,
}: {
  children: React.ReactNode;
  initialUser?: UserState["currentUser"];
}) => {
  const storeRef = useRef<StoreApi<UserState> | null>(null);
  storeRef.current ??= createUserStore({ currentUser: initialUser });

  return (
    <UserStoreContext.Provider value={storeRef.current}>{children}</UserStoreContext.Provider>
  );
};

export const useUserStore = <T,>(selector: (state: UserState) => T): T => {
  const store = useContext(UserStoreContext);
  if (!store) throw new Error("Missing UserStoreProvider");
  return useStore(store, selector);
};

