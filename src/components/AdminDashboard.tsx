"use client";

import React, { useEffect, useState } from "react";
import { useRole } from "@/context/RoleContext";
import { cn } from "@/lib/utils";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Store,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  AlertCircle,
} from "lucide-react";

interface StoreData {
  id: string;
  name: string;
  address: string | null;
  allocatedBudget: number;
  income: number;
  expenses: number;
  profit: number;
  transactionCount: number;
  pendingRequests: number;
}

interface BudgetRequest {
  id: string;
  storeId: string;
  requestedAmount: number;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  store: {
    name: string;
  };
}

export default function AdminDashboard() {
  const { currentUser } = useRole();
  const [stores, setStores] = useState<StoreData[]>([]);
  const [budgetRequests, setBudgetRequests] = useState<BudgetRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      // Загружаем магазины
      const storesRes = await fetch("/api/stores");
      const storesData = await storesRes.json();
      setStores(storesData);

      // Загружаем заявки на бюджет
      const requestsRes = await fetch("/api/budget-requests");
      const requestsData = await requestsRes.json();
      setBudgetRequests(requestsData);
    } catch (error) {
      console.error("Ошибка загрузки данных:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.role === "ADMIN") {
      loadData();
    }
  }, [currentUser]);

  const handleApproveRequest = async (requestId: string) => {
    try {
      await fetch("/api/budget-requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: requestId, status: "APPROVED" }),
      });
      loadData(); // Перезагружаем данные
    } catch (error) {
      console.error("Ошибка одобрения заявки:", error);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      await fetch("/api/budget-requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: requestId, status: "REJECTED" }),
      });
      loadData();
    } catch (error) {
      console.error("Ошибка отклонения заявки:", error);
    }
  };

  // Расчет общих метрик сети
  const totalIncome = stores.reduce((sum, s) => sum + s.income, 0);
  const totalExpenses = stores.reduce((sum, s) => sum + s.expenses, 0);
  const totalProfit = totalIncome - totalExpenses;
  const pendingRequestsCount = budgetRequests.filter((r) => r.status === "PENDING").length;

  // Сортировка магазинов по прибыли (от большей к меньшей)
  const sortedStores = [...stores].sort((a, b) => b.profit - a.profit);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Панель администратора</h1>
        <p className="text-gray-500 mt-1">Обзор по всей сети магазинов</p>
      </div>

      {/* Карточки общих метрик */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Общий доход сети</span>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-green-600">
            +{totalIncome.toLocaleString()} ₽
          </p>
          <p className="text-xs text-gray-400 mt-1">За все время</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Общие расходы</span>
            <TrendingDown className="w-5 h-5 text-red-500" />
          </div>
          <p className="text-2xl font-bold text-red-600">
            -{totalExpenses.toLocaleString()} ₽
          </p>
          <p className="text-xs text-gray-400 mt-1">За все время</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Чистая прибыль</span>
            <DollarSign className="w-5 h-5 text-blue-500" />
          </div>
          <p
            className={cn(
              "text-2xl font-bold",
              totalProfit >= 0 ? "text-green-600" : "text-red-600"
            )}
          >
            {totalProfit >= 0 ? "+" : ""}
            {totalProfit.toLocaleString()} ₽
          </p>
          <p className="text-xs text-gray-400 mt-1">По всей сети</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Заявки на рассмотрении</span>
            <Clock className="w-5 h-5 text-orange-500" />
          </div>
          <p className="text-2xl font-bold text-orange-600">
            {pendingRequestsCount}
          </p>
          <p className="text-xs text-gray-400 mt-1">Ожидают решения</p>
        </div>
      </div>

      {/* Рейтинг магазинов */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Store className="w-5 h-5" />
            Рейтинг магазинов
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Магазин
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Доход
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Расход
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Прибыль
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Бюджет
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Операций
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sortedStores.map((store, index) => (
                <tr key={store.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                        index === 0
                          ? "bg-yellow-100 text-yellow-700"
                          : index === 1
                          ? "bg-gray-100 text-gray-700"
                          : index === 2
                          ? "bg-orange-100 text-orange-700"
                          : "bg-gray-50 text-gray-500"
                      )}
                    >
                      {index + 1}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{store.name}</div>
                    <div className="text-sm text-gray-500">{store.address}</div>
                  </td>
                  <td className="px-6 py-4 text-right text-green-600 font-semibold">
                    +{store.income.toLocaleString()} ₽
                  </td>
                  <td className="px-6 py-4 text-right text-red-600 font-semibold">
                    -{store.expenses.toLocaleString()} ₽
                  </td>
                  <td
                    className={cn(
                      "px-6 py-4 text-right font-bold",
                      store.profit >= 0 ? "text-green-600" : "text-red-600"
                    )}
                  >
                    {store.profit >= 0 ? "+" : ""}
                    {store.profit.toLocaleString()} ₽
                  </td>
                  <td className="px-6 py-4 text-right text-gray-600">
                    {store.allocatedBudget.toLocaleString()} ₽
                  </td>
                  <td className="px-6 py-4 text-center text-gray-600">
                    {store.transactionCount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Заявки на бюджет */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Заявки на бюджет
          </h3>
        </div>
        <div className="divide-y divide-gray-200">
          {budgetRequests.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              Заявок пока нет
            </div>
          ) : (
            budgetRequests.map((request) => (
              <div key={request.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-gray-900">
                        {request.store.name}
                      </span>
                      <span
                        className={cn(
                          "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                          request.status === "PENDING" &&
                            "bg-yellow-100 text-yellow-800",
                          request.status === "APPROVED" &&
                            "bg-green-100 text-green-800",
                          request.status === "REJECTED" &&
                            "bg-red-100 text-red-800"
                        )}
                      >
                        {request.status === "PENDING" && "Ожидает"}
                        {request.status === "APPROVED" && "Одобрено"}
                        {request.status === "REJECTED" && "Отклонено"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{request.reason}</p>
                    <p className="text-lg font-bold text-gray-900">
                      {request.requestedAmount.toLocaleString()} ₽
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(request.createdAt).toLocaleDateString("ru-RU")}
                    </p>
                  </div>
                  {request.status === "PENDING" && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApproveRequest(request.id)}
                        className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Одобрить
                      </button>
                      <button
                        onClick={() => handleRejectRequest(request.id)}
                        className="flex items-center gap-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                      >
                        <XCircle className="w-4 h-4" />
                        Отклонить
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}