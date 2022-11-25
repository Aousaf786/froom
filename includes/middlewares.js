const { checkAdminSession, returnApiJson } = require('./functions');
const Validator = require('validatorjs');

const UserModel = require("../models/users");

exports.checkAdminSession = async (req, res, next) => {
    let checkSession = await checkAdminSession(req);
    if(!checkSession){
        return res.redirect('/admin/login');
    }
    next();
}

exports.redirectAdminSessionExist = async (req, res, next) => {
    let checkSession = await checkAdminSession(req);
    if(checkSession){
        return res.redirect('/admin/dashboard');
    }
    next();
}

exports.checkGuestApiSession = async (req, res, next) => {
    let reqData = req.query;
    let rules = {
        api_token: 'required',
    };
    let validation = new Validator(reqData, rules);
    if(validation.fails()){
        returnApiJson(res, 3, "Unauthorized access, Please contact to administrator");
    } else {
        let user = await UserModel.findOne({api_token: reqData.api_token, status: 1, guest_access: 1});
        if (user) {
            req.session.user = user;
            next();
        } else{
            returnApiJson(res, 3, "Unauthorized access, Please contact to administrator");
        }
    }
}

exports.checkHostApiSession = async (req, res, next) => {
    let reqData = req.query;
    let rules = {
        api_token: 'required',
    };
    let validation = new Validator(reqData, rules);
    if(validation.fails()){
        returnApiJson(res, 3, "Unauthorized access, Please contact to administrator");
    } else {
        let user = await UserModel.findOne({api_token: reqData.api_token, status: 1, host_access: 1});
        if (user) {
            req.session.host = user;
            next();
        } else{
            returnApiJson(res, 3, "Unauthorized access, Please contact to administrator");
        }
    }
}