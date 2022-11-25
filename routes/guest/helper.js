const express = require("express");
const Router = express.Router();

const helperCont = require("../../controllers/guestApiControllers/helperController");
const { checkGuestApiSession } = require('../../includes/middlewares');

Router.post("/image-uploading", checkGuestApiSession, helperCont.imageUploading);


module.exports = Router;