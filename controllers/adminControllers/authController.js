const bcrypt = require('bcrypt');
const Validator = require('validatorjs');
const { returnJson } = require('../../includes/functions');
const UserModel = require("../../models/users");

exports.loginPage = async (req, res) => {
    var passDataToView = {
        page_title: "Admin Login Page",
    };
    return res.render("admin/auth/login", passDataToView);
}

exports.loginRequest = async (req, res) => {
    let reqData = req.body;
    let rules = {
        email: 'required|email',
        password: 'required',
      };
    let validation = new Validator(reqData, rules);
    if(validation.fails()){
        return returnJson(res, 2, "Validation errors", [], validation.errors.all(), 422);
    } else {
        let user = await UserModel.findOne({email: reqData.email, status: 1, admin_access: 1});
        if (!user) {
            return returnJson(res, 0, "Invalid email or password", [], [], 401);
        } else {
            bcrypt.compare(reqData.password, user.password).then((pasResult) => {
                if(pasResult){
                    req.session.admin = user;
                    return returnJson(res, 1, "Login successfully");
                } else {
                    return returnJson(res, 0, "Invalid email or password", [], [], 401);
                }
            });
        }
    }
}

exports.logoutRequest = (req, res) => {
    req.session.admin = null;
    return res.redirect('/admin/login');
}