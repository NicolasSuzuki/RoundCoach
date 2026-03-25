ALTER TABLE "User"
ADD COLUMN "currentRank" TEXT,
ADD COLUMN "currentGoal" TEXT,
ADD COLUMN "mainAgents" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "mainRole" TEXT,
ADD COLUMN "currentFocus" TEXT;

UPDATE "User"
SET "mainAgents" = ARRAY[]::TEXT[]
WHERE "mainAgents" IS NULL;

ALTER TABLE "User"
ALTER COLUMN "mainAgents" SET DEFAULT ARRAY[]::TEXT[],
ALTER COLUMN "mainAgents" SET NOT NULL;
