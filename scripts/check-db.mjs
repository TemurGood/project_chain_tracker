import { createClient } from "@libsql/client";

const TURSO_DATABASE_URL = "libsql://chain-tracker-db-temurgood.aws-ap-northeast-1.turso.io";
const TURSO_AUTH_TOKEN = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3OTE3NDI3MjMsImlkIjoiMDFhMTJiNjUtZDgwMS03ODg0LThmNjktNzk0NWM0NjEyNmU3Iiwia2lkIjoiNU9veDdiYlU5LWNjdG5wQ0lZQ1BXRnU1em5RUEY2TzdidWdYSVhlRG9kOCIsInJpZCI6IjY5ODA5ZmM1LWExMGUtNDU0Yy1iMjQ5LTA3MmIyMzBjMDA0NCJ9.i70H4Xb7x94LDitAoinwgOOsRE8tqIMzzgrJPI0P52Uz2VzD-C3m-hRNcA5oNGq826iMZFXTfBqvwIyMMV31Cw"; // <-- ВСТАВЬ СЮДА СВОЙ ТОКЕН

const client = createClient({
  url: TURSO_DATABASE_URL,
  authToken: TURSO_AUTH_TOKEN,
});

async function main() {
  try {
    const result = await client.execute("SELECT id, name, allocatedBudget FROM Store;");
    console.log("📋 Магазины в базе данных:", result.rows);
    if (result.rows.length === 0) {
      console.log("⚠️ База данных пуста! Seed не сработал.");
    }
  } catch (error) {
    console.error("❌ Ошибка:", error);
  } finally {
    client.close();
  }
}

main();