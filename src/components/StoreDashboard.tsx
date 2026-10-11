"use client";

import React, { useEffect, useState } from "react";
import { useRole } from "@/context/RoleContext";
import { cn } from "@/lib/utils";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Plus,
  FileText,
  Package,
  Loader2,
} from "lucide-react";

interface Transaction {
  id: string;
  type: "INCOME" | "EXPENSE";
  category: string;
  amount: number;
  description: string | null;
  createdAt: string;
}

interface StoreData {
  id: string;
  name: string;
  allocatedBudget: number;
  income: number;
  expenses: number;
  profit: number;
}

export default function StoreDashboard() {
  const { currentUser } = useRole();
  const [storeData, setStoreData] = useState<StoreData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [showBudgetForm, setShowBudgetForm] = useState(false);

  // Форма транзакции
  const [txType, setTxType] = useState<"INCOME" | "EXPENSE">("INCOME");
  const [txCategory, setTxCategory] = useState("SALES");
  const [txAmount, setTxAmount] = useState("");
  const [txDescription, setTxDescription] = useState("");

  // Форма заявки на бюджет
  const [budgetAmount, setBudgetAmount] = useState("");
  const [budgetReason, setBudgetReason] = useState("");

  const categories = {
    INCOME: ["SALES", "OTHER"],
    EXPENSE: ["RENT", "SALARY", "SUPPLIES", "MARKETING", "OTHER"],
  };

  const categoryLabels: Record<string, string> = {
    SALES: "Продажи",
    RENT: "Аренда",
    SALARY: "Зарплата",
    SUPPLIES: "Расходники",
    MARKETING: "Маркетинг",
    OTHER: "Прочее",
  };

  const loadData = async () => {
    setLoading(true);
    try {
      // Получаем список магазинов
      const storesRes = await fetch("/api/stores");
      const stores = await storesRes.json();
      const myStore = stores.find((s: StoreData) => s.name === currentUser?.storeName);

      if (myStore) {
        setStoreData(myStore);

        // Получаем транзакции этого магазина
        const txRes = await fetch(`/api/transactions?storeId=${myStore.id}`);
        const txData = await txRes.json();
        setTransactions(txData);
      }
    } catch (error) {
      console.error("Ошибка загрузки данных:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.role === "STORE_MANAGER") {
      loadData();
    }
  }, [currentUser]);

  const handleCreateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeData || !txAmount) return;

    try {
      await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeId: storeData.id,
          type: txType,
          category: txCategory,
          amount: parseFloat(txAmount),
          description: txDescription,
        }),
      });

      // Сброс формы и перезагрузка данных
      setTxAmount("");
      setTxDescription("");
      setShowTransactionForm(false);
      loadData();
    } catch (error) {
      console.error("Ошибка создания транзакции:", error);
    }
  };

  const handleCreateBudgetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeData || !budgetAmount || !budgetReason) return;

    try {
      await fetch("/api/budget-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeId: storeData.id,
          requestedAmount: parseFloat(budgetAmount),
          reason: budgetReason,
        }),
      });

      setBudgetAmount("");
      setBudgetReason("");
      setShowBudgetForm(false);
      alert("✅ Заявка на бюджет отправлена!");
    } catch (error) {
      console.error("Ошибка создания заявки:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!storeData) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <p className="text-yellow-800">Магазин не найден. Обратитесь к администратору.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{storeData.name}</h1>
          <p className="text-gray-500 mt-1">Личный кабинет управляющего</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowTransactionForm(!showTransactionForm)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Транзакция
          </button>
          <button
            onClick={() => setShowBudgetForm(!showBudgetForm)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <FileText className="w-4 h-4" />
            Заявка на бюджет
          </button>
        </div>
      </div>

      {/* Карточки метрик */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Выделенный бюджет</span>
            <Package className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {storeData.allocatedBudget.toLocaleString()} ₽
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Доходы</span>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-green-600">
            +{storeData.income.toLocaleString()} ₽
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Расходы</span>
            <TrendingDown className="w-5 h-5 text-red-500" />
          </div>
          <p className="text-2xl font-bold text-red-600">
            -{storeData.expenses.toLocaleString()} ₽
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Чистая прибыль</span>
            <DollarSign className="w-5 h-5 text-blue-500" />
          </div>
          <p
            className={cn(
              "text-2xl font-bold",
              storeData.profit >= 0 ? "text-green-600" : "text-red-600"
            )}
          >
            {storeData.profit >= 0 ? "+" : ""}
            {storeData.profit.toLocaleString()} ₽
          </p>
        </div>
      </div>

      {/* Форма создания транзакции */}
      {showTransactionForm && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Новая транзакция</h3>
          <form onSubmit={handleCreateTransaction} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Тип
                </label>
                <select
                  value={txType}
                  onChange={(e) => {
                    setTxType(e.target.value as "INCOME" | "EXPENSE");
                    setTxCategory(categories[e.target.value as "INCOME" | "EXPENSE"][0]);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="INCOME">Доход</option>
                  <option value="EXPENSE">Расход</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Категория
                </label>
                <select
                  value={txCategory}
                  onChange={(e) => setTxCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {categories[txType].map((cat) => (
                    <option key={cat} value={cat}>
                      {categoryLabels[cat]}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Сумма (₽)
                </label>
                <input
                  type="number"
                  value={txAmount}
                  onChange={(e) => setTxAmount(e.target.value)}
                  required
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Описание
                </label>
                <input
                  type="text"
                  value={txDescription}
                  onChange={(e) => setTxDescription(e.target.value)}
                  placeholder="Необязательно"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Создать
              </button>
              <button
                type="button"
                onClick={() => setShowTransactionForm(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Отмена
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Форма заявки на бюджет */}
      {showBudgetForm && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Заявка на бюджет</h3>
          <form onSubmit={handleCreateBudgetRequest} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Запрашиваемая сумма (₽)
              </label>
              <input
                type="number"
                value={budgetAmount}
                onChange={(e) => setBudgetAmount(e.target.value)}
                required
                min="0"
                step="0.01"
                placeholder="0.00"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Обоснование
              </label>
              <textarea
                value={budgetReason}
                onChange={(e) => setBudgetReason(e.target.value)}
                required
                rows={3}
                placeholder="Опишите, на что будут использованы средства..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Отправить заявку
              </button>
              <button
                type="button"
                onClick={() => setShowBudgetForm(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Отмена
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Таблица транзакций */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">История операций</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Дата
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Тип
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Категория
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Описание
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Сумма
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    Операций пока нет
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(tx.createdAt).toLocaleDateString("ru-RU")}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                          tx.type === "INCOME"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        )}
                      >
                        {tx.type === "INCOME" ? "Доход" : "Расход"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {categoryLabels[tx.category] || tx.category}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {tx.description || "—"}
                    </td>
                    <td
                      className={cn(
                        "px-6 py-4 text-sm text-right font-semibold",
                        tx.type === "INCOME" ? "text-green-600" : "text-red-600"
                      )}
                    >
                      {tx.type === "INCOME" ? "+" : "-"}
                      {tx.amount.toLocaleString()} ₽
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}