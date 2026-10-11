"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

export type UserRole = "ADMIN" | "STORE_MANAGER";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  storeId?: string;
  storeName?: string;
}

interface RoleContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const MOCK_USERS: User[] = [
  {
    id: "admin-1",
    email: "admin@chaintracker.com",
    name: "Главный Администратор",
    role: "ADMIN",
  },
  {
    id: "manager-1",
    email: "manager1@chaintracker.com",
    name: "Иван Петров",
    role: "STORE_MANAGER",
    storeId: "store-1",
    storeName: "Магазин Центр",
  },
  {
    id: "manager-2",
    email: "manager2@chaintracker.com",
    name: "Мария Сидорова",
    role: "STORE_MANAGER",
    storeId: "store-2",
    storeName: "Магазин Север",
  },
];

export function RoleProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(MOCK_USERS[0]);

  return (
    <RoleContext.Provider value={{ currentUser, setCurrentUser }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return context;
}