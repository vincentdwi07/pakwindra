/*
  Warnings:

  - The primary key for the `Exam` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Exam` table. All the data in the column will be lost.
  - The primary key for the `ExamSubmission` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `ExamSubmission` table. All the data in the column will be lost.
  - The primary key for the `Quiz` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Quiz` table. All the data in the column will be lost.
  - The primary key for the `QuizSubmission` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `QuizSubmission` table. All the data in the column will be lost.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `User` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Exam" DROP CONSTRAINT "Exam_creatorId_fkey";

-- DropForeignKey
ALTER TABLE "ExamSubmission" DROP CONSTRAINT "ExamSubmission_examId_fkey";

-- DropForeignKey
ALTER TABLE "ExamSubmission" DROP CONSTRAINT "ExamSubmission_studentId_fkey";

-- DropForeignKey
ALTER TABLE "Quiz" DROP CONSTRAINT "Quiz_examId_fkey";

-- DropForeignKey
ALTER TABLE "QuizSubmission" DROP CONSTRAINT "QuizSubmission_quizId_fkey";

-- DropForeignKey
ALTER TABLE "QuizSubmission" DROP CONSTRAINT "QuizSubmission_studentId_fkey";

-- DropForeignKey
ALTER TABLE "Session" DROP CONSTRAINT "Session_userId_fkey";

-- DropForeignKey
ALTER TABLE "_ExamEnrollment" DROP CONSTRAINT "_ExamEnrollment_A_fkey";

-- DropForeignKey
ALTER TABLE "_ExamEnrollment" DROP CONSTRAINT "_ExamEnrollment_B_fkey";

-- AlterTable
ALTER TABLE "Exam" DROP CONSTRAINT "Exam_pkey",
DROP COLUMN "id",
ADD COLUMN     "exam_id" SERIAL NOT NULL,
ADD CONSTRAINT "Exam_pkey" PRIMARY KEY ("exam_id");

-- AlterTable
ALTER TABLE "ExamSubmission" DROP CONSTRAINT "ExamSubmission_pkey",
DROP COLUMN "id",
ADD COLUMN     "exam_submission_id" SERIAL NOT NULL,
ADD CONSTRAINT "ExamSubmission_pkey" PRIMARY KEY ("exam_submission_id");

-- AlterTable
ALTER TABLE "Quiz" DROP CONSTRAINT "Quiz_pkey",
DROP COLUMN "id",
ADD COLUMN     "quiz_id" SERIAL NOT NULL,
ADD CONSTRAINT "Quiz_pkey" PRIMARY KEY ("quiz_id");

-- AlterTable
ALTER TABLE "QuizSubmission" DROP CONSTRAINT "QuizSubmission_pkey",
DROP COLUMN "id",
ADD COLUMN     "quiz_submission_id" SERIAL NOT NULL,
ADD COLUMN     "submission_count" INTEGER,
ADD CONSTRAINT "QuizSubmission_pkey" PRIMARY KEY ("quiz_submission_id");

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
DROP COLUMN "id",
ADD COLUMN     "user_id" SERIAL NOT NULL,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("user_id");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exam" ADD CONSTRAINT "Exam_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quiz" ADD CONSTRAINT "Quiz_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam"("exam_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizSubmission" ADD CONSTRAINT "QuizSubmission_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizSubmission" ADD CONSTRAINT "QuizSubmission_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("quiz_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamSubmission" ADD CONSTRAINT "ExamSubmission_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamSubmission" ADD CONSTRAINT "ExamSubmission_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam"("exam_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ExamEnrollment" ADD CONSTRAINT "_ExamEnrollment_A_fkey" FOREIGN KEY ("A") REFERENCES "Exam"("exam_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ExamEnrollment" ADD CONSTRAINT "_ExamEnrollment_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
