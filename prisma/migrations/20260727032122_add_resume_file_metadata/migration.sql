-- AlterTable
ALTER TABLE "resumes" ADD COLUMN     "fileMimeType" TEXT,
ADD COLUMN     "fileName" TEXT,
ADD COLUMN     "filePathname" TEXT,
ADD COLUMN     "fileSizeBytes" INTEGER,
ADD COLUMN     "fileUrl" TEXT,
ADD COLUMN     "uploadedAt" TIMESTAMP(3);
