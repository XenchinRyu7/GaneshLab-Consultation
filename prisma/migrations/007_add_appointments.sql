-- CreateEnum
CREATE TYPE "AppointmentStatus" AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');
CREATE TYPE "MeetingType" AS ENUM ('online', 'offline');
CREATE TYPE "DayOfWeek" AS ENUM ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday');

-- CreateTable
CREATE TABLE "pic_availabilities" (
    "id" TEXT NOT NULL,
    "pic_id" TEXT NOT NULL,
    "day_of_week" "DayOfWeek" NOT NULL,
    "start_time" TEXT NOT NULL,
    "end_time" TEXT NOT NULL,
    "is_available" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pic_availabilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pic_blocked_slots" (
    "id" TEXT NOT NULL,
    "pic_id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "start_time" TEXT NOT NULL,
    "end_time" TEXT NOT NULL,
    "reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pic_blocked_slots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "appointments" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "client_id" TEXT NOT NULL,
    "pic_id" TEXT NOT NULL,
    "project_id" TEXT,
    "date" DATE NOT NULL,
    "start_time" TEXT NOT NULL,
    "end_time" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "type" "MeetingType" NOT NULL DEFAULT 'online',
    "meeting_link" TEXT,
    "location" TEXT,
    "status" "AppointmentStatus" NOT NULL DEFAULT 'pending',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "appointments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pic_availabilities_pic_id_day_of_week_key" ON "pic_availabilities"("pic_id", "day_of_week");

-- CreateIndex
CREATE INDEX "pic_availabilities_pic_id_idx" ON "pic_availabilities"("pic_id");

-- CreateIndex
CREATE INDEX "pic_availabilities_day_of_week_idx" ON "pic_availabilities"("day_of_week");

-- CreateIndex
CREATE INDEX "pic_blocked_slots_pic_id_idx" ON "pic_blocked_slots"("pic_id");

-- CreateIndex
CREATE INDEX "pic_blocked_slots_date_idx" ON "pic_blocked_slots"("date");

-- CreateIndex
CREATE INDEX "appointments_client_id_idx" ON "appointments"("client_id");

-- CreateIndex
CREATE INDEX "appointments_pic_id_idx" ON "appointments"("pic_id");

-- CreateIndex
CREATE INDEX "appointments_project_id_idx" ON "appointments"("project_id");

-- CreateIndex
CREATE INDEX "appointments_date_idx" ON "appointments"("date");

-- CreateIndex
CREATE INDEX "appointments_status_idx" ON "appointments"("status");

-- CreateIndex
CREATE INDEX "appointments_date_start_time_idx" ON "appointments"("date", "start_time");

-- AddForeignKey
ALTER TABLE "pic_availabilities" ADD CONSTRAINT "pic_availabilities_pic_id_fkey" FOREIGN KEY ("pic_id") REFERENCES "user_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pic_blocked_slots" ADD CONSTRAINT "pic_blocked_slots_pic_id_fkey" FOREIGN KEY ("pic_id") REFERENCES "user_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "user_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_pic_id_fkey" FOREIGN KEY ("pic_id") REFERENCES "user_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

