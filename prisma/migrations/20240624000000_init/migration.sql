-- CreateEnum
CREATE TYPE "ImageStatus" AS ENUM ('PENDING', 'PROCESSING', 'ACCEPTED', 'REJECTED');

-- CreateTable
CREATE TABLE "images" (
    "id" UUID NOT NULL,
    "filename" TEXT NOT NULL,
    "original_url" TEXT NOT NULL,
    "processed_url" TEXT,
    "file_type" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "status" "ImageStatus" NOT NULL DEFAULT 'PENDING',
    "rejection_reason" TEXT,
    "hash" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "images_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "images_status_idx" ON "images"("status");

-- CreateIndex
CREATE INDEX "images_hash_idx" ON "images"("hash");

-- CreateIndex
CREATE INDEX "images_created_at_idx" ON "images"("created_at");
