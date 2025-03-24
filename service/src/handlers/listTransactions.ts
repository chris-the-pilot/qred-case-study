import { APIGatewayProxyHandler } from "aws-lambda";
import { PrismaClient } from "@prisma/client";
import { response } from "../utils/http";

const prisma = new PrismaClient();
const DEFAULT_LIMIT = 20;

function encodeCursor(id: string) {
  return Buffer.from(id).toString("base64");
}

function decodeCursor(cursor: string) {
  return Buffer.from(cursor, "base64").toString("utf-8");
}

export const handler: APIGatewayProxyHandler = async (event) => {
  const { cardId } = event.pathParameters!;
  const limit =
    parseInt(event.queryStringParameters?.limit ?? "") || DEFAULT_LIMIT;
  const cursor = event.queryStringParameters?.cursor;

  try {
    const where = { card_id: cardId } as any;

    const txns = await prisma.transaction.findMany({
      where,
      orderBy: { transaction_id: "desc" },
      take: limit + 1,
      ...(cursor && {
        cursor: { transaction_id: decodeCursor(cursor) },
        skip: 1,
      }),
    });

    let nextCursor = null;
    if (txns.length > limit) {
      const last = txns.pop()!;
      nextCursor = encodeCursor(last.transaction_id);
    }

    const transactions = txns.map((t) => ({
      transactionId: t.transaction_id,
      postedAt: t.posted_at,
      amount: parseFloat(t.amount.toString()),
      currency: t.currency_code,
      merchantName: t.merchant_name,
      category: t.category,
      status: t.status,
    }));

    return response(200, { cardId, nextCursor, transactions });
  } catch (err) {
    console.error("Error listing transactions:", err);
    return response(500, { message: "Internal server error" });
  } finally {
    await prisma.$disconnect();
  }
};
