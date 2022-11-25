require("dotenv").config();
const connectDB = require('../includes/db');
const UserModel = require("../models/users");

connectDB();

const seedUserData = [
    {
        first_name: "Super",
        last_name: "Admin",
        email: "admin@domain.com",
        password: "$2a$12$m0mW39ogLoU5w4fjXvUwtuBvX9if6/axxY4mVTrCwLMld2SXNP4v6",       // password786
        api_token: "W39ogLoU5w4fjXvUwtu",
        admin_access: 1
    }
];

const userSeedDB = async () => {
    await UserModel.deleteMany({});     // remove existing all data
    await UserModel.insertMany(seedUserData);
}

userSeedDB();