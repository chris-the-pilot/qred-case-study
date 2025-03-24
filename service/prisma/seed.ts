import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

async function main() {
  // Reference data
  const systemUser = "00000000-0000-0000-0000-000000000000";

  await prisma.currency.createMany({
    data: [
      {
        currency_code: "SEK",
        symbol: "kr",
        decimal_places: 2,
        created_by: systemUser,
      },
      {
        currency_code: "EUR",
        symbol: "€",
        decimal_places: 2,
        created_by: systemUser,
      },
    ],
    skipDuplicates: true,
  });

  await prisma.region.createMany({
    data: [
      {
        region_code: "SE",
        name: "Sweden",
        timezone: "Europe/Stockholm",
        locale: "sv_SE",
        default_currency_code: "SEK",
        created_by: systemUser,
      },
      {
        region_code: "FI",
        name: "Finland",
        timezone: "Europe/Helsinki",
        locale: "fi_FI",
        default_currency_code: "EUR",
        created_by: systemUser,
      },
    ],
    skipDuplicates: true,
  });

  // Demo account + card + statement
  const account = await prisma.card_account.upsert({
    where: { account_id: "c9b1d6e2-3f4a-4a6d-b111-2a7c4e8f1234" },
    update: {},
    create: {
      account_id: "c9b1d6e2-3f4a-4a6d-b111-2a7c4e8f1234",
      company_id: "11111111-2222-3333-4444-555555555555",
      region_code: "SE",
      currency_code: "SEK",
      credit_limit: 50000,
      available_credit: 35000,
      statement_balance: 15000,
      cycle_start_day: 5,
      created_by: faker.string.uuid(),
    },
  });

  const card = await prisma.card.upsert({
    where: { card_id: "f47ac10b-58cc-4372-a567-0e02b2c3d479" },
    update: {},
    create: {
      card_id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
      account_id: account.account_id,
      pan_token: faker.finance.creditCardCVV(),
      pan_last4: faker.finance.creditCardNumber().slice(-4),
      expiry_date: faker.date.future(),
      status: "active",
      activated_at: new Date(),
      created_by: faker.string.uuid(),
    },
  });

  const statement = await prisma.statement.upsert({
    where: { statement_id: "b12cd34e-56fa-789a-ab01-cdef23456789" },
    update: {},
    create: {
      statement_id: "b12cd34e-56fa-789a-ab01-cdef23456789",
      account_id: account.account_id,
      period_start: new Date("2024-05-05"),
      period_end: new Date("2024-06-04"),
      currency_code: "SEK",
      total_due_amount: 15000,
      minimum_due_amount: 1000,
      due_date: new Date("2024-06-25"),
      created_by: faker.string.uuid(),
    },
  });

  // Generate 50 random transactions
  const transactions = Array.from({ length: 50 }).map(() => ({
    transaction_id: faker.string.uuid(),
    card_id: card.card_id,
    posted_at: statement.period_end,
    amount: parseFloat(faker.finance.amount({ min: 10, max: 2000, dec: 2 })),
    currency_code: "SEK",
    exchange_rate: 1,
    fx_rate_date: statement.period_end,
    merchant_name: faker.company.name(),
    category: faker.commerce.department(),
    status: faker.helpers.arrayElement(["posted", "pending"]),
    created_by: faker.string.uuid(),
  }));

  await prisma.transaction.createMany({
    data: transactions,
    skipDuplicates: true,
  });

  console.log("✅ Seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
