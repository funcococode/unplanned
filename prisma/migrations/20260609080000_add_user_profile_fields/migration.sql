-- AlterTable: add languages, instagram, phone to users
ALTER TABLE "users"
  ADD COLUMN "languages" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "instagram" TEXT,
  ADD COLUMN "phone"     TEXT;
