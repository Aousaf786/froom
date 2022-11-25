const express = require("express");
const Router = express.Router();

const venueCont = require("../../controllers/adminControllers/venueController");
const { checkAdminSession } = require('../../includes/middlewares');

Router.get('/', (req, res) => {
    res.redirect('/admin/venues/filter/all');
});

Router.get("/filter/:filter", checkAdminSession, venueCont.listingAccordingFilterPage);

Router.get("/edit-venue/:id", checkAdminSession, venueCont.editVenuePage);

Router.put("/update-venue", checkAdminSession, venueCont.updateVenueRequest);

module.exports = Router;