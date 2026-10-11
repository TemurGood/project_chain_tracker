"use client";

import { useRole } from "@/context/RoleContext";
import AdminDashboard from "@/components/AdminDashboard";
import StoreDashboard from "@/components/StoreDashboard";

export default function Home() {
  const { currentUser } = useRole();

  if (!currentUser) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
          <p className="text-yellow-800 text-lg">Пользователь не выбран.</p>
          <p className="text-yellow-600 mt-2">
            Используйте переключатель в правом верхнем углу.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {currentUser.role === "ADMIN" ? <AdminDashboard /> : <StoreDashboard />}
    </div>
  );
}