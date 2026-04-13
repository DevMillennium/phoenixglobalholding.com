/*
  Warnings:

  - Added the required column `updatedAt` to the `InsightReport` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_InsightReport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "periodKey" TEXT NOT NULL,
    "contentMd" TEXT NOT NULL,
    "model" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_InsightReport" ("contentMd", "createdAt", "id", "model", "periodKey") SELECT "contentMd", "createdAt", "id", "model", "periodKey" FROM "InsightReport";
DROP TABLE "InsightReport";
ALTER TABLE "new_InsightReport" RENAME TO "InsightReport";
CREATE UNIQUE INDEX "InsightReport_periodKey_key" ON "InsightReport"("periodKey");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
