/*
  Warnings:

  - Added the required column `updatedAt` to the `Delivery` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "DeliveryStatus" ADD VALUE 'FAILED';

-- DropForeignKey
ALTER TABLE "Delivery" DROP CONSTRAINT "Delivery_paymentId_fkey";

-- AlterTable
ALTER TABLE "Delivery" ADD COLUMN     "allocationId" TEXT,
ADD COLUMN     "failureReason" TEXT,
ADD COLUMN     "procurementPurchaseId" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "paymentId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Delivery" ADD CONSTRAINT "Delivery_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Delivery" ADD CONSTRAINT "Delivery_procurementPurchaseId_fkey" FOREIGN KEY ("procurementPurchaseId") REFERENCES "ProcurementPurchase"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Delivery" ADD CONSTRAINT "Delivery_allocationId_fkey" FOREIGN KEY ("allocationId") REFERENCES "Allocation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
