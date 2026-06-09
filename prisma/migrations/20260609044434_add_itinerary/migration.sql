-- CreateEnum
CREATE TYPE "ItineraryItemType" AS ENUM ('ACTIVITY', 'FOOD', 'TRANSPORT', 'ACCOMMODATION', 'SIGHTSEEING', 'OTHER');

-- CreateEnum
CREATE TYPE "ItineraryItemStatus" AS ENUM ('APPROVED', 'PENDING_REVIEW', 'REJECTED');

-- CreateTable
CREATE TABLE "itinerary_days" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "dayNumber" INTEGER NOT NULL,
    "date" TIMESTAMP(3),
    "title" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "itinerary_days_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "itinerary_items" (
    "id" TEXT NOT NULL,
    "dayId" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "time" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "location" TEXT,
    "type" "ItineraryItemType" NOT NULL DEFAULT 'ACTIVITY',
    "status" "ItineraryItemStatus" NOT NULL DEFAULT 'APPROVED',
    "suggestedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "itinerary_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "itinerary_days_tripId_idx" ON "itinerary_days"("tripId");

-- CreateIndex
CREATE UNIQUE INDEX "itinerary_days_tripId_dayNumber_key" ON "itinerary_days"("tripId", "dayNumber");

-- CreateIndex
CREATE INDEX "itinerary_items_dayId_idx" ON "itinerary_items"("dayId");

-- CreateIndex
CREATE INDEX "itinerary_items_tripId_idx" ON "itinerary_items"("tripId");

-- AddForeignKey
ALTER TABLE "itinerary_days" ADD CONSTRAINT "itinerary_days_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "trips"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itinerary_items" ADD CONSTRAINT "itinerary_items_dayId_fkey" FOREIGN KEY ("dayId") REFERENCES "itinerary_days"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itinerary_items" ADD CONSTRAINT "itinerary_items_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "trips"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itinerary_items" ADD CONSTRAINT "itinerary_items_suggestedBy_fkey" FOREIGN KEY ("suggestedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
