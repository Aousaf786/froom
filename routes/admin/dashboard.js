const express = require("express");
const Router = express.Router();

const dashCont = require("../../controllers/adminControllers/dashboardController");
const { checkAdminSession } = require('../../includes/middlewares');

Router.get("/", checkAdminSession, (req, res) => {
    res.redirect('/admin/dashboard');
});

Router.get("/dashboard", checkAdminSession, dashCont.dashboardPage);

Router.get("/edit-profile", checkAdminSession, dashCont.editProfilePage);

module.exports = Router;