const TokenService = require('../../includes/twilioServiceToken');

exports.chatInboxPage = (req, res) => {
    var passDataToView = {
        page_title: "My Inbox",
        adminSession: req.session.admin,
        sidebarActive: "Chats",
        childSidebarActive: "",
        sectionTitle: "My Inbox",
    };
    
    res.render("admin/chats/index", passDataToView);
}

exports.getServiceToken = (req, res) => {
    let user = req.session.admin;
    var identity = "admin_"+user._id;
    var token = TokenService.generate(identity)

    res.json({
        identity: identity,
        token: token,
    });
}