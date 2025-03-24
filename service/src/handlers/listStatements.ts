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
    const statements = await prisma.statement.findMany({
      where: { account_id: accountId },
      orderBy: { period_start: "desc" },
    });

    const payload = statements.map((s) => ({
      statementId: s.statement_id,
      periodStart: s.period_start.toISOString().split("T")[0],
      periodEnd: s.period_end.toISOString().split("T")[0],
      dueDate: s.due_date.toISOString().split("T")[0],
      totalDue: parseFloat(s.total_due_amount.toString()),
      minimumDue: parseFloat(s.minimum_due_amount.toString()),
      paidAmount: parseFloat(s.paid_amount.toString()),
    }));

    return response(200, payload);
  } catch (err) {
    console.error("Error listing statements:", err);
    return response(500, { message: "Internal server error" });
  } finally {
    await prisma.$disconnect();
  }
};
