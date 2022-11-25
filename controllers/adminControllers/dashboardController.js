const moment = require("moment");
const { countryList } = require('../../includes/functions');
const UserModel = require("../../models/users");
const VenueModel = require("../../models/venues");

exports.dashboardPage = async (req, res) => {
    var passDataToView = {
        page_title: "Dashboard",
        adminSession: req.session.admin,
        sidebarActive: "Dashboard",
        childSidebarActive: "",
        sectionTitle: "Dashboard",
    };
    passDataToView.adminCount = await UserModel.countDocuments({ admin_access: 1 });
    passDataToView.guestCount = await UserModel.countDocuments({ guest_access: 1 });
    passDataToView.hostCount = await UserModel.countDocuments({ host_access: 1 });
    passDataToView.pendingVenueCount = await VenueModel.countDocuments({ status: 0 });
    passDataToView.approvedVenueCount = await VenueModel.countDocuments({ status: 1 });
    
    return res.render("admin/dashboard/index", passDataToView);
}

exports.editProfilePage = (req, res) => {
    var passDataToView = {
        page_title: "My Profile",
        adminSession: req.session.admin,
        sidebarActive: "Users",
        childSidebarActive: "",
        sectionTitle: "My Profile",
    };
    passDataToView.userDetail = req.session.admin;
    passDataToView.moment = moment;
    passDataToView.DATE_FORMAT = process.env.DATE_FORMAT;
    passDataToView.countryList = countryList();
    return res.render("admin/users/edit", passDataToView);
}