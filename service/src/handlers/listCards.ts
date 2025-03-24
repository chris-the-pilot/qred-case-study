import { APIGatewayProxyHandler } from "aws-lambda";
import { PrismaClient } from "@prisma/client";
import { response } from "../utils/http";

const prisma = new PrismaClient();

export const handler: APIGatewayProxyHandler = async (event) => {
  const accountId = event.pathParameters?.accountId;
  if (!accountId) {
    return response(400, { message: "Missing accountId" });
  }

  try {
    const cards = await prisma.card.findMany({
      where: { account_id: accountId },
      select: {
        card_id: true,
        pan_last4: true,
        expiry_date: true,
        status: true,
        activated_at: true,
        blocked_at: true,
      },
    });

    return response(
      200,
      cards.map((c) => ({
        cardId: c.card_id,
        panLast4: c.pan_last4,
        expiryDate: c.expiry_date.toISOString().split("T")[0],
        status: c.status,
        activatedAt: c.activated_at,
        blockedAt: c.blocked_at,
      }))
    );
  } catch (err) {
    console.error("Error listing cards:", err);
    return response(500, { message: "Internal server error" });
  } finally {
    await prisma.$disconnect();
  }
};
