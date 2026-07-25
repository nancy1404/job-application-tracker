-- CreateEnum
CREATE TYPE "OpportunityType" AS ENUM ('JOB', 'INTERNSHIP', 'RESEARCH', 'PROFESSOR_OUTREACH', 'LAB');

-- CreateEnum
CREATE TYPE "OpportunityOutcome" AS ENUM ('ACTIVE', 'ACCEPTED', 'REJECTED', 'NO_RESPONSE', 'WITHDRAWN', 'ARCHIVED');

-- AlterTable
ALTER TABLE "job_applications" ADD COLUMN     "contactEmail" TEXT,
ADD COLUMN     "contactName" TEXT,
ADD COLUMN     "opportunityType" "OpportunityType" NOT NULL DEFAULT 'JOB',
ADD COLUMN     "outcome" "OpportunityOutcome" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "outcomeDate" TIMESTAMP(3),
ADD COLUMN     "outcomeNotes" TEXT;

-- CreateIndex
CREATE INDEX "job_applications_userId_opportunityType_idx" ON "job_applications"("userId", "opportunityType");

-- CreateIndex
CREATE INDEX "job_applications_userId_outcome_idx" ON "job_applications"("userId", "outcome");
