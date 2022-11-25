const express = require("express");
const Router = express.Router();

const authCont = require("../../controllers/guestApiControllers/authController");

Router.post("/signup", authCont.signupRequest);

Router.post("/login", authCont.loginRequest);

Router.post("/forgot-password-request", authCont.forgotPassRequest);

Router.post("/reset-pass-otp-verified", authCont.resetPassOtpVerified);

Router.post("/reset-password-request", authCont.resetPassRequest);

module.exports = Router;