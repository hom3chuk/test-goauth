-- CreateTable
CREATE TABLE "Token" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "state" TEXT NOT NULL,
    "refresh_token" TEXT,

    CONSTRAINT "Token_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Token_id_key" ON "Token"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Token_state_key" ON "Token"("state");
