const express = require("express");
const Router = express.Router();

const venueCont = require("../../controllers/hostApiControllers/venueController");
const { checkHostApiSession } = require('../../includes/middlewares');

Router.post("/create-venue-in-listing", checkHostApiSession, venueCont.createVenueInList);

Router.post("/get-all-my-venue-listing", checkHostApiSession, venueCont.getAllMyVenueList);

Router.post("/get-my-venue-listing/:filter", checkHostApiSession, venueCont.getMyVenueList);

Router.post("/update-venue", checkHostApiSession, venueCont.updateVenue);

Router.post("/update-venue-public-visibility", checkHostApiSession, venueCont.updateVenuePublicVisibility);

Router.post("/venue-image-uploading", checkHostApiSession, venueCont.updateVenueImage);

Router.post("/venue-image-delete", checkHostApiSession, venueCont.venueImgDelete);

module.exports = Router;