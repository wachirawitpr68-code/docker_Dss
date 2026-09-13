@echo off
cd "c:\Users\Lenovo\OneDrive\Desktop\Dss\Ex database\web"
echo "Running Prisma generate..."
call npx.cmd prisma generate
echo "Pushing schema to DB..."
call npx.cmd prisma db push
echo "Seeding data..."
node prisma\seed.js
