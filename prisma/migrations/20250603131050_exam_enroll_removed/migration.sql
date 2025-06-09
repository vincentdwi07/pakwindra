/*
  Warnings:

  - You are about to drop the `_ExamEnrollment` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_ExamEnrollment" DROP CONSTRAINT "_ExamEnrollment_A_fkey";

-- DropForeignKey
ALTER TABLE "_ExamEnrollment" DROP CONSTRAINT "_ExamEnrollment_B_fkey";

-- DropTable
DROP TABLE "_ExamEnrollment";
