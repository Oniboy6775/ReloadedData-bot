const mongoose = require("mongoose");
const Plan = require("./models/Plan");
require("dotenv").config();

const samplePlans = [
  // MTN Data Plans
  {
    network: "MTN",
    serviceType: "DATA",
    name: "500MB Daily",
    dataAmount: "500MB",
    validity: "1 day",
    price: 350,
    providerCode: "136",
    isActive: true,
  },
  {
    network: "MTN",
    serviceType: "DATA",
    name: "1.5GB Weekly",
    dataAmount: "1.5GB",
    validity: "2 days",
    price: 600,
    providerCode: "155",
    isActive: true,
  },
  {
    network: "MTN",
    serviceType: "DATA",
    name: "500MB Weekly",
    dataAmount: "500MB",
    validity: "7 days",
    price: 400,
    providerCode: "101",
    isActive: true,
  },
  {
    network: "MTN",
    serviceType: "DATA",
    name: "1GB Weekly",
    dataAmount: "1GB",
    validity: "7 days",
    price: 600,
    providerCode: "102",
    isActive: true,
  },
  {
    network: "MTN",
    serviceType: "DATA",
    name: "2GB Monthly",
    dataAmount: "2GB",
    validity: "30 days",
    price: 1200,
    providerCode: "103",
    isActive: true,
  },
  {
    network: "MTN",
    serviceType: "DATA",
    name: "3GB Monthly",
    dataAmount: "3GB",
    validity: "30 days",
    price: 1700,
    providerCode: "104",
    isActive: true,
  },
  {
    network: "MTN",
    serviceType: "DATA",
    name: "5GB Monthly",
    dataAmount: "5GB",
    validity: "30 days",
    price: 2500,
    providerCode: "105",
    isActive: true,
  },
  {
    network: "MTN",
    serviceType: "DATA",
    name: "10GB Monthly",
    dataAmount: "10GB",
    validity: "30 days",
    price: 4470,
    providerCode: "175",
    isActive: true,
  },

  // Airtel Data Plans
  {
    network: "AIRTEL",
    serviceType: "DATA",
    name: "150MB Daily",
    dataAmount: "150MB",
    validity: "1 day",
    price: 100,
    providerCode: "320",
    isActive: true,
  },
  {
    network: "AIRTEL",
    serviceType: "DATA",
    name: "300MB Daily",
    dataAmount: "300MB",
    validity: "2 days",
    price: 150,
    providerCode: "321",
    isActive: true,
  },
  {
    network: "AIRTEL",
    serviceType: "DATA",
    name: "500MB Weekly",
    dataAmount: "500MB",
    validity: "7 days",
    price: 500,
    providerCode: "338",
    isActive: true,
  },
  {
    network: "AIRTEL",
    serviceType: "DATA",
    name: "1GB Weekly",
    dataAmount: "1GB",
    validity: "7 days",
    price: 800,
    providerCode: "339",
    isActive: true,
  },
  {
    network: "AIRTEL",
    serviceType: "DATA",
    name: "2GB Monthly",
    dataAmount: "2GB",
    validity: "30 days",
    price: 1500,
    providerCode: "342",
    isActive: true,
  },
  {
    network: "AIRTEL",
    serviceType: "DATA",
    name: "3GB Monthly",
    dataAmount: "3GB",
    validity: "30 days",
    price: 2000,
    providerCode: "343",
    isActive: true,
  },

  // Glo Data Plans
  {
    network: "GLO",
    serviceType: "DATA",
    name: "500MB Monthly",
    dataAmount: "500MB",
    validity: "30 days",
    price: 250,
    providerCode: "201",
    isActive: true,
  },
  {
    network: "GLO",
    serviceType: "DATA",
    name: "1GB Monthly",
    dataAmount: "1GB",
    validity: "30 days",
    price: 450,
    providerCode: "202",
    isActive: true,
  },
  {
    network: "GLO",
    serviceType: "DATA",
    name: "2GB Monthly",
    dataAmount: "2GB",
    validity: "30 days",
    price: 900,
    providerCode: "203",
    isActive: true,
  },
  {
    network: "GLO",
    serviceType: "DATA",
    name: "3GB Monthly",
    dataAmount: "3GB",
    validity: "30 days",
    price: 1350,
    providerCode: "204",
    isActive: true,
  },
  {
    network: "GLO",
    serviceType: "DATA",
    name: "5GB Monthly",
    dataAmount: "5GB",
    validity: "30 days",
    price: 2250,
    providerCode: "204",
    isActive: true,
  },
  {
    network: "GLO",
    serviceType: "DATA",
    name: "10GB Monthly",
    dataAmount: "10GB",
    validity: "30 days",
    price: 4300,
    providerCode: "206",
    isActive: true,
  },

  // 9Mobile Data Plans
  //   {
  //     network: "9MOBILE",
  //     serviceType: "DATA",
  //     name: "1.5GB Monthly",
  //     dataAmount: "1.5GB",
  //     validity: "30 days",
  //     price: 1000,
  //     providerCode: "9MOB-1.5GB-30D",
  //     isActive: true,
  //   },
  //   {
  //     network: "9MOBILE",
  //     serviceType: "DATA",
  //     name: "4.5GB Monthly",
  //     dataAmount: "4.5GB",
  //     validity: "30 days",
  //     price: 2000,
  //     providerCode: "9MOB-4.5GB-30D",
  //     isActive: true,
  //   },

  // Airtime
  {
    network: "MTN",
    serviceType: "AIRTIME",
    name: "₦100 Airtime",
    price: 100,
    providerCode: "MTN-AIRTIME",
    isActive: true,
  },
  {
    network: "MTN",
    serviceType: "AIRTIME",
    name: "₦200 Airtime",
    price: 200,
    providerCode: "MTN-AIRTIME",
    isActive: true,
  },
  {
    network: "MTN",
    serviceType: "AIRTIME",
    name: "₦500 Airtime",
    price: 500,
    providerCode: "MTN-AIRTIME",
    isActive: true,
  },
  {
    network: "MTN",
    serviceType: "AIRTIME",
    name: "₦1,000 Airtime",
    price: 1000,
    providerCode: "MTN-AIRTIME",
    isActive: true,
  },
  {
    network: "GLO",
    serviceType: "AIRTIME",
    name: "₦100 Airtime",
    price: 100,
    providerCode: "GLO-AIRTIME",
    isActive: true,
  },
  {
    network: "GLO",
    serviceType: "AIRTIME",
    name: "₦200 Airtime",
    price: 200,
    providerCode: "GLO-AIRTIME",
    isActive: true,
  },
  {
    network: "GLO",
    serviceType: "AIRTIME",
    name: "₦500 Airtime",
    price: 500,
    providerCode: "GLO-AIRTIME",
    isActive: true,
  },
  {
    network: "GLO",
    serviceType: "AIRTIME",
    name: "₦1,000 Airtime",
    price: 1000,
    providerCode: "GLO-AIRTIME",
    isActive: true,
  },
  {
    network: "AIRTEL",
    serviceType: "AIRTIME",
    name: "₦100 Airtime",
    price: 100,
    providerCode: "AIRTEL-AIRTIME",
    isActive: true,
  },
  {
    network: "AIRTEL",
    serviceType: "AIRTIME",
    name: "₦200 Airtime",
    price: 200,
    providerCode: "AIRTEL-AIRTIME",
    isActive: true,
  },
  {
    network: "AIRTEL",
    serviceType: "AIRTIME",
    name: "₦500 Airtime",
    price: 500,
    providerCode: "AIRTEL-AIRTIME",
    isActive: true,
  },
  {
    network: "AIRTEL",
    serviceType: "AIRTIME",
    name: "₦1,000 Airtime",
    price: 1000,
    providerCode: "AIRTEL-AIRTIME",
    isActive: true,
  },
  {
    network: "9MOBILE",
    serviceType: "AIRTIME",
    name: "₦100 Airtime",
    price: 100,
    providerCode: "9MOBILE-AIRTIME",
    isActive: true,
  },
  {
    network: "9MOBILE",
    serviceType: "AIRTIME",
    name: "₦200 Airtime",
    price: 200,
    providerCode: "9MOBILE-AIRTIME",
    isActive: true,
  },
  {
    network: "9MOBILE",
    serviceType: "AIRTIME",
    name: "₦500 Airtime",
    price: 500,
    providerCode: "9MOBILE-AIRTIME",
    isActive: true,
  },
  {
    network: "9MOBILE",
    serviceType: "AIRTIME",
    name: "₦1,000 Airtime",
    price: 1000,
    providerCode: "9MOBILE-AIRTIME",
    isActive: true,
  },
];

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    await Plan.deleteMany({});
    console.log("🗑️  Cleared existing plans");

    await Plan.insertMany(samplePlans);
    console.log(`✅ Added ${samplePlans.length} sample plans successfully!`);

    const dataPlanCount = await Plan.countDocuments({ serviceType: "DATA" });
    const airtimePlanCount = await Plan.countDocuments({
      serviceType: "AIRTIME",
    });

    console.log("\n📊 Summary:");
    console.log(`   Data Plans: ${dataPlanCount}`);
    console.log(`   Airtime Plans: ${airtimePlanCount}`);
    console.log(`   Total: ${dataPlanCount + airtimePlanCount}`);

    await mongoose.connection.close();
    console.log("\n✅ Database seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

seedDatabase();
