-- CreateEnum
CREATE TYPE "WeeklyGoalType" AS ENUM ('ADD_OPPORTUNITIES', 'APPLY_TO_OPPORTUNITIES', 'COMPLETE_FOLLOW_UPS');

-- AlterTable
ALTER TABLE "reminders" ADD COLUMN     "completedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "weekly_goals" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "goalType" "WeeklyGoalType" NOT NULL,
    "targetCount" INTEGER NOT NULL,
    "weekStartDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "weekly_goals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "weekly_goals_userId_weekStartDate_idx" ON "weekly_goals"("userId", "weekStartDate");

-- CreateIndex
CREATE UNIQUE INDEX "weekly_goals_userId_goalType_weekStartDate_key" ON "weekly_goals"("userId", "goalType", "weekStartDate");

-- AddForeignKey
ALTER TABLE "weekly_goals" ADD CONSTRAINT "weekly_goals_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
