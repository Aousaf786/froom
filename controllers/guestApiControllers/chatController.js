const TokenService = require('../../includes/twilioServiceToken');
const { returnApiJson } = require('../../includes/functions');

exports.getServiceToken = (req, res) => {
    let user = req.session.customer;
    var identity = "customer_"+user._id;

    //var adminIdentity = "admin_629cf31d44ee1d72241b1a22";
    //var channelUniqueName = "chat_1_vs_"+user._id;
    //var channelFriendlyName = user.name+" ("+user.phone_number+")";

    var token = TokenService.generate(identity)

    return returnApiJson(res, 1, "Success", {
        identity: identity,
        token: token,
        //admin_identity: adminIdentity,
        //channel_unique_name: channelUniqueName,
        //channel_friendly_name: channelFriendlyName,
    });
}