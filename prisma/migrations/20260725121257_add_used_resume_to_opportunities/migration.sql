-- AlterTable
ALTER TABLE "job_applications" ADD COLUMN     "usedResumeId" TEXT;

-- CreateIndex
CREATE INDEX "job_applications_userId_usedResumeId_idx" ON "job_applications"("userId", "usedResumeId");

-- AddForeignKey
ALTER TABLE "job_applications" ADD CONSTRAINT "job_applications_usedResumeId_fkey" FOREIGN KEY ("usedResumeId") REFERENCES "resumes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
