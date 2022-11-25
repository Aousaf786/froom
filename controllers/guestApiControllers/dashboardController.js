const bcrypt = require('bcrypt');
const Validator = require('validatorjs');

const { returnApiJson, randomNumber } = require('../../includes/functions');
const { userObj } = require('../../includes/helperObjs');
const UserModel = require("../../models/users");

exports.getProfileDetail = (req, res) => {
    let user = req.session.user;
    let userData = userObj(user);
    return returnApiJson(res, 1, "Success", { "user": userData });
}

exports.updateProfile = async (req, res) => {
    let reqData = req.body;
    let rules = {
        first_name: 'required',
        last_name: 'required',
        email: 'required|email',
      };
    let validation = new Validator(reqData, rules);
    if(validation.fails()){
        return returnApiJson(res, 2, "Validation errors", null, validation.errors.all());
    } else {
        let sessionData = req.session.user;

        let userExist = await UserModel.findOne({
                    $and : [
                        { _id: {$ne: sessionData._id}, email: reqData.email },
                    ]
                });
        if (userExist) {
            return returnApiJson(res, 0, 'User already exists with this email.');
        }

        sessionData.first_name = reqData.first_name;
        sessionData.last_name = reqData.last_name;
        sessionData.email = reqData.email;
        sessionData.phone_number = reqData.phone_number;
        sessionData.dob = reqData.dob;
        sessionData.gender = reqData.gender;
        sessionData.country = reqData.country;
        sessionData.city = reqData.city;
        sessionData.address = reqData.address;
        sessionData.zip_code = reqData.zip_code;
        sessionData.about_me = reqData.about_me;

        // password update
        if (reqData.password != "" && reqData.password != null) {
            bcrypt.hash(reqData.password, 12).then(async(hash) => {
                sessionData.password = hash;
                await sessionData.save();
            });
        } else {
            await sessionData.save();
        }

        let user = userObj(sessionData);

        return returnApiJson(res, 1, "Profile updated successfully", {"user": user});
    }
}

exports.proImgUploading = async(req, res) => {
    let reqFile = req.files;
    if (!reqFile || Object.keys(reqFile).length === 0) {
        return returnApiJson(res, 0, "No file was selected");
    } else {
        let storagePath, imgExt, fileName;
        storagePath = storageBasePath + "/users/";
        imgExt = reqFile.image.name.split('.').pop().toLowerCase();
        fileName = "user-" + Date.now() + randomNumber(1, 100000) + "." + imgExt;

        // save image on server
        reqFile.image.mv(storagePath + '/' + fileName, async function(err) {
            if (err) {
                return returnApiJson(res, 0, err);
            } else {
                let sessionData = req.session.user;
                sessionData.pro_img = fileName;
                await sessionData.save();
                let filePath = process.env.APP_URL+"/storage/users/"+fileName;
                return returnApiJson(res, 1, "Profile image updated successfully", {data: filePath});
            }
        });
    }
}

exports.resendEmailVerifingMail = async(req, res) => {
    let sessionData = req.session.user;
    if(sessionData.email_verified){
        return returnApiJson(res, 0, 'Email already verified.');
    }

    if(await emailVerifiedMail(sessionData)){
        return returnApiJson(res, 1, "Email verification mail sent to your email address.");
    } else {
        return returnApiJson(res, 0, "Something error in processing..");
    }
}

exports.verifingEmailOtp = async(req, res) => {
    let reqData = req.body;
    let rules = {
        otp_code: 'required',
      };
    let validation = new Validator(reqData, rules);
    if(validation.fails()){
        return returnApiJson(res, 2, "Validation errors", null, validation.errors.all());
    } else {
        let sessionData = req.session.user;
        if(sessionData.verification_token != reqData.otp_code){
            return returnApiJson(res, 0, 'OTP code was expired or not existed.');
        }
        if(sessionData.email_verified){
            return returnApiJson(res, 1, 'Email already verified.');
        }
        sessionData.email_verified = 1;
        sessionData.verification_token = "";
        await sessionData.save();
        return returnApiJson(res, 1, "Email verified successfully.");
    }
}

exports.updateSetting = async (req, res) => {
    let reqData = req.body;
    let rules = {
        currency: 'required',
        language: 'required',
        push_notification: 'required',
      };
    let validation = new Validator(reqData, rules);
    if(validation.fails()){
        return returnApiJson(res, 2, "Validation errors", null, validation.errors.all());
    } else {
        let sessionData = req.session.user;

        sessionData.currency = reqData.currency;
        sessionData.language = reqData.language;
        sessionData.push_notification = reqData.push_notification;
        await sessionData.save();

        let user = userObj(sessionData);

        return returnApiJson(res, 1, "Setting updated successfully", {"user": user});
    }
}

exports.becomeHostRequest = async (req, res) => {
    let reqData = req.body;
    let rules = {
        host_title: 'required'
      };
    let validation = new Validator(reqData, rules);
    if(validation.fails()){
        return returnApiJson(res, 2, "Validation errors", null, validation.errors.all());
    } else {
        let sessionData = req.session.user;

        if(sessionData.host_access == 1){
            return returnApiJson(res, 0, "You are already host.");
        }

        sessionData.host_title = reqData.host_title;
        sessionData.host_access = 1;
        await sessionData.save();

        let user = userObj(sessionData);

        return returnApiJson(res, 1, "You are successfully become host.", {"user": user});
    }
}