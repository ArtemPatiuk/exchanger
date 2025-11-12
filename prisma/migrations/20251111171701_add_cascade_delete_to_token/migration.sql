-- DropForeignKey
ALTER TABLE "public"."tokens" DROP CONSTRAINT "tokens_userId_fkey";

-- AddForeignKey
ALTER TABLE "tokens" ADD CONSTRAINT "tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
