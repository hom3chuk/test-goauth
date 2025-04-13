/*
  Warnings:

  - You are about to drop the column `state` on the `Token` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Token_state_key";

-- AlterTable
ALTER TABLE "Token" DROP COLUMN "state";
