const EQUIPMENT_IMAGES = {
  cranes:
    "https://sanyglobal-img.sany.com.cn/product/goods/20220627/STC250T4-165915.jpg?x-oss-process=image/format,webp",
  excavators:
    "https://static.vecteezy.com/system/resources/thumbnails/050/625/344/small_2x/yellow-excavator-moving-dirt-on-gravel-road-at-sunset-photo.jpeg",
  generators:
    "https://static.vecteezy.com/system/resources/thumbnails/088/841/480/small/backup-generator-in-a-sheltered-commercial-service-yard-photo.jpg",
} as const;

const CATEGORY_IMAGES: Record<string, string> = {
  cranes: EQUIPMENT_IMAGES.cranes,
  "cranes-lifting": EQUIPMENT_IMAGES.cranes,
  excavators: EQUIPMENT_IMAGES.excavators,
  earthmoving: EQUIPMENT_IMAGES.excavators,
  generators: EQUIPMENT_IMAGES.generators,
  "power-generators": EQUIPMENT_IMAGES.generators,
};

const FALLBACK_IMAGES = Object.values(EQUIPMENT_IMAGES);

export function getEquipmentImage(category: string, fallbackIndex: number): string {
  return CATEGORY_IMAGES[category] ?? FALLBACK_IMAGES[fallbackIndex % FALLBACK_IMAGES.length];
}
