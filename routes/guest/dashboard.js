const express = require("express");
const Router = express.Router();

const dashCont = require("../../controllers/guestApiControllers/dashboardController");
const { checkGuestApiSession } = require('../../includes/middlewares');

Router.post("/profile-detail", checkGuestApiSession, dashCont.getProfileDetail);

Router.post("/update-profile", checkGuestApiSession, dashCont.updateProfile);

Router.post("/profile-image-upload", checkGuestApiSession, dashCont.proImgUploading);

Router.post("/resend-email-verifing-mail", checkGuestApiSession, dashCont.resendEmailVerifingMail);

Router.post("/verifing-email-otp", checkGuestApiSession, dashCont.verifingEmailOtp);

Router.post("/update-setting", checkGuestApiSession, dashCont.updateSetting);

Router.post("/become-host-request", checkGuestApiSession, dashCont.becomeHostRequest);

module.exports = Router;