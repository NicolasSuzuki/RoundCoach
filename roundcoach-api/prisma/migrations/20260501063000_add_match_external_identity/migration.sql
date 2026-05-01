ALTER TABLE "Match"
ADD COLUMN "externalSource" TEXT,
ADD COLUMN "externalId" TEXT;

CREATE UNIQUE INDEX "Match_userId_externalSource_externalId_key"
ON "Match"("userId", "externalSource", "externalId");
