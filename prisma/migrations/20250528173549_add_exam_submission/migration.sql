/*
  Warnings:

  - You are about to drop the column `status` on the `Exam` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Exam" DROP COLUMN "status";

-- CreateTable
CREATE TABLE "ExamSubmission" (
    "id" SERIAL NOT NULL,
    "studentId" INTEGER NOT NULL,
    "examId" INTEGER NOT NULL,
    "score" DOUBLE PRECISION,
    "feedback" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExamSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ExamSubmission_studentId_examId_key" ON "ExamSubmission"("studentId", "examId");

-- AddForeignKey
ALTER TABLE "ExamSubmission" ADD CONSTRAINT "ExamSubmission_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamSubmission" ADD CONSTRAINT "ExamSubmission_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
