const mongoose = require("mongoose");
const { Schema } = mongoose;

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        default: "",
        lowercase: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    fcm_token: {
        type: String,
        default: "",
    },
    api_token: {
        type: String,
        required: true,
    },
    first_name: {
        type: String,
        default: "",
    },
    last_name: {
        type: String,
        default: "",
    },
    phone_number: {
        type: String,
        default: "",
    },
    email_verified:{
        type: Number,
        default: 0
    },
    status: {
        type: Number,
        default: 1
    },
    verification_token: {
        type: String,
        default: ""
    },
    guest_access: {
        type: Number,
        default: 1
    },
    admin_access: {
        type: Number,
        default: 0
    },
    host_access: {
        type: Number,
        default: 0
    },
    location: {
        type: { type: String },
        coordinates: []
    },
    dob: {
        type: Date,
        default: "",
    },
    pro_img: {
        type: String,
        default: "",
    },
    gender: {
        type: String,
        default: "",
    },
    country: {
        type: String,
        default: "",
    },
    city: {
        type: String,
        default: "",
    },
    address: {
        type: String,
        default: "",
    },
    zip_code: {
        type: String,
        default: "",
    },
    host_title: {
        type: String,
        default: "",
    },
    about_me: {
        type: String,
        default: "",
    },
    currency: {
        type: String,
        default: "Dollar",
    },
    language: {
        type: String,
        default: "English",
    },
    push_notification: {
        type: Number,
        default: 1
    },
    favrt_venues: [
        {
            type: Schema.Types.ObjectId,
            ref: "Venue",
        }
    ],
}, 
{ timestamps: true } );

UserSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("User", UserSchema);