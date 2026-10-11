import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const stores = await prisma.store.findMany({
      include: {
        transactions: true,
        budgetRequests: true,
      },
    });

    // Рассчитываем метрики для каждого магазина
    const storesWithMetrics = stores.map((store) => {
      const income = store.transactions
        .filter((t) => t.type === "INCOME")
        .reduce((sum, t) => sum + t.amount, 0);
      
      const expenses = store.transactions
        .filter((t) => t.type === "EXPENSE")
        .reduce((sum, t) => sum + t.amount, 0);
      
      const profit = income - expenses;
      const pendingRequests = store.budgetRequests.filter(
        (r) => r.status === "PENDING"
      ).length;

      return {
        id: store.id,
        name: store.name,
        address: store.address,
        allocatedBudget: store.allocatedBudget,
        income,
        expenses,
        profit,
        transactionCount: store.transactions.length,
        pendingRequests,
      };
    });

    return NextResponse.json(storesWithMetrics);
  } catch (error) {
    console.error("Error fetching stores:", error);
    return NextResponse.json(
      { error: "Failed to fetch stores" },
      { status: 500 }
    );
  }
}