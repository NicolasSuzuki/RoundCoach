CREATE TYPE "TrainingPlanStatus" AS ENUM ('ACTIVE', 'ARCHIVED', 'SUPERSEDED');

ALTER TABLE "User"
ADD COLUMN "targetRank" TEXT;

CREATE TABLE "TrainingPlan" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "TrainingPlanStatus" NOT NULL DEFAULT 'ACTIVE',
    "generatedFromRange" TEXT,
    "mainWeakness" TEXT NOT NULL,
    "mainStrength" TEXT NOT NULL,
    "focusArea" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "trend" TEXT NOT NULL,
    "intensity" TEXT NOT NULL,
    "dailyPlanJson" JSONB NOT NULL,
    "weeklyPlanJson" JSONB NOT NULL,
    "microGoal" TEXT NOT NULL,
    "justification" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrainingPlan_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "TrainingPlan_userId_status_idx" ON "TrainingPlan"("userId", "status");
CREATE INDEX "TrainingPlan_createdAt_idx" ON "TrainingPlan"("createdAt");

ALTER TABLE "TrainingPlan"
ADD CONSTRAINT "TrainingPlan_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
