import { APIGatewayProxyHandler } from "aws-lambda";
import { PrismaClient, card_account } from "@prisma/client";
import { response } from "../utils/http";

const prisma = new PrismaClient();

async function fetchAllAccounts(): Promise<SelectedAccount[]> {
  return prisma.card_account.findMany({ select: ACCOUNT_SELECT });
}

export const handler: APIGatewayProxyHandler = async () => {
  try {
    const accounts = await fetchAllAccounts();
    return response(200, accounts.map(mapAccount));
  } catch (error) {
    console.error("Error listing accounts:", error);
    return response(500, { message: "Internal server error" });
  } finally {
    await prisma.$disconnect();
  }
};

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
