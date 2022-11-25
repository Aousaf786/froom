const express = require("express");
const Router = express.Router();

const chatCont = require("../../controllers/customerApiControllers/chatController");
const { checkCustomerApiSession } = require('../../includes/middlewares');

Router.post("/get-chat-service-token", checkCustomerApiSession, chatCont.getServiceToken);

module.exports = Router;