-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "exchangeRate" DECIMAL(18,10),
ADD COLUMN     "exchangeRateDate" TEXT,
ADD COLUMN     "exchangeRateProvider" TEXT,
ADD COLUMN     "originalAmountINR" DECIMAL(14,2);
