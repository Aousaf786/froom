const moment = require("moment");
const mongoose = require('mongoose');
const Validator = require('validatorjs');
const bcrypt = require('bcrypt');
const { returnJson, capitalizeWord, countryList } = require('../../includes/functions');
const UserModel = require("../../models/users");

exports.listingAccordingFilterPage = async (req, res) => {
    let filter = req.params.filter;
    if (filter != "admin" && filter != "guest" && filter != "host" && filter != "all") {
        return res.status(404).render('errors/404');
    } else {
        let filterTxt = capitalizeWord(filter);
        var passDataToView = {
            page_title: filterTxt + " Listing",
            adminSession: req.session.admin,
            sidebarActive: "Users",
            childSidebarActive: filterTxt,
            sectionTitle: filterTxt,
        };
        let condQuery = {};
        if(filter == "admin"){
            condQuery.admin_access = 1;
        } else if(filter == "guest"){
            condQuery.guest_access = 1;
        } else if(filter == "host"){
            condQuery.host_access = 1;
        }
        passDataToView.records = await UserModel.find(condQuery).sort({createdAt: "desc"});
        passDataToView.moment = moment;
        passDataToView.DATE_FORMAT = process.env.DATE_FORMAT;

        return res.render("admin/users/listing", passDataToView);
    }
}

exports.editUserPage = async (req, res) => {
    var passDataToView = {
        page_title: "Edit User",
        adminSession: req.session.admin,
        sidebarActive: "Users",
        childSidebarActive: "",
        sectionTitle: "Edit User",
    };
    // check user id is object id or not
    if(!mongoose.Types.ObjectId.isValid(req.params.id)){
        return res.status(404).render('errors/404');
    } else {
        let user = await UserModel.findById(req.params.id);
        if(!user){
            return res.status(404).render('errors/404');
        } else {
            passDataToView.userDetail = user;
            passDataToView.moment = moment;
            passDataToView.DATE_FORMAT = process.env.DATE_FORMAT;
            passDataToView.countryList = countryList();
            return res.render("admin/users/edit", passDataToView);
        }
    }
}

exports.updateUserRequest = async (req, res) => {
    let reqData = req.body;
    let rules = {
        user_id: 'required',
        first_name: 'required',
        last_name: 'required',
        email: 'required|email',
    };
    let validation = new Validator(reqData, rules);
    if (validation.fails()) {
        return returnJson(res, 2, "Validation errors", [], validation.errors.all(), 422);
    } else {
        let userId = reqData.user_id;
        if(!mongoose.Types.ObjectId.isValid(userId)){
            return returnJson(res, 0, "User not found.");
        }
        let user = await UserModel.findOne({
                    $and : [
                        { _id: {$ne: userId}, email: reqData.email}
                    ]
                });
        if (user) {
            return returnJson(res, 0, 'User already exists with this email.');
        }
        
        currentUser = await UserModel.findById(userId);
        if(!currentUser){
            return returnJson(res, 0, "User not found.");
        }
        currentUser.first_name = reqData.first_name;
        currentUser.last_name = reqData.last_name;
        currentUser.email = reqData.email;
        currentUser.phone_number = reqData.phone_number;
        currentUser.dob = reqData.dob;
        currentUser.status = reqData.status;
        currentUser.gender = reqData.gender;
        currentUser.country = reqData.country;
        currentUser.city = reqData.city;
        currentUser.address = reqData.address;
        currentUser.zip_code = reqData.zip_code;
        currentUser.about_me = reqData.about_me;
        
        let adminSession = req.session.admin;
        if(adminSession._id != userId){
            currentUser.admin_access = reqData.admin_access;
        }
        await currentUser.save();
        
        if(adminSession._id == userId){
            // update admin session
            adminSession.first_name = currentUser.first_name;
            adminSession.last_name = currentUser.last_name;
            adminSession.email = currentUser.email;
            adminSession.phone_number = currentUser.phone_number;
            adminSession.status = currentUser.status;
            adminSession.dob = currentUser.dob;
            adminSession.gender = currentUser.gender;
            adminSession.country = currentUser.country;
            adminSession.city = currentUser.city;
            adminSession.address = currentUser.address;
            adminSession.zip_code = currentUser.zip_code;
            adminSession.about_me = currentUser.about_me;
        }

        // password update
        if (reqData.password != "" && reqData.password != null) {
            bcrypt.hash(reqData.password, 12).then((hash) => {
                currentUser.password = hash;
                currentUser.save();
            });
        }
        return returnJson(res, 1, "User updated successfully");
    }
}