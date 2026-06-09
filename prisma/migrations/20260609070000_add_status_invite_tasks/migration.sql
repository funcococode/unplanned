-- CreateEnum
CREATE TYPE "TripStatus" AS ENUM ('PLANNING', 'CONFIRMED', 'ONGOING', 'COMPLETED');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'DONE');

-- AlterTable: add status + inviteToken to trips
ALTER TABLE "trips"
  ADD COLUMN "status"      "TripStatus" NOT NULL DEFAULT 'PLANNING',
  ADD COLUMN "inviteToken" TEXT;

-- CreateIndex for inviteToken uniqueness
CREATE UNIQUE INDEX "trips_inviteToken_key" ON "trips"("inviteToken");

-- CreateTable
CREATE TABLE "trip_tasks" (
    "id"           TEXT NOT NULL,
    "tripId"       TEXT NOT NULL,
    "createdById"  TEXT NOT NULL,
    "assignedToId" TEXT,
    "title"        TEXT NOT NULL,
    "description"  TEXT,
    "status"       "TaskStatus" NOT NULL DEFAULT 'TODO',
    "dueDate"      TIMESTAMP(3),
    "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"    TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trip_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "trip_tasks_tripId_idx"       ON "trip_tasks"("tripId");
CREATE INDEX "trip_tasks_assignedToId_idx" ON "trip_tasks"("assignedToId");

-- AddForeignKey
ALTER TABLE "trip_tasks" ADD CONSTRAINT "trip_tasks_tripId_fkey"
  FOREIGN KEY ("tripId") REFERENCES "trips"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "trip_tasks" ADD CONSTRAINT "trip_tasks_createdById_fkey"
  FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "trip_tasks" ADD CONSTRAINT "trip_tasks_assignedToId_fkey"
  FOREIGN KEY ("assignedToId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
