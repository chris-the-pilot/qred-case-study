import { mockDeep, DeepMockProxy } from "jest-mock-extended";
import type { PrismaClient as PrismaClientType } from "@prisma/client";

export const prismaMock =
  mockDeep<PrismaClientType>() as DeepMockProxy<PrismaClientType>;

export class PrismaClient {
  constructor() {
    return prismaMock;
  }
}

export default prismaMock;
