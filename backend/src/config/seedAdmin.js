const Admin = require("../models/Admin");

const seedAdmin = async () => {
  const defaultEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const defaultPassword = process.env.ADMIN_PASSWORD?.trim();

  if (!defaultEmail || !defaultPassword) {
    console.warn(
      "Warning: ADMIN_EMAIL or ADMIN_PASSWORD is not set in environment variables. Skipping admin seed."
    );
    return;
  }

  const existingAdmin = await Admin.findOne({ email: defaultEmail });

  if (!existingAdmin) {
    await Admin.create({
      email: defaultEmail,
      password: defaultPassword,
      name: "Volkschem Admin",
    });
    console.log(`Seeded default admin user: ${defaultEmail}`);
    return;
  }

  const passwordMatches = await existingAdmin.matchPassword(defaultPassword);

  if (!passwordMatches) {
    existingAdmin.password = defaultPassword;
    await existingAdmin.save();
    console.log(`Updated admin password from environment for: ${defaultEmail}`);
  }
};

module.exports = seedAdmin;
