import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Получение заявок на бюджет (с опциональной фильтрацией по storeId и status)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get("storeId");
    const status = searchParams.get("status");

    const where: any = {};
    if (storeId) where.storeId = storeId;
    if (status) where.status = status;

    const requests = await prisma.budgetRequest.findMany({
      where,
      include: {
        store: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(requests);
  } catch (error) {
    console.error("Error fetching budget requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch budget requests" },
      { status: 500 }
    );
  }
}

// POST: Создание новой заявки на бюджет
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { storeId, requestedAmount, reason } = body;

    if (!storeId || !requestedAmount || !reason) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const budgetRequest = await prisma.budgetRequest.create({
      data: {
        storeId,
        requestedAmount: parseFloat(requestedAmount),
        reason,
        status: "PENDING",
      },
    });

    return NextResponse.json(budgetRequest, { status: 201 });
  } catch (error) {
    console.error("Error creating budget request:", error);
    return NextResponse.json(
      { error: "Failed to create budget request" },
      { status: 500 }
    );
  }
}

// PATCH: Обновление статуса заявки (одобрение/отклонение)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Если заявка одобрена, увеличиваем бюджет магазина
    if (status === "APPROVED") {
      const request = await prisma.budgetRequest.findUnique({
        where: { id },
      });

      if (!request) {
        return NextResponse.json(
          { error: "Budget request not found" },
          { status: 404 }
        );
      }

      // Обновляем статус заявки и увеличиваем бюджет магазина
      await prisma.$transaction([
        prisma.budgetRequest.update({
          where: { id },
          data: { status },
        }),
        prisma.store.update({
          where: { id: request.storeId },
          data: {
            allocatedBudget: {
              increment: request.requestedAmount,
            },
          },
        }),
      ]);
    } else {
      // Просто обновляем статус
      await prisma.budgetRequest.update({
        where: { id },
        data: { status },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating budget request:", error);
    return NextResponse.json(
      { error: "Failed to update budget request" },
      { status: 500 }
    );
  }
}