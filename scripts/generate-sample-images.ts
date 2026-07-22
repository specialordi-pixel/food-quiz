/**
 * 로컬 테스트용 샘플 이미지 생성
 * 간단한 색상 이미지 3개를 public/food-images 에 배치
 */
import sharp from "sharp";
import fs from "fs";
import path from "path";

const foods = [
  { name: "떡볶이", color: "#FF4444" },
  { name: "김밥", color: "#00AA00" },
  { name: "비빔밥", color: "#FFAA00" },
];

async function main() {
  const dir = path.join(process.cwd(), "public", "food-images");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  for (let i = 0; i < foods.length; i++) {
    const filename = path.join(dir, `${i + 1}.png`);
    await sharp({
      create: {
        width: 500,
        height: 500,
        channels: 3,
        background: foods[i].color,
      },
    })
      .png()
      .toFile(filename);
    console.log(`Created ${filename}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
