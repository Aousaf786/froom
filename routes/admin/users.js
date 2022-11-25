const express = require("express");
const Router = express.Router();

const userCont = require("../../controllers/adminControllers/userController");
const { checkAdminSession } = require('../../includes/middlewares');

Router.get('/', (req, res) => {
    res.redirect('/admin/users/filter/all');
});

Router.get("/filter/:filter", checkAdminSession, userCont.listingAccordingFilterPage);

Router.get("/edit-user/:id", checkAdminSession, userCont.editUserPage);

Router.put("/update-user", checkAdminSession, userCont.updateUserRequest);

module.exports = Router;