const Validator = require('validatorjs');
const mongoose = require('mongoose');

const { returnApiJson } = require('../../includes/functions');
const { otherVenueListObj, otherVenueObj } = require('../../includes/helperObjs');
const VenueModel = require("../../models/venues");

exports.dashboardVenues = async(req, res) => {
    // get random records with reference table
    let records = await VenueModel.aggregate([ { $match: {status: 1, publicly_show: 1} } , { $sample: { size : 6 } }, {$lookup: {from: "users", localField: "user_id", foreignField: "_id", as: "user"}}, { $match: {"user.status": 1} }, {$unwind: '$user'} ]);
    let retData = {"main": null, "featured": []};
    records.forEach((element, index) => {
        if(index == 0){
            retData.main = otherVenueListObj(element, false);
        } else {
            retData.featured.push(otherVenueListObj(element, false));
        }
    });
    return returnApiJson(res, 1, "Success", { "data": retData });
}

exports.addVenueInFavrt = async(req, res) => {
    let reqData = req.body;
    let rules = {
        id: 'required',
      };
    let validation = new Validator(reqData, rules);
    if(validation.fails()){
        return returnApiJson(res, 2, "Validation errors", null, validation.errors.all());
    } else {
        if(!mongoose.Types.ObjectId.isValid(reqData.id)){
            return returnApiJson(res, 0, 'Venue id not found.');
        }
        let sessionData = req.session.user;
        if(sessionData.favrt_venues && sessionData.favrt_venues.includes(reqData.id)){
            return returnApiJson(res, 0, 'Venue already added in favourite list.');
        }
        sessionData.favrt_venues.push(reqData.id);
        await sessionData.save();

        return returnApiJson(res, 1, "Venue added in favourite list.");
    }
}

exports.removeVenueFromFavrt = async(req, res) => {
    let reqData = req.body;
    let rules = {
        id: 'required',
      };
    let validation = new Validator(reqData, rules);
    if(validation.fails()){
        return returnApiJson(res, 2, "Validation errors", null, validation.errors.all());
    } else {
        if(!mongoose.Types.ObjectId.isValid(reqData.id)){
            return returnApiJson(res, 0, 'Venue id not found.');
        }
        let sessionData = req.session.user;
        sessionData.favrt_venues.pull(reqData.id);
        await sessionData.save();

        return returnApiJson(res, 1, "Venue removed from favourite list.");
    }
}

exports.getFavrtVenues = async(req, res) => {
    let sessionData = req.session.user;
    let retData = [];
    if(sessionData.favrt_venues && sessionData.favrt_venues.length > 0){
        let records = await VenueModel.aggregate([ { $match: {_id: {$in: sessionData.favrt_venues}, status: 1, publicly_show: 1} }, {$lookup: {from: "users", localField: "user_id", foreignField: "_id", as: "user"}}, { $match: {"user.status": 1} }, {$unwind: '$user'} ]);
        records.forEach((element, index) => {
            retData.push(otherVenueListObj(element, false));
        });
    }

    return returnApiJson(res, 1, "Success", { "data": retData });
}

exports.getVenueDetail = async(req, res) => {
    let reqData = req.body;
    if(reqData.id == "" || !mongoose.Types.ObjectId.isValid(reqData.id)){
        return returnApiJson(res, 0, 'Venue id not found.');
    }
    // convert id too back object id
    reqData.id = mongoose.Types.ObjectId(reqData.id);

    let records = await VenueModel.aggregate([ { $match: {_id: reqData.id, status: 1, publicly_show: 1} }, {$limit: 1}, {$lookup: {from: "users", localField: "user_id", foreignField: "_id", as: "user"}}, { $match: {"user.status": 1} }, {$unwind: '$user'} ]);
    if(records.length == 0){
        return returnApiJson(res, 0, 'Venue not found.');
    }
    let returnObj = otherVenueObj(records[0], false);

    return returnApiJson(res, 1, "Success", { "data": returnObj });
}

exports.searchVenues = async(req, res) => {
    let reqData = req.body;
    if(reqData.min_price){

    }
    if(reqData.max_price){

    }
    if(reqData.min_guest_cap){

    }
    if(reqData.max_guest_cap){

    }
    let retData = [];
    let records = await VenueModel.aggregate([ { $match: {status: 1, publicly_show: 1} }, {$lookup: {from: "users", localField: "user_id", foreignField: "_id", as: "user"}}, { $match: {"user.status": 1} }, {$unwind: '$user'} ]);
    records.forEach((element, index) => {
        retData.push(otherVenueListObj(element, false));
    });

    return returnApiJson(res, 1, "Success", { "data": retData });
}