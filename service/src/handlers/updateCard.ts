import { APIGatewayProxyHandler } from "aws-lambda";
import { PrismaClient } from "@prisma/client";
import { response } from "../utils/http";

const prisma = new PrismaClient();

export const handler: APIGatewayProxyHandler = async (event) => {
  const cardId = event.pathParameters?.cardId;
  if (!cardId) return response(400, { message: "Missing cardId" });

  const { status } = JSON.parse(event.body || "{}");
  if (!status) return response(400, { message: "Missing status in body" });

  try {
    const updated = await prisma.card.update({
      where: { card_id: cardId },
      data: {
        status,
        updated_by: event.requestContext.authorizer?.jwt.claims.sub,
      },
      select: {
        card_id: true,
        pan_last4: true,
        expiry_date: true,
        status: true,
        activated_at: true,
        blocked_at: true,
      },
    });

    return response(200, {
      cardId: updated.card_id,
      panLast4: updated.pan_last4,
      expiryDate: updated.expiry_date.toISOString().split("T")[0],
      status: updated.status,
      activatedAt: updated.activated_at,
      blockedAt: updated.blocked_at,
    });
  } catch (err: any) {
    console.error("Error updating card:", err);
    if (err.code === "P2025") {
      return response(404, { message: "Card not found" });
    }
    return response(500, { message: "Internal server error" });
  } finally {
    await prisma.$disconnect();
  }
};
