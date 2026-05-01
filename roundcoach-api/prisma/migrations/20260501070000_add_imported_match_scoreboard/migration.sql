CREATE TABLE "ImportedMatchSnapshot" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "externalSource" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "queueId" TEXT,
    "durationSeconds" INTEGER,
    "rawJson" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ImportedMatchSnapshot_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MatchScoreboardPlayer" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "puuid" TEXT,
    "gameName" TEXT NOT NULL,
    "tagLine" TEXT,
    "teamId" TEXT NOT NULL,
    "agent" TEXT NOT NULL,
    "competitiveTier" INTEGER,
    "kills" INTEGER NOT NULL,
    "deaths" INTEGER NOT NULL,
    "assists" INTEGER NOT NULL,
    "score" INTEGER NOT NULL,
    "acs" DOUBLE PRECISION NOT NULL,
    "adr" DOUBLE PRECISION,
    "headshotPercentage" DOUBLE PRECISION,
    "kastPercentage" DOUBLE PRECISION,
    "firstKills" INTEGER NOT NULL,
    "firstDeaths" INTEGER NOT NULL,
    "multiKills" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MatchScoreboardPlayer_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ImportedMatchSnapshot_matchId_key" ON "ImportedMatchSnapshot"("matchId");
CREATE INDEX "ImportedMatchSnapshot_externalSource_externalId_idx" ON "ImportedMatchSnapshot"("externalSource", "externalId");
CREATE INDEX "MatchScoreboardPlayer_matchId_idx" ON "MatchScoreboardPlayer"("matchId");
CREATE INDEX "MatchScoreboardPlayer_puuid_idx" ON "MatchScoreboardPlayer"("puuid");

ALTER TABLE "ImportedMatchSnapshot"
ADD CONSTRAINT "ImportedMatchSnapshot_matchId_fkey"
FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "MatchScoreboardPlayer"
ADD CONSTRAINT "MatchScoreboardPlayer_matchId_fkey"
FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;
