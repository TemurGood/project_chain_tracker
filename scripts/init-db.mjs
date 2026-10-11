import { createClient } from "@libsql/client";

// Вставь сюда свои данные из файла .env.local
const TURSO_DATABASE_URL = "libsql://chain-tracker-db-temurgood.aws-ap-northeast-1.turso.io";
const TURSO_AUTH_TOKEN = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3OTE3NDI3MjMsImlkIjoiMDFhMTJiNjUtZDgwMS03ODg0LThmNjktNzk0NWM0NjEyNmU3Iiwia2lkIjoiNU9veDdiYlU5LWNjdG5wQ0lZQ1BXRnU1em5RUEY2TzdidWdYSVhlRG9kOCIsInJpZCI6IjY5ODA5ZmM1LWExMGUtNDU0Yy1iMjQ5LTA3MmIyMzBjMDA0NCJ9.i70H4Xb7x94LDitAoinwgOOsRE8tqIMzzgrJPI0P52Uz2VzD-C3m-hRNcA5oNGq826iMZFXTfBqvwIyMMV31Cw"; // <-- ВСТАВЬ СЮДА СВОЙ ТОКЕН (начинается на eyJ...)

const client = createClient({
  url: TURSO_DATABASE_URL,
  authToken: TURSO_AUTH_TOKEN,
});

const sql = `
CREATE TABLE IF NOT EXISTS "Store" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "address" TEXT,
  "allocatedBudget" REAL NOT NULL DEFAULT 0.0,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "User" (
  "id" TEXT PRIMARY KEY,
  "email" TEXT NOT NULL UNIQUE,
  "name" TEXT NOT NULL,
  "role" TEXT NOT NULL DEFAULT 'STORE_MANAGER',
  "storeId" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS "Transaction" (
  "id" TEXT PRIMARY KEY,
  "storeId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "amount" REAL NOT NULL,
  "description" TEXT,
  "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "BudgetRequest" (
  "id" TEXT PRIMARY KEY,
  "storeId" TEXT NOT NULL,
  "requestedAmount" REAL NOT NULL,
  "reason" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE
);
`;

async function main() {
  console.log("🚀 Подключаемся к Turso...");
  try {
    // ИСПРАВЛЕНИЕ: используем executeMultiple для выполнения нескольких запросов сразу
    await client.executeMultiple(sql);
    console.log("✅ Таблицы успешно созданы в базе данных Turso!");
    
    const result = await client.execute("SELECT name FROM sqlite_master WHERE type='table';");
    console.log("📋 Список созданных таблиц:", result.rows.map(r => r.name).join(", "));
  } catch (error) {
    console.error("❌ Ошибка при создании таблиц:", error);
  } finally {
    client.close();
  }
}

main();