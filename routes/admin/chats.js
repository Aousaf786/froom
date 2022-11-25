const express = require("express");
const Router = express.Router();

const chatCont = require("../../controllers/adminControllers/chatController");
const { checkAdminSession } = require('../../includes/middlewares');

Router.get("/", checkAdminSession, chatCont.chatInboxPage);

Router.post("/get-service-token", checkAdminSession, chatCont.getServiceToken);

module.exports = Router;