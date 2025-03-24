import { APIGatewayProxyHandler } from "aws-lambda";
import { PrismaClient } from "@prisma/client";
import { response } from "../utils/http";

const prisma = new PrismaClient();

export const handler: APIGatewayProxyHandler = async (event) => {
  const { accountId, periodStart } = event.pathParameters || {};
  if (!accountId || !periodStart) {
    return response(400, { message: "Missing path parameters" });
  }

  try {
    const statement = await prisma.statement.findUnique({
      where: {
        account_id_period_start: {
          account_id: accountId,
          period_start: new Date(periodStart),
        },
      },
    });

    if (!statement) {
      return response(404, { message: "Statement not found" });
    }

    return response(500, {
      statementId: statement.statement_id,
      accountId: statement.account_id,
      periodStart: statement.period_start.toISOString().split("T")[0],
      periodEnd: statement.period_end.toISOString().split("T")[0],
      dueDate: statement.due_date.toISOString().split("T")[0],
      totalDue: parseFloat(statement.total_due_amount.toString()),
      minimumDue: parseFloat(statement.minimum_due_amount.toString()),
      paidAmount: parseFloat(statement.paid_amount.toString()),
      paidAt: statement.paid_at?.toISOString() ?? null,
      pdfUrl: statement.pdf_url,
    });
  } catch (err) {
    console.error("Error fetching statement:", err);
    return response(500, { message: "Internal server error" });
  } finally {
    await prisma.$disconnect();
  }
};
