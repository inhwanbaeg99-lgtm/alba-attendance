import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";

async function main() {
  const adminPin = "1234";

  const existingAdmin = await prisma.admin.findFirst();

  if (!existingAdmin) {
    await prisma.admin.create({
      data: {
        name: "관리자",
        pinHash: await bcrypt.hash(adminPin, 10),
      },
    });
    console.log(`관리자 PIN 생성: ${adminPin}`);
  } else {
    console.log("관리자 계정이 이미 존재합니다.");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
