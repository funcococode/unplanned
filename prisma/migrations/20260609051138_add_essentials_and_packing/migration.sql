-- CreateTable
CREATE TABLE "trip_essential_items" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'General',
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "trip_essential_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_packing_items" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "checked" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_packing_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "trip_essential_items_tripId_idx" ON "trip_essential_items"("tripId");

-- CreateIndex
CREATE INDEX "user_packing_items_userId_tripId_idx" ON "user_packing_items"("userId", "tripId");

-- AddForeignKey
ALTER TABLE "trip_essential_items" ADD CONSTRAINT "trip_essential_items_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "trips"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_packing_items" ADD CONSTRAINT "user_packing_items_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_packing_items" ADD CONSTRAINT "user_packing_items_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "trips"("id") ON DELETE CASCADE ON UPDATE CASCADE;
