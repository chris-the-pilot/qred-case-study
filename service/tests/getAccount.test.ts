import { handler } from "../src/handlers/getAccount";
import { prismaMock } from "./mocks/prismaClient";
import { APIGatewayProxyResult } from "aws-lambda";
import { Decimal } from "@prisma/client/runtime/library";

const VALID_ACCOUNT = {
  account_id: "abc",
  company_id: "co1",
  region_code: "SE",
  currency_code: "SEK",
  credit_limit: new Decimal(1000),
  available_credit: new Decimal(500),
  statement_balance: new Decimal(100),
  cycle_start_day: 5,
  created_at: new Date(),
  created_by: "tester",
  updated_at: new Date(),
  updated_by: null,
  version: BigInt(1),
  is_deleted: false,
};

const invoke = async (id?: string) =>
  (await handler(
    buildEvent(id),
    {} as any,
    {} as any
  )) as APIGatewayProxyResult;

const buildEvent = (accountId?: string) =>
  ({
    pathParameters: accountId ? { accountId } : null,
  } as any);

describe("GET /account/:id handler", () => {
  beforeEach(() => prismaMock.card_account.findUnique.mockReset());

  afterAll(() => prismaMock.$disconnect());

  it("returns 400 when accountId is missing", async () => {
    const res = await invoke();
    expect(res.statusCode).toBe(400);
    expect(JSON.parse(res.body)).toMatchObject({
      message: /Missing accountId/,
    });
  });

  it("returns 404 when account not found", async () => {
    prismaMock.card_account.findUnique.mockResolvedValue(null);

    const res = await invoke("nope");
    expect(res.statusCode).toBe(404);
    expect(JSON.parse(res.body)).toMatchObject({
      message: /Account not found/,
    });
    expect(prismaMock.card_account.findUnique).toHaveBeenCalledWith({
      where: { account_id: "nope" },
      select: expect.any(Object),
    });
  });

  it("returns 200 with correctly mapped account data", async () => {
    prismaMock.card_account.findUnique.mockResolvedValue(VALID_ACCOUNT);

    const res = await invoke("abc");
    const body = JSON.parse(res.body);

    expect(res.statusCode).toBe(200);
    expect(body).toEqual({
      accountId: "abc",
      companyId: "co1",
      creditLimit: 1000,
      availableCredit: 500,
      statementBalance: 100,
      cycleStartDay: 5,
    });
    expect(prismaMock.card_account.findUnique).toHaveBeenCalledWith({
      where: { account_id: "abc" },
      select: expect.objectContaining({
        account_id: true,
        company_id: true,
        credit_limit: true,
        available_credit: true,
        statement_balance: true,
        cycle_start_day: true,
      }),
    });
  });

  it("returns 500 on Prisma errors", async () => {
    prismaMock.card_account.findUnique.mockRejectedValue(new Error("DB fail"));

    const res = await invoke("err");
    expect(res.statusCode).toBe(500);
    expect(JSON.parse(res.body)).toMatchObject({
      message: /Internal server error/,
    });
  });
});
