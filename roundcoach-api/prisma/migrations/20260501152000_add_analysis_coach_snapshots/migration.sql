-- CreateTable
CREATE TABLE "AnalysisCoachSnapshot" (
    "id" TEXT NOT NULL,
    "analysisId" TEXT NOT NULL,
    "signature" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AnalysisCoachSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AnalysisCoachSnapshot_analysisId_key" ON "AnalysisCoachSnapshot"("analysisId");

-- CreateIndex
CREATE INDEX "AnalysisCoachSnapshot_updatedAt_idx" ON "AnalysisCoachSnapshot"("updatedAt");

-- AddForeignKey
ALTER TABLE "AnalysisCoachSnapshot" ADD CONSTRAINT "AnalysisCoachSnapshot_analysisId_fkey" FOREIGN KEY ("analysisId") REFERENCES "Analysis"("id") ON DELETE CASCADE ON UPDATE CASCADE;
