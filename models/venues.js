const mongoose = require("mongoose");
const { Schema } = mongoose;

const VenueSchema = new mongoose.Schema({
    user_id: { 
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        default: "",
    },
    type_of_event_room: {
        type: String,
        required: true,
    },
    min_people_limit: {
        type: Number,
        default: ""
    },
    max_people_limit: {
        type: Number,
        default: ""
    },
    address: {
        type: String,
        required: true,
    },
    location: {
        type: { type: String },
        coordinates: []
    },
    image: {
        type: String,
        default: "",
    },
    gallery_images: {
        type: [String],
        default: []
    },
    amenities: {
        type: [String],
        default: []
    },
    price: {
        type: Number,
        required: true,
    },
    publicly_show: {
        type: Number,
        default: 1
    },
    status: {
        type: Number,
        default: 0
    },
}, 
{ timestamps: true } );

VenueSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Venue", VenueSchema);