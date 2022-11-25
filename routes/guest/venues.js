const express = require("express");
const Router = express.Router();

const venueCont = require("../../controllers/guestApiControllers/venueController");
const { checkGuestApiSession } = require('../../includes/middlewares');

Router.post("/dashboard-venues", checkGuestApiSession, venueCont.dashboardVenues);

Router.post("/add-venue-in-favrt", checkGuestApiSession, venueCont.addVenueInFavrt);

Router.post("/remove-venue-from-favrt", checkGuestApiSession, venueCont.removeVenueFromFavrt);

Router.post("/get-favrt-venues", checkGuestApiSession, venueCont.getFavrtVenues);

Router.post("/get-venue-detail", checkGuestApiSession, venueCont.getVenueDetail);

Router.post("/search-venues", checkGuestApiSession, venueCont.searchVenues);

module.exports = Router;