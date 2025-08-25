/*
  Warnings:

  - A unique constraint covering the columns `[clerkId]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `clerkId` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "bio" TEXT,
ADD COLUMN     "clerkId" TEXT NOT NULL,
ADD COLUMN     "degree" TEXT,
ADD COLUMN     "graduationYear" INTEGER,
ADD COLUMN     "interests" TEXT,
ADD COLUMN     "lookingFor" TEXT,
ADD COLUMN     "major" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "preferredFields" TEXT[],
ADD COLUMN     "university" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "users_clerkId_key" ON "public"."users"("clerkId");
