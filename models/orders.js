const mongoose = require("mongoose");
const { Schema } = mongoose;

const OrderSchema = new mongoose.Schema({
    service: { 
        type: Schema.Types.ObjectId,
        ref: "Service",
        required: true,
    },
    user_id: { 
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    vendor_id: { 
        type: Schema.Types.ObjectId,
        ref: "Vendor",
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    notes: {
        type: String,
        default: "",
    },
    location: {
        type: { type: String },
        coordinates: []
    },
    status: {
        type: Number,
        default: 0
    },
    status_history: {
        type: [{status: Number, msg: String, time: Date}],
        default: []
    },
}, 
{ timestamps: true } );

module.exports = mongoose.model("Order", OrderSchema);

/*
    Order status mean
    0 = Pending request vendor to customer
    1 = Order assign
    2 = Cancel vendor request
    3 = Order started by vendor
    4 = Order completed by vendor
    5 = Order approved by customer
    6 = Order rejected by customer
    7 = Order cancelled by vendor
    8 = Order cancelled by customer
*/