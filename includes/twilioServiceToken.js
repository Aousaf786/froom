const twilio = require('twilio');

const AccessToken = twilio.jwt.AccessToken;
const ChatGrant = AccessToken.ChatGrant;

TokenGenerator = (identity) => {

  // Create a "grant" which enables a client to use Chat as a given user
  const chatGrant = new ChatGrant({
    serviceSid: process.env.TWILIO_CHAT_SERVICE_SID,
  });

  // Create an access token which we will sign and return to the client,
  // containing the grant we just created
  const token = new AccessToken(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_API_SID,
    process.env.TWILIO_API_SECRET,
    {identity: identity}
  );

  token.addGrant(chatGrant);

  return token.toJwt();
}

module.exports = { generate: TokenGenerator };