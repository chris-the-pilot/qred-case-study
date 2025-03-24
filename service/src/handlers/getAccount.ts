import { APIGatewayProxyHandler } from "aws-lambda";
import { PrismaClient, card_account } from "@prisma/client";
import { response } from "../utils/http";

const prisma = new PrismaClient();

export const handler: APIGatewayProxyHandler = async (event) => {
  const accountId = event.pathParameters?.accountId;
  if (!accountId) {
    return response(400, { message: "Missing accountId path parameter" });
  }

  try {
    const cardAccount = await fetchAccountById(accountId);

    if (!cardAccount) {
      return response(404, { message: "Account not found" });
    }

    return response(200, mapAccount(cardAccount));
  } catch (error) {
    console.error("Error fetching account:", error);
    return response(500, { message: "Internal server error" });
  } finally {
    await prisma.$disconnect();
  }
};

async function fetchAccountById(id: string): Promise<SelectedAccount | null> {
  return prisma.card_account.findUnique({
    where: { account_id: id },
    select: ACCOUNT_SELECT,
  });
}

const ACCOUNT_SELECT = {
  account_id: true,
  company_id: true,
  credit_limit: true,
  available_credit: true,
  statement_balance: true,
  cycle_start_day: true,
} as const;

type SelectedAccount = Pick<card_account, keyof typeof ACCOUNT_SELECT>;

const mapAccount = (acct: SelectedAccount) => ({
  accountId: acct.account_id,
  companyId: acct.company_id,
  creditLimit: Number(acct.credit_limit.toString()),
  availableCredit: Number(acct.available_credit.toString()),
  statementBalance: Number(acct.statement_balance.toString()),
  cycleStartDay: acct.cycle_start_day,
});
