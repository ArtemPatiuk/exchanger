-- CreateEnum
CREATE TYPE "ExchangeStatus" AS ENUM ('PENDING', 'WAITING_PAYMENT', 'PAID', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "asset" (
    "id" TEXT NOT NULL,
    "coin" TEXT NOT NULL,
    "network" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "withdrawFee" DOUBLE PRECISION NOT NULL,
    "withdrawMin" DOUBLE PRECISION NOT NULL,
    "depositDust" DOUBLE PRECISION NOT NULL,
    "networkSignature" TEXT NOT NULL,
    "imageUrl" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "asset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExchangeRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "assetFromId" TEXT,
    "assetToId" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "commission" DOUBLE PRECISION NOT NULL,
    "exchangeRate" DOUBLE PRECISION NOT NULL,
    "totalSum" DOUBLE PRECISION NOT NULL,
    "depositAddress" TEXT NOT NULL,
    "recipientAddress" TEXT NOT NULL,
    "status" "ExchangeStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExchangeRequest_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "asset" ADD CONSTRAINT "asset_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExchangeRequest" ADD CONSTRAINT "ExchangeRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExchangeRequest" ADD CONSTRAINT "ExchangeRequest_assetFromId_fkey" FOREIGN KEY ("assetFromId") REFERENCES "asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExchangeRequest" ADD CONSTRAINT "ExchangeRequest_assetToId_fkey" FOREIGN KEY ("assetToId") REFERENCES "asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;
