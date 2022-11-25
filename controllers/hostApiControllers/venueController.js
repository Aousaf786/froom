const Validator = require('validatorjs');
const mongoose = require('mongoose');
const fs = require('fs-extra');

const { returnApiJson, randomNumber } = require('../../includes/functions');
const { venueObj } = require('../../includes/helperObjs');
const VenueModel = require("../../models/venues");

exports.createVenueInList = async (req, res) => {
    let reqData = req.body;
    let rules = {
        title: 'required',
        type_of_event_room: 'required',
        address: 'required',
        lat: 'required',
        long: 'required',
        image: 'required',
        gallery_images: 'present|array',
        amenities: 'present|array',
        price: 'required'
      };
    let validation = new Validator(reqData, rules);
    if(validation.fails()){
        return returnApiJson(res, 2, "Validation errors", null, validation.errors.all());
    } else {
        let sessionData = req.session.host;
        let dataObj = { "title": reqData.title, "description": reqData.description, "type_of_event_room": reqData.type_of_event_room, "user_id": sessionData._id, "min_people_limit": reqData.min_people_limit, "max_people_limit": reqData.max_people_limit, "address": reqData.address, "location": {"type": "Point", "coordinates": [reqData.long, reqData.lat]}, "image": reqData.image, "gallery_images": reqData.gallery_images, "amenities": reqData.amenities, "price": reqData.price }
        let venueCreate = new VenueModel(dataObj);
        venueCreate.save(async (err, data) => {
            if(err){
                console.log(err);
                return returnApiJson(res, 0, "Something error");
            } else {
                return returnApiJson(res, 1, "Thank you for your submission. Our team will notify you once it is reviewed.");
            }
        });
    }
}

exports.getAllMyVenueList = async(req, res) => {
    let sessionData = req.session.host;
    let records = await VenueModel.find({user_id: sessionData._id}).sort({createdAt: "desc"});
    let retData = [];
    records.forEach(element => {
        retData.push(venueObj(element));
    });
    return returnApiJson(res, 1, "Success", { "data": retData });
}

exports.getMyVenueList = async(req, res) => {
    let filter = req.params.filter;
    let queryStatus = 1;
    if(filter == "pending"){
        queryStatus = 0;
    }
    let sessionData = req.session.host;
    let records = await VenueModel.find({status: queryStatus, user_id: sessionData._id}).sort({createdAt: "desc"});
    let retData = [];
    records.forEach(element => {
        retData.push(venueObj(element));
    });
    return returnApiJson(res, 1, "Success", { "data": retData });
}

exports.updateVenue = async (req, res) => {
    let reqData = req.body;
    let rules = {
        id: 'required',
        title: 'required',
        type_of_event_room: 'required',
        address: 'required',
        lat: 'required',
        long: 'required',
        amenities: 'present|array',
        price: 'required'
      };
    let validation = new Validator(reqData, rules);
    if(validation.fails()){
        return returnApiJson(res, 2, "Validation errors", null, validation.errors.all());
    } else {
        if(!mongoose.Types.ObjectId.isValid(reqData.id)){
            return returnApiJson(res, 0, 'Venue id not found.');
        }
        let sessionData = req.session.host;
        let record = await VenueModel.findOne({_id: reqData.id, user_id: sessionData._id});
        if (!record) {
            return returnApiJson(res, 0, 'Venue not found.');
        }
        record.title = reqData.title;
        record.description = reqData.description;
        record.type_of_event_room = reqData.type_of_event_room;
        record.min_people_limit = reqData.min_people_limit;
        record.max_people_limit = reqData.max_people_limit;
        record.address = reqData.address;
        record.location.coordinates = [reqData.long, reqData.lat];
        record.amenities = reqData.amenities;
        record.price = reqData.price;
        record.status = 0;
        await record.save();

        return returnApiJson(res, 1, "Thank you for your submission. Our team will notify you once it is reviewed.");
    }
}

exports.updateVenuePublicVisibility = async (req, res) => {
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
        let sessionData = req.session.host;
        let record = await VenueModel.findOne({_id: reqData.id, user_id: sessionData._id});
        if (!record) {
            return returnApiJson(res, 0, 'Venue not found.');
        }
        record.publicly_show = (record.publicly_show)? 0: 1;
        await record.save();

        return returnApiJson(res, 1, "Venue visibility updated.", {publicly_show: record.publicly_show});
    }
}

exports.updateVenueImage = async(req, res) => {
    let reqFile = req.files;
    if (!reqFile || Object.keys(reqFile).length === 0) {
        return returnApiJson(res, 0, "No file was selected");
    }
    let reqData = req.body;
    let rules = {
        id: 'required',
        type: 'required',
      };
    let validation = new Validator(reqData, rules);
    if(validation.fails()){
        return returnApiJson(res, 2, "Validation errors", null, validation.errors.all());
    } else {
        if(!mongoose.Types.ObjectId.isValid(reqData.id)){
            return returnApiJson(res, 0, 'Venue id not found.');
        }
        let sessionData = req.session.host;
        let record = await VenueModel.findOne({_id: reqData.id, user_id: sessionData._id});
        if (!record) {
            return returnApiJson(res, 0, 'Venue not found.');
        }
        let storagePath, imgExt, fileName, filePath, oldImg;
        if(reqData.type == "venue_main_img" || reqData.type == "venue_gallery_img"){
            storagePath = storageBasePath + "/venues/";
            imgExt = reqFile.image.name.split('.').pop().toLowerCase();
            fileName = "venue-" + Date.now() + randomNumber(1, 100000) + "." + imgExt;
            filePath = process.env.APP_URL+"/storage/venues/"+fileName;
        }
        // save image on server
        reqFile.image.mv(storagePath + '/' + fileName, async function(err) {
            if (err) {
                return returnApiJson(res, 0, err);
            } else {
                if(reqData.type == "venue_main_img"){
                    oldImg = record.image;
                    // remove old image if exist
                    if(oldImg){
                        fs.unlink(storagePath + '/' + oldImg, (err) => {
                            if (err) {
                                console.log(err);
                            }
                        });
                    }
                    record.image = fileName;
                    await record.save();
                }
                if(reqData.type == "venue_gallery_img"){
                    record.gallery_images.push(fileName);
                    await record.save();
                }
                return returnApiJson(res, 1, "Venue image updated successfully", {path: filePath, file: fileName});
            }
        });
    }
}

exports.venueImgDelete = async(req, res) => {
    let reqData = req.body;
    let rules = {
        id: 'required',
        file: 'required',
      };
    let validation = new Validator(reqData, rules);
    if(validation.fails()){
        return returnApiJson(res, 2, "Validation errors", null, validation.errors.all());
    } else {
        if(!mongoose.Types.ObjectId.isValid(reqData.id)){
            return returnApiJson(res, 0, 'Venue id not found.');
        }
        let sessionData = req.session.host;
        let record = await VenueModel.findOne({_id: reqData.id, user_id: sessionData._id, gallery_images: reqData.file});
        if (!record) {
            return returnApiJson(res, 0, 'Venue/image not found.');
        }
        fileName = reqData.file;
        // remove old image if exist
        if(fileName){
            let storagePath = storageBasePath + "/venues/";
            fs.unlink(storagePath + '/' + fileName, (err) => {
                if (err) {
                    console.log(err);
                }
            });
        }
        record.gallery_images.pull(fileName);
        await record.save();
        return returnApiJson(res, 1, "Venue image deleted successfully");
    }
}