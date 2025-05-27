/*
  Warnings:

  - You are about to drop the column `status` on the `Quiz` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Quiz` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Quiz" DROP CONSTRAINT "Quiz_userId_fkey";

-- AlterTable
ALTER TABLE "Quiz" DROP COLUMN "status",
DROP COLUMN "userId";

-- AlterTable
ALTER TABLE "QuizSubmission" ADD COLUMN     "status" "QuizStatus" NOT NULL DEFAULT 'OPEN';
