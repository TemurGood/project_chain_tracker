"use client";

import React, { useState } from "react";
import { useRole, MOCK_USERS } from "@/context/RoleContext";
import { cn } from "@/lib/utils";
import { ChevronDown, User, LogOut } from "lucide-react";

export default function Header() {
  const { currentUser, setCurrentUser } = useRole();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleUserSwitch = (userId: string) => {
    const selectedUser = MOCK_USERS.find((u) => u.id === userId);
    if (selectedUser) {
      setCurrentUser(selectedUser);
      setIsDropdownOpen(false);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Логотип и название */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">CT</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">ChainTracker</h1>
              <p className="text-xs text-gray-500">Система управления сетью</p>
            </div>
          </div>

          {/* Переключатель пользователей */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={cn(
                "flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all",
                isDropdownOpen
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300 hover:border-gray-400"
              )}
            >
              <User className="w-5 h-5 text-gray-600" />
              <div className="text-left">
                <div className="text-sm font-medium text-gray-900">
                  {currentUser?.name}
                </div>
                <div className="text-xs text-gray-500">
                  {currentUser?.role === "ADMIN"
                    ? "Администратор"
                    : currentUser?.storeName}
                </div>
              </div>
              <ChevronDown
                className={cn(
                  "w-4 h-4 text-gray-400 transition-transform",
                  isDropdownOpen && "rotate-180"
                )}
              />
            </button>

            {/* Выпадающее меню */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 uppercase">
                    Переключить пользователя
                  </p>
                </div>
                {MOCK_USERS.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => handleUserSwitch(user.id)}
                    className={cn(
                      "w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors",
                      currentUser?.id === user.id && "bg-blue-50"
                    )}
                  >
                    <div className="flex items-start space-x-3">
                      <div
                        className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                          user.role === "ADMIN"
                            ? "bg-purple-100 text-purple-600"
                            : "bg-blue-100 text-blue-600"
                        )}
                      >
                        <User className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900">
                          {user.name}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {user.email}
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">
                          {user.role === "ADMIN"
                            ? "👑 Администратор"
                            : `🏪 ${user.storeName}`}
                        </div>
                      </div>
                      {currentUser?.id === user.id && (
                        <div className="text-blue-600 text-xs font-medium">
                          Активен
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}