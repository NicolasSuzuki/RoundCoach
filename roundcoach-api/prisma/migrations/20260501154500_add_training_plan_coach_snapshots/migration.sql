-- CreateTable
CREATE TABLE "TrainingPlanCoachSnapshot" (
    "id" TEXT NOT NULL,
    "trainingPlanId" TEXT NOT NULL,
    "signature" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrainingPlanCoachSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TrainingPlanCoachSnapshot_trainingPlanId_key" ON "TrainingPlanCoachSnapshot"("trainingPlanId");

-- CreateIndex
CREATE INDEX "TrainingPlanCoachSnapshot_updatedAt_idx" ON "TrainingPlanCoachSnapshot"("updatedAt");

-- AddForeignKey
ALTER TABLE "TrainingPlanCoachSnapshot" ADD CONSTRAINT "TrainingPlanCoachSnapshot_trainingPlanId_fkey" FOREIGN KEY ("trainingPlanId") REFERENCES "TrainingPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
