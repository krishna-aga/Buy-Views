const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const connectDB = require("../config/db");
const User = require("../models/User");

dotenv.config();

const createAdmin = async () => {
  try {
    const name = process.argv[2] || "Admin";
    const email = process.argv[3] || process.env.ADMIN_EMAIL || "admin@example.com";
    const password = process.argv[4] || process.env.ADMIN_PASSWORD || "Admin@12345";

    if (!email || !password) {
      throw new Error("Usage: node scripts/create-admin.js <name> <email> <password>");
    }

    await connectDB();

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      existingUser.name = name;
      existingUser.role = "admin";
      existingUser.password = await bcrypt.hash(password, 10);
      await existingUser.save();

      console.log("Admin user updated successfully.");
      console.log({ email, role: existingUser.role });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "admin",
    });

    console.log("Admin user created successfully.");
    console.log({ email: user.email, role: user.role });
  } catch (error) {
    console.error("Failed to create admin user:", error.message);
    process.exit(1);
  }
};

createAdmin();
