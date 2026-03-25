-- CreateEnum
CREATE TYPE "MatchResult" AS ENUM ('WIN', 'LOSS');

-- CreateEnum
CREATE TYPE "VodStatus" AS ENUM ('UPLOADED', 'PROCESSING', 'PROCESSED', 'FAILED');

-- CreateEnum
CREATE TYPE "AnalysisProcessingStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Match" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "map" TEXT NOT NULL,
    "agent" TEXT NOT NULL,
    "result" "MatchResult" NOT NULL,
    "score" TEXT NOT NULL,
    "matchDate" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vod" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "matchId" TEXT,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "durationSeconds" INTEGER,
    "status" "VodStatus" NOT NULL DEFAULT 'UPLOADED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Analysis" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "vodId" TEXT,
    "processingStatus" "AnalysisProcessingStatus" NOT NULL DEFAULT 'PENDING',
    "deathsFirst" INTEGER,
    "entryKills" INTEGER,
    "avgCrosshairScore" DOUBLE PRECISION,
    "utilityUsageScore" DOUBLE PRECISION,
    "positioningScore" DOUBLE PRECISION,
    "summary" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Analysis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Match_userId_idx" ON "Match"("userId");

-- CreateIndex
CREATE INDEX "Match_matchDate_idx" ON "Match"("matchDate");

-- CreateIndex
CREATE UNIQUE INDEX "Vod_matchId_key" ON "Vod"("matchId");

-- CreateIndex
CREATE INDEX "Vod_userId_idx" ON "Vod"("userId");

-- CreateIndex
CREATE INDEX "Vod_status_idx" ON "Vod"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Analysis_matchId_key" ON "Analysis"("matchId");

-- CreateIndex
CREATE UNIQUE INDEX "Analysis_vodId_key" ON "Analysis"("vodId");

-- CreateIndex
CREATE INDEX "Analysis_processingStatus_idx" ON "Analysis"("processingStatus");

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vod" ADD CONSTRAINT "Vod_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vod" ADD CONSTRAINT "Vod_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Analysis" ADD CONSTRAINT "Analysis_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Analysis" ADD CONSTRAINT "Analysis_vodId_fkey" FOREIGN KEY ("vodId") REFERENCES "Vod"("id") ON DELETE SET NULL ON UPDATE CASCADE;
