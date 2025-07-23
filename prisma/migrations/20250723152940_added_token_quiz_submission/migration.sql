/*
  Warnings:

  - The `token` column on the `QuizSubmission` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "QuizSubmission" DROP COLUMN "token",
ADD COLUMN     "token" JSONB;
