import { PrismaClient } from '@prisma/client';
import { createClient } from "@libsql/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";

// 1. Настраиваем адаптер Turso, чтобы seed писал данные в облако!
const libsql = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});
const adapter = new PrismaLibSQL(libsql);

// 2. Создаем клиент Prisma с этим адаптером
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Начинаем наполнение базы данных в Turso...');

  // Очистка существующих данных (в обратном порядке связей)
  await prisma.budgetRequest.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.user.deleteMany();
  await prisma.store.deleteMany();

  // 1. Создание торговых точек
  const store1 = await prisma.store.create({
    data: {
      name: 'Магазин Центр',
      address: 'ул. Ленина, 1',
      allocatedBudget: 50000,
    },
  });

  const store2 = await prisma.store.create({
    data: {
      name: 'Магазин Север',
      address: 'ул. Гагарина, 15',
      allocatedBudget: 30000,
    },
  });

  console.log('✅ Созданы торговые точки:', store1.name, store2.name);

  // 2. Создание пользователей
  const admin = await prisma.user.create({
    data: {
      email: 'admin@chaintracker.com',
      name: 'Главный Администратор',
      role: 'ADMIN',
    },
  });

  const manager1 = await prisma.user.create({
    data: {
      email: 'manager1@chaintracker.com',
      name: 'Иван Петров',
      role: 'STORE_MANAGER',
      storeId: store1.id,
    },
  });

  const manager2 = await prisma.user.create({
    data: {
      email: 'manager2@chaintracker.com',
      name: 'Мария Сидорова',
      role: 'STORE_MANAGER',
      storeId: store2.id,
    },
  });

  console.log('✅ Созданы пользователи:', admin.name, manager1.name, manager2.name);

  // 3. Создание транзакций для Магазина Центр
  await prisma.transaction.createMany({
    data: [
      { storeId: store1.id, type: 'INCOME', category: 'SALES', amount: 15000, description: 'Продажа товаров за неделю' },
      { storeId: store1.id, type: 'INCOME', category: 'SALES', amount: 8500, description: 'Продажа электроники' },
      { storeId: store1.id, type: 'EXPENSE', category: 'RENT', amount: 5000, description: 'Аренда помещения' },
      { storeId: store1.id, type: 'EXPENSE', category: 'SALARY', amount: 12000, description: 'Зарплата персонала' },
      { storeId: store1.id, type: 'EXPENSE', category: 'SUPPLIES', amount: 3000, description: 'Закупка расходных материалов' },
    ],
  });

  // 4. Создание транзакций для Магазина Север
  await prisma.transaction.createMany({
    data: [
      { storeId: store2.id, type: 'INCOME', category: 'SALES', amount: 12000, description: 'Продажа товаров за неделю' },
      { storeId: store2.id, type: 'INCOME', category: 'SALES', amount: 6000, description: 'Продажа одежды' },
      { storeId: store2.id, type: 'EXPENSE', category: 'RENT', amount: 4000, description: 'Аренда помещения' },
      { storeId: store2.id, type: 'EXPENSE', category: 'MARKETING', amount: 2500, description: 'Рекламная кампания' },
    ],
  });

  console.log('✅ Созданы транзакции для обоих магазинов');

  // 5. Создание заявок на бюджет
  await prisma.budgetRequest.createMany({
    data: [
      { storeId: store1.id, requestedAmount: 20000, reason: 'Расширение ассортимента электроники', status: 'PENDING' },
      { storeId: store2.id, requestedAmount: 15000, reason: 'Обновление торгового оборудования', status: 'APPROVED' },
    ],
  });

  console.log('✅ Созданы заявки на бюджет');
  console.log('🎉 База данных Turso успешно наполнена тестовыми данными!');
}

main()
  .catch((e) => {
    console.error('❌ Ошибка при наполнении БД:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });