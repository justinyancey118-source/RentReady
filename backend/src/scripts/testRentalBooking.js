
const mongoose = require("mongoose");
const RentalBooking = require("../models/RentalBooking");

const validBooking = {
  customerName: "Test Customer",
  customerEmail: "test@example.com",
  rentalType: "equipment",
  productId: new mongoose.Types.ObjectId(),
  packageId: new mongoose.Types.ObjectId(),
  packageSnapshot: {
    durationType: "day",
    durationValue: 1,
    unitPrice: 58,
  },
  startDate: new Date("2027-01-10T09:00:00Z"),
  endDate: new Date("2027-01-11T09:00:00Z"),
};

async function testCase(name, data, shouldBeValid) {
  const booking = new RentalBooking(data);

  try {
    await booking.validate();

    if (shouldBeValid) {
      console.log(`PASS: ${name}`);
    } else {
      console.log(`FAIL: ${name} — invalid data was accepted`);
    }
  } catch (error) {
    if (!shouldBeValid && error instanceof mongoose.Error.ValidationError) {
      console.log(`PASS: ${name}`);
    } else {
      console.log(`FAIL: ${name}`);
      console.error(error.message);
    }
  }
}

async function runTests() {
  console.log("Testing RentalBooking model validation...\n");

  await testCase(
    "Valid pending booking",
    { ...validBooking },
    true
  );

  await testCase(
    "Rejects missing customer name",
    { ...validBooking, customerName: "" },
    false
  );

  await testCase(
    "Rejects end date before start date",
    {
      ...validBooking,
      endDate: new Date("2027-01-09T09:00:00Z"),
    },
    false
  );

  await testCase(
    "Rejects negative delivery fee",
    { ...validBooking, deliveryFee: -10 },
    false
  );

  await testCase(
    "Rejects invalid booking status",
    { ...validBooking, status: "confirmed" },
    false
  );

  await testCase(
    "Rejects invalid rental duration type",
    {
      ...validBooking,
      packageSnapshot: {
        ...validBooking.packageSnapshot,
        durationType: "year",
      },
    },
    false
  );

  await testCase(
    "Accepts same-day dumpster delivery and pickup",
    {
      ...validBooking,
      rentalType: "dumpster",
      startDate: new Date("2027-01-10T09:00:00Z"),
      endDate: new Date("2027-01-10T09:00:00Z"),
      packageSnapshot: {
        durationType: "day",
        durationValue: 12,
        unitPrice: 290,
        includedDays: 12,
        extraDayPrice: 20,
      },
    },
    true
  );

  await testCase(
    "Rejects missing rental type",
    { ...validBooking, rentalType: undefined },
    false
  );

  await testCase(
    "Rejects invalid customer email",
    { ...validBooking, customerEmail: "not-an-email" },
    false
  );
}

runTests().catch((error) => {
  console.error("Test runner failed:", error);
  process.exitCode = 1;
});
