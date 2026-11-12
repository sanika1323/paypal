/**
 * Demo data for judges and fresh databases: one emergency, NGOs, products, suppliers with offers,
 * and NGO relief requests (all with real-world coordinates for the map).
 *
 *   npm run seed
 *
 * Safe by design: it refuses to touch a database that already has emergencies, so it can never
 * duplicate or overwrite existing records.
 */
import dotenv from "dotenv";

dotenv.config();
// Loaded after dotenv so DATABASE_URL is available when the client is created.
const { prisma } = await import("../src/config/database.js");

const main = async () => {
  const existing = await prisma.emergency.count();
  if (existing > 0) {
    console.log(`Database already has ${existing} emergencies; seed skipped (nothing changed).`);
    return;
  }

  const emergency = await prisma.emergency.create({
    data: {
      name: "Flood Relief Operation",
      description: "Monsoon flooding across Nagpur district; drinking water, food and shelter needed.",
      location: "Nagpur, Maharashtra",
      severity: "HIGH",
      latitude: 21.1458,
      longitude: 79.0882,
    },
  });

  const products = {
    water: await prisma.product.create({ data: { name: "Drinking Water Kit", category: "Water", unit: "box" } }),
    food: await prisma.product.create({ data: { name: "Emergency Food Ration", category: "Food", unit: "pack" } }),
    shelter: await prisma.product.create({ data: { name: "Tarpaulin Shelter Sheet", category: "Shelter", unit: "sheet" } }),
  };

  const ngo = (name: string, email: string, location: string, latitude: number, longitude: number) =>
    prisma.organization.create({ data: { name, type: "NGO", email, location, latitude, longitude } });
  const ngos = [
    await ngo("Relief Support Foundation", "contact@reliefsupport.example.org", "Nagpur", 21.15, 79.09),
    await ngo("Vidarbha Aid Network", "team@vidarbhaaid.example.org", "Wardha", 20.7453, 78.6022),
    await ngo("Sahayog Community Trust", "help@sahayog.example.org", "Chandrapur", 19.9615, 79.2961),
  ];

  const vendor = (name: string, location: string, latitude: number, longitude: number, reliability = 0) =>
    prisma.vendor.create({ data: { name, location, latitude, longitude, reliability } });
  const vendors = {
    maharashtra: await vendor("Maharashtra Relief Supplies", "Mumbai", 19.076, 72.8777, 0.92),
    bihar: await vendor("Bihar Emergency Traders", "Patna", 25.5941, 85.1376, 0.85),
    rapid: await vendor("Rapid Aqua Logistics", "Raipur", 21.2514, 81.6296, 0.9),
    central: await vendor("Central India Provisions", "Bhopal", 23.2599, 77.4126),
  };

  const offers: Array<[keyof typeof vendors, keyof typeof products, string, number, number]> = [
    ["maharashtra", "water", "180", 1000, 2],
    ["bihar", "water", "165", 600, 3],
    ["rapid", "water", "190", 1000, 1],
    ["central", "food", "140", 800, 2],
    ["maharashtra", "food", "155", 1200, 3],
    ["rapid", "shelter", "610", 300, 2],
    ["central", "shelter", "585", 200, 4],
  ];
  for (const [v, p, unitPrice, capacity, deliveryDays] of offers) {
    await prisma.vendorOffer.create({ data: { vendorId: vendors[v].id, productId: products[p].id, unitPrice, capacity, deliveryDays } });
  }

  const requests: Array<[number, keyof typeof products, number, number]> = [
    [0, "water", 300, 5],
    [1, "water", 120, 4],
    [0, "food", 400, 5],
    [2, "food", 250, 4],
    [1, "shelter", 90, 3],
    [2, "shelter", 60, 4],
  ];
  for (const [o, p, quantity, urgency] of requests) {
    await prisma.reliefRequest.create({
      data: { organizationId: ngos[o]!.id, emergencyId: emergency.id, productId: products[p].id, quantity, urgency },
    });
  }

  console.log(`Seeded "${emergency.name}" with ${ngos.length} NGOs, ${Object.keys(vendors).length} suppliers, ${offers.length} offers and ${requests.length} requests.`);
};

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
