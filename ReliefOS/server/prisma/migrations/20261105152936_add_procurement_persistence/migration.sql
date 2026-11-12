-- AlterTable
ALTER TABLE "Allocation" ADD COLUMN     "planItemId" TEXT,
ADD COLUMN     "reliefRequestId" TEXT;

-- AlterTable
ALTER TABLE "ProcurementPlan" ADD COLUMN     "totalCost" DECIMAL(14,2) NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "ProcurementPlanItem" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "requestedQuantity" INTEGER NOT NULL,
    "purchasedQuantity" INTEGER NOT NULL,
    "unfulfilledQuantity" INTEGER NOT NULL,
    "unit" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProcurementPlanItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProcurementPurchase" (
    "id" TEXT NOT NULL,
    "planItemId" TEXT NOT NULL,
    "vendorOfferId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DECIMAL(12,2) NOT NULL,
    "totalAmount" DECIMAL(14,2) NOT NULL,
    "deliveryDays" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProcurementPurchase_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Allocation" ADD CONSTRAINT "Allocation_reliefRequestId_fkey" FOREIGN KEY ("reliefRequestId") REFERENCES "ReliefRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Allocation" ADD CONSTRAINT "Allocation_planItemId_fkey" FOREIGN KEY ("planItemId") REFERENCES "ProcurementPlanItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcurementPlanItem" ADD CONSTRAINT "ProcurementPlanItem_planId_fkey" FOREIGN KEY ("planId") REFERENCES "ProcurementPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcurementPlanItem" ADD CONSTRAINT "ProcurementPlanItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcurementPurchase" ADD CONSTRAINT "ProcurementPurchase_planItemId_fkey" FOREIGN KEY ("planItemId") REFERENCES "ProcurementPlanItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcurementPurchase" ADD CONSTRAINT "ProcurementPurchase_vendorOfferId_fkey" FOREIGN KEY ("vendorOfferId") REFERENCES "VendorOffer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
