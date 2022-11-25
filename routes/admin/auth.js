const express = require("express");
const Router = express.Router();

const authCont = require("../../controllers/adminControllers/authController");
const { redirectAdminSessionExist } = require('../../includes/middlewares');

Router.get("/login", redirectAdminSessionExist, authCont.loginPage);

Router.post("/login", redirectAdminSessionExist, authCont.loginRequest);

Router.get("/logout", authCont.logoutRequest);

module.exports = Router;