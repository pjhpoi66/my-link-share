-- CreateTable
CREATE TABLE "my_link"."Tag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "my_link"."_BookmarkToTag" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_BookmarkToTag_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_key" ON "my_link"."Tag"("name");

-- CreateIndex
CREATE INDEX "_BookmarkToTag_B_index" ON "my_link"."_BookmarkToTag"("B");

-- AddForeignKey
ALTER TABLE "my_link"."_BookmarkToTag" ADD CONSTRAINT "_BookmarkToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "my_link"."Bookmark"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "my_link"."_BookmarkToTag" ADD CONSTRAINT "_BookmarkToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "my_link"."Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
