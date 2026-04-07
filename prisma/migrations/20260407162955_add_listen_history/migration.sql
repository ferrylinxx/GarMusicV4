-- CreateTable
CREATE TABLE "listen_history" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "trackId" TEXT NOT NULL,
    "listenedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "listen_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "listen_history_userId_listenedAt_idx" ON "listen_history"("userId", "listenedAt");

-- AddForeignKey
ALTER TABLE "listen_history" ADD CONSTRAINT "listen_history_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listen_history" ADD CONSTRAINT "listen_history_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "tracks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
