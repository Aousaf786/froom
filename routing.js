const express = require("express");
const Router = express.Router();

// admin routing path
const adminAuthPages = require("./routes/admin/auth");
const adminDashboardPages = require("./routes/admin/dashboard");
const adminUserPages = require("./routes/admin/users");
const adminVenuePages = require("./routes/admin/venues");
/*const adminChatPages = require("./routes/admin/chats");*/

// guest api routing path
const guestApiAuthRequests = require("./routes/guest/auth");
const guestApiDashboardRequests = require("./routes/guest/dashboard");
const guestApiHelperRequests = require("./routes/guest/helper");
const guestApiVenueRequests = require("./routes/guest/venues");
//const guestApiChatRequests = require("./routes/guest/chats");

// host api routing path
const hostApiVenueRequests = require("./routes/host/venues");

// front site routing
Router.get('/', (req, res) => {
    res.redirect('/admin');
});

// admin routings
Router.use('/admin', adminAuthPages);
Router.use('/admin', adminDashboardPages);
Router.use('/admin/users', adminUserPages);
Router.use('/admin/venues', adminVenuePages);
//Router.use('/admin/chats', adminChatPages);

// guest api routings
Router.use('/api/v1/guest', guestApiAuthRequests);
Router.use('/api/v1/guest', guestApiDashboardRequests);
Router.use('/api/v1/guest', guestApiHelperRequests);
Router.use('/api/v1/guest', guestApiVenueRequests);
//Router.use('/api/v1/guest', guestApiChatRequests);

// host api routings
Router.use('/api/v1/host', hostApiVenueRequests);

module.exports = Router;