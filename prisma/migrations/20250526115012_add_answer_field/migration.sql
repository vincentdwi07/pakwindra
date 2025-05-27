/*
  Warnings:

  - You are about to drop the column `fileName` on the `QuizSubmission` table. All the data in the column will be lost.
  - You are about to drop the column `fileUrl` on the `QuizSubmission` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "QuizSubmission" DROP COLUMN "fileName",
DROP COLUMN "fileUrl",
ADD COLUMN     "answer" TEXT;
