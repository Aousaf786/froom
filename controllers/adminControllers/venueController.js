const moment = require("moment");
const mongoose = require('mongoose');
const Validator = require('validatorjs');
const ejs = require('ejs');
const { returnJson, capitalizeWord, sendEmailSendGrid } = require('../../includes/functions');
const VenueModel = require("../../models/venues");

exports.listingAccordingFilterPage = async (req, res) => {
    let filter = req.params.filter;
    if (filter != "pending" && filter != "active" && filter != "all") {
        return res.status(404).render('errors/404');
    } else {
        let filterTxt = capitalizeWord(filter);
        var passDataToView = {
            page_title: filterTxt + " Venue Listing",
            adminSession: req.session.admin,
            sidebarActive: "Venues",
            childSidebarActive: filterTxt + " Venue",
            sectionTitle: filterTxt,
        };
        let condQuery = {};
        if(filter == "pending"){
            condQuery.status = 0;
        } else if(filter == "active"){
            condQuery.status = 1;
        }
        passDataToView.records = await VenueModel.find(condQuery).sort({createdAt: "desc"}).populate("user_id", "first_name last_name");
        passDataToView.moment = moment;
        passDataToView.DATE_FORMAT = process.env.DATE_FORMAT;

        return res.render("admin/venues/listing", passDataToView);
    }
}

exports.editVenuePage = async (req, res) => {
    var passDataToView = {
        page_title: "Edit Venue",
        adminSession: req.session.admin,
        sidebarActive: "Venues",
        childSidebarActive: "",
        sectionTitle: "Edit Venue",
    };
    // check user id is object id or not
    if(!mongoose.Types.ObjectId.isValid(req.params.id)){
        return res.status(404).render('errors/404');
    } else {
        let record = await VenueModel.findById(req.params.id).populate("user_id", "first_name last_name");
        if(!record){
            return res.status(404).render('errors/404');
        } else {
            passDataToView.recordDetail = record;
            passDataToView.moment = moment;
            passDataToView.DATE_FORMAT = process.env.DATE_FORMAT;
            return res.render("admin/venues/edit", passDataToView);
        }
    }
}

exports.updateVenueRequest = async (req, res) => {
    let reqData = req.body;
    let rules = {
        venue_id: 'required',
        title: 'required',
        type_of_event_room: 'required',
        price: 'required',
    };
    let validation = new Validator(reqData, rules);
    if (validation.fails()) {
        return returnJson(res, 2, "Validation errors", [], validation.errors.all(), 422);
    } else {
        let venueId = reqData.venue_id;
        if(!mongoose.Types.ObjectId.isValid(venueId)){
            return returnJson(res, 0, "Venue not found.");
        }
        
        currentVenue = await VenueModel.findById(venueId).populate("user_id", "first_name email");
        if(!currentVenue){
            return returnJson(res, 0, "Venue not found.");
        }
        let oldStatus = currentVenue.status;
        currentVenue.title = reqData.title;
        currentVenue.type_of_event_room = reqData.type_of_event_room;
        currentVenue.description = reqData.description;
        currentVenue.min_people_limit = reqData.min_people_limit;
        currentVenue.max_people_limit = reqData.max_people_limit;
        currentVenue.status = reqData.status;
        currentVenue.price = reqData.price;
        currentVenue.publicly_show = (reqData.publicly_show)? 1: 0;
        await currentVenue.save();

        if(oldStatus == 0 && reqData.status == 1){
            // email base path is global variable
            ejs.renderFile(emailBasePath + '/venueApprovedMail.ejs', {title: currentVenue.title, name: currentVenue.user_id.first_name}, {}, async(err, str) => {
                if (err) {
                    console.log(err);
                    currentVenue.status = 0;
                    await currentVenue.save();
                    return returnJson(res, 1, "Status is not updated, Please try again");
                } else {
                    sendEmailSendGrid(currentVenue.user_id.email, "Venue Approved Mail", str);
                }
            });
        }

        return returnJson(res, 1, "Venue updated successfully");
    }
}