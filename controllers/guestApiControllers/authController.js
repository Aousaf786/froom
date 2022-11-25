const bcrypt = require('bcrypt');
const Validator = require('validatorjs');
const ejs = require('ejs');
const moment = require("moment");

const { returnApiJson, randomStringGen, randomNumber, sendEmailSendGrid } = require('../../includes/functions');
const { userObj } = require('../../includes/helperObjs');
const UserModel = require("../../models/users");

exports.signupRequest = async (req, res) => {
    let reqData = req.body;
    let rules = {
        email: 'required|email',
        password: 'required|confirmed',
        fcm_token: 'required',
        lat: 'required',
        long: 'required',
      };
    let validation = new Validator(reqData, rules);
    if(validation.fails()){
        return returnApiJson(res, 2, "Validation errors", null, validation.errors.all());
    } else {
        let user = await UserModel.findOne({email: reqData.email});
        if (user) {
            return returnApiJson(res, 0, 'User already exists with this email.');
        }
        let tokenGen = randomStringGen(reqData.email);
        bcrypt.hash(reqData.password, 12).then((hashPass) => {
            let dataObj = { "email": reqData.email, "password": hashPass, "fcm_token": reqData.fcm_token, "api_token": tokenGen, "guest_access": 1, "location": {"type": "Point", "coordinates": [reqData.long, reqData.lat]} }
            let userCreate = new UserModel(dataObj);
            userCreate.save(async (err, data) => {
                if(err){
                    console.log(err);
                    return returnApiJson(res, 0, "Something error");
                } else {
                    let insertId = data._id;
                    await UserModel.updateMany({_id: {$ne: insertId}, fcm_token: reqData.fcm_token}, {fcm_token: ""});
                    await emailVerifiedMail(data);
                    return returnApiJson(res, 1, "Signup successfully", { "user": userObj(data) });
                }
            });
        });
    }
}


exports.loginRequest = async(req, res) => {
    let reqData = req.body;
    let rules = {
        email: 'required|email',
        password: 'required',
        fcm_token: 'required',
        lat: 'required',
        long: 'required',
      };
    let validation = new Validator(reqData, rules);
    if(validation.fails()){
        return returnApiJson(res, 2, "Validation errors", null, validation.errors.all());
    } else {
        let user = await UserModel.findOne({email: reqData.email, status: 1, guest_access: 1});
        if (!user) {
            return returnApiJson(res, 0, 'Invalid email or password');
        }
        let tokenGen = randomStringGen(reqData.email);
        bcrypt.compare(reqData.password, user.password).then(async(pasResult) => {
            if(pasResult){
                // remove fcm token if any user have same token
                await UserModel.updateMany({_id: {$ne: user._id}, fcm_token: reqData.fcm_token}, {fcm_token: ""});
                // update fcm token & api token
                user.fcm_token = reqData.fcm_token;
                user.api_token = tokenGen;
                user.location.coordinates = [reqData.long, reqData.lat];
                await user.save();
                return returnApiJson(res, 1, "Login successfully", { "user": userObj(user) });
            } else {
                return returnApiJson(res, 0, "Invalid email or password");
            }
        });
    }
}

exports.forgotPassRequest = async(req, res) => {
    let reqData = req.body;
    let rules = {
        email: 'required|email',
      };
    let validation = new Validator(reqData, rules);
    if(validation.fails()){
        return returnApiJson(res, 2, "Validation errors", null, validation.errors.all());
    } else {
        let user = await UserModel.findOne({email: reqData.email, status: 1});
        if (!user) {
            return returnApiJson(res, 0, 'Account not found related to this email or account was blocked by admin.');
        }

        let tokenGen = randomNumber(100000, 999999);
        // remove token if any user have
        await UserModel.updateMany({_id: {$ne: user._id}, verification_token: tokenGen}, {tokenGen: ""});
        user.verification_token = tokenGen;
        await user.save();

        // email base path is global variable
        ejs.renderFile(emailBasePath + '/forgotPassMailForMob.ejs', { userName: user.first_name, token: tokenGen}, {}, (err, str) => {
            if (err) {
                console.log(err);
                return returnApiJson(res, 0, "Something error");
            } else {
                sendEmailSendGrid(user.email, "Forgot password email", str);
                return returnApiJson(res, 1, "We've emailed you instructions for setting your password, if an account exist with this email, you should recieve them shortly.");
            }
        });
    }
}

exports.resetPassOtpVerified = async(req, res) => {
    let reqData = req.body;
    let rules = {
        otp_code: 'required',
      };
    let validation = new Validator(reqData, rules);
    if(validation.fails()){
        return returnApiJson(res, 2, "Validation errors", null, validation.errors.all());
    } else {
        let user = await UserModel.findOne({verification_token: reqData.otp_code});
        if (!user) {
            return returnApiJson(res, 0, 'Reset password otp code was expired or not existed.');
        }
        let encodeId = Buffer.from(user._id.toString()).toString('base64');
        user.verification_token = "";
        await user.save();
        return returnApiJson(res, 1, "Otp verified.", {"token": encodeId});
    }
}

exports.resetPassRequest = async(req, res) => {
    let reqData = req.body;
    let rules = {
        token: 'required',
        password: 'required|confirmed',
      };
    let validation = new Validator(reqData, rules);
    if(validation.fails()){
        return returnApiJson(res, 2, "Validation errors", null, validation.errors.all());
    } else {
        let userId = Buffer.from(reqData.token, 'base64').toString('ascii');
        try {
            let user = await UserModel.findById(userId);
            if (!user) {
                return returnApiJson(res, 0, 'User not found or token is incorrect.');
            }
            bcrypt.hash(reqData.password, 12).then(async(hash) => {
                user.password = hash;
                await user.save();
                return returnApiJson(res, 1, "Password updated successfully");
            });
        } catch {
            return returnApiJson(res, 0, 'User not found or token is incorrect.');
        }
    }
}

emailVerifiedMail = (user) => {
    return new Promise(async resolve => {
        let tokenGen = randomNumber(100000, 999999);
        // remove token if any user have
        await UserModel.updateMany({_id: {$ne: user._id}, verification_token: tokenGen}, {tokenGen: ""});
        user.verification_token = tokenGen;
        await user.save();

        // email base path is global variable
        ejs.renderFile(emailBasePath + '/emailVerifiedMail.ejs', {token: tokenGen}, {}, (err, str) => {
            if (err) {
                console.log(err);
                resolve(0);
            } else {
                sendEmailSendGrid(user.email, "Email Verification Mail", str);
                resolve(1);
            }
        });
    });
}