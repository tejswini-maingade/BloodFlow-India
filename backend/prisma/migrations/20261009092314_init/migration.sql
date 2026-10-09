-- CreateEnum
CREATE TYPE "FacilityType" AS ENUM ('HOSPITAL', 'BLOOD_BANK');

-- CreateEnum
CREATE TYPE "BloodGroup" AS ENUM ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-');

-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN');

-- CreateTable
CREATE TABLE "facilities" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "type" "FacilityType" NOT NULL DEFAULT 'HOSPITAL',
    "city" VARCHAR(80) NOT NULL,
    "state" VARCHAR(80) NOT NULL,
    "contact" VARCHAR(120),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "facilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blood_inventory" (
    "id" SERIAL NOT NULL,
    "facility_id" INTEGER NOT NULL,
    "blood_group" "BloodGroup" NOT NULL,
    "units_available" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blood_inventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(150) NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'ADMIN',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alerts" (
    "id" SERIAL NOT NULL,
    "blood_group" "BloodGroup" NOT NULL,
    "location" VARCHAR(160) NOT NULL,
    "risk_level" "RiskLevel" NOT NULL,
    "message" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "alerts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "facilities_city_idx" ON "facilities"("city");

-- CreateIndex
CREATE INDEX "blood_inventory_blood_group_idx" ON "blood_inventory"("blood_group");

-- CreateIndex
CREATE INDEX "blood_inventory_updated_at_idx" ON "blood_inventory"("updated_at");

-- CreateIndex
CREATE UNIQUE INDEX "blood_inventory_facility_id_blood_group_key" ON "blood_inventory"("facility_id", "blood_group");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "alerts_created_at_idx" ON "alerts"("created_at");

-- AddForeignKey
ALTER TABLE "blood_inventory" ADD CONSTRAINT "blood_inventory_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "facilities"("id") ON DELETE CASCADE ON UPDATE CASCADE;




-- Database-level guard: units can never be negative
ALTER TABLE "blood_inventory"
  ADD CONSTRAINT "blood_inventory_units_nonnegative" CHECK ("units_available" >= 0);
