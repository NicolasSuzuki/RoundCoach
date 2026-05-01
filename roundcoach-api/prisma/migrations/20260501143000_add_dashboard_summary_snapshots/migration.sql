-- CreateTable
CREATE TABLE "DashboardSummarySnapshot" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "signature" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DashboardSummarySnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DashboardSummarySnapshot_userId_key" ON "DashboardSummarySnapshot"("userId");

-- CreateIndex
CREATE INDEX "DashboardSummarySnapshot_updatedAt_idx" ON "DashboardSummarySnapshot"("updatedAt");

-- AddForeignKey
ALTER TABLE "DashboardSummarySnapshot" ADD CONSTRAINT "DashboardSummarySnapshot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
