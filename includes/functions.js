const e = require("express");
const sgMail = require('@sendgrid/mail');

exports.returnJson = (res, code, message, data = [], error = [], statusCode = 200) => {
    res.status(statusCode).json({
        code : code,
        message: message,
        data : data,
        errors : error,
    });
}

exports.returnApiJson = (res, code, message, data = null, error = null, statusCode = 200) => {
    res.status(statusCode).json({
        code : code,
        message: message,
        data : data,
        errors : error,
    });
}

exports.checkAdminSession = (req) => {
    return new Promise(resolve => {
        if(req.session.admin){
            resolve(true);
        } else {
            resolve(false);
        }
        return;
    });
}

exports.randomStringGen = (unique) => {
    let bufferVal = Buffer.from("'"+unique+"'");
    return Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10)+bufferVal.toString("base64");
}
 
exports.randomNumber = (min, max) => { 
    return Math.floor(Math.random() * (max - min) + min);
}

exports.capitalizeWord = (text) => {
    return text.replace(/(^\w|\s\w)(\S*)/g, (_,m1,m2) => m1.toUpperCase()+m2.toLowerCase());
}

exports.currencyFormat = (digit) => {
    digit = (digit == null)? 0: digit;
    digit = parseInt(digit);
	if (digit >= 1000000000) {
        return (digit/ 1000000000).toFixed(1) + 'G';
    }
    if (digit >= 1000000) {
        return (digit/ 1000000).toFixed(1) + 'M';
    }
    if (digit >= 1000) {
        return (digit/ 1000).toFixed(1) + 'K';
    }
    return digit;
}

exports.numberFormat = (num) => {
    return num.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
}

exports.findReplaceStr = (string, find, replace) => {
    return string.split(find).join(replace);
}

exports.sendEmailSendGrid = (emailTo, emailSubj, emailTxt) => {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    const msg = {
        to: emailTo, // Change to your recipient
        from: process.env.MAIL_FROM_ADDRESS, // Change to your verified sender
        subject: emailSubj,
        html: emailTxt,
      }

    return new Promise(resolve => {
        sgMail.send(msg).then(() => {
            console.log('Email sent');
            resolve(true);
        }).catch((error) => {
            console.error(error);
            resolve(false);
        });
    });
}

exports.pushNotiPayload = (title, message, image = "", sound = "default", data = []) => {
    let dataBody = {
        "title" : title,
        "message" : message,
        "image" : image,
        "data" : data
    }

    let dataNoti = {
        "title" : title,
        "body" : message,
        "sound": sound,
        "image" : image,
        "data" : data
    }
    return {
        "dataBody": dataBody,
        "dataNoti": dataNoti
    }
}

exports.sendPushNoti = (fcmTokens, dataBody, dataNoti) => {
    // Send the HTTP request to the firebase
    axios({
        method: 'post',
        url: "https://fcm.googleapis.com/fcm/send",
        headers: { 'Authorization': 'key='+process.env.FIREBASE_SERVER_KEY, 'Content-Type': 'application/json' },
        data: {
            "registration_ids" :  fcmTokens,
            "priority" : "high",
            "content_available" : true,
            "mutable_content" : true,
            "notification" : dataNoti,
            "data" : dataBody
        },
    }).then(function (response) {
        //console.log(response);
        if(response.data.success > 0){
            return true;
        } else {
            return false;
        }
    })
    .catch(function (error) {
        console.log(error.message);
        return false;
    });
}

exports.sendSMS = (toNumbr, msgBody) => {
    const twilioAccSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioClient = require('twilio')(twilioAccSid, twilioAuthToken);
    
    return new Promise(resolve => {
        twilioClient.messages.create({ 
            messagingServiceSid: '',      
            to: toNumbr,
            body: msgBody,  
        }).then(function(message){
            console.log(message.sid);
            resolve(true);
        });
    });
}

exports.countryList = () => {
    return [
        "Afghanistan",
        "Aland Islands",
        "Albania",
        "Algeria",
        "American Samoa",
        "Andorra",
        "Angola",
        "Anguilla",
        "Antarctica",
        "Antigua and Barbuda",
        "Argentina",
        "Armenia",
        "Aruba",
        "Australia",
        "Austria",
        "Azerbaijan",
        "Bahamas",
        "Bahrain",
        "Bangladesh",
        "Barbados",
        "Belarus",
        "Belgium",
        "Belize",
        "Benin",
        "Bermuda",
        "Bhutan",
        "Bolivia",
        "Bonaire, Sint Eustatius and Saba",
        "Bosnia and Herzegovina",
        "Botswana",
        "Bouvet Island",
        "Brazil",
        "British Indian Ocean Territory",
        "Brunei Darussalam",
        "Bulgaria",
        "Burkina Faso",
        "Burundi",
        "Cambodia",
        "Cameroon",
        "Canada",
        "Cape Verde",
        "Cayman Islands",
        "Central African Republic",
        "Chad",
        "Chile",
        "China",
        "Christmas Island",
        "Cocos (Keeling) Islands",
        "Colombia",
        "Comoros",
        "Congo",
        "Congo, Democratic Republic of the Congo",
        "Cook Islands",
        "Costa Rica",
        "Cote D'Ivoire",
        "Croatia",
        "Cuba",
        "Curacao",
        "Cyprus",
        "Czech Republic",
        "Denmark",
        "Djibouti",
        "Dominica",
        "Dominican Republic",
        "Ecuador",
        "Egypt",
        "El Salvador",
        "Equatorial Guinea",
        "Eritrea",
        "Estonia",
        "Ethiopia",
        "Falkland Islands (Malvinas)",
        "Faroe Islands",
        "Fiji",
        "Finland",
        "France",
        "French Guiana",
        "French Polynesia",
        "French Southern Territories",
        "Gabon",
        "Gambia",
        "Georgia",
        "Germany",
        "Ghana",
        "Gibraltar",
        "Greece",
        "Greenland",
        "Grenada",
        "Guadeloupe",
        "Guam",
        "Guatemala",
        "Guernsey",
        "Guinea",
        "Guinea-Bissau",
        "Guyana",
        "Haiti",
        "Heard Island and Mcdonald Islands",
        "Holy See (Vatican City State)",
        "Honduras",
        "Hong Kong",
        "Hungary",
        "Iceland",
        "India",
        "Indonesia",
        "Iran, Islamic Republic of",
        "Iraq",
        "Ireland",
        "Isle of Man",
        "Israel",
        "Italy",
        "Jamaica",
        "Japan",
        "Jersey",
        "Jordan",
        "Kazakhstan",
        "Kenya",
        "Kiribati",
        "Korea, Democratic People's Republic of",
        "Korea, Republic of",
        "Kosovo",
        "Kuwait",
        "Kyrgyzstan",
        "Lao People's Democratic Republic",
        "Latvia",
        "Lebanon",
        "Lesotho",
        "Liberia",
        "Libyan Arab Jamahiriya",
        "Liechtenstein",
        "Lithuania",
        "Luxembourg",
        "Macao",
        "Macedonia, the Former Yugoslav Republic of",
        "Madagascar",
        "Malawi",
        "Malaysia",
        "Maldives",
        "Mali",
        "Malta",
        "Marshall Islands",
        "Martinique",
        "Mauritania",
        "Mauritius",
        "Mayotte",
        "Mexico",
        "Micronesia, Federated States of",
        "Moldova, Republic of",
        "Monaco",
        "Mongolia",
        "Montenegro",
        "Montserrat",
        "Morocco",
        "Mozambique",
        "Myanmar",
        "Namibia",
        "Nauru",
        "Nepal",
        "Netherlands",
        "Netherlands Antilles",
        "New Caledonia",
        "New Zealand",
        "Nicaragua",
        "Niger",
        "Nigeria",
        "Niue",
        "Norfolk Island",
        "Northern Mariana Islands",
        "Norway",
        "Oman",
        "Pakistan",
        "Palau",
        "Palestinian Territory, Occupied",
        "Panama",
        "Papua New Guinea",
        "Paraguay",
        "Peru",
        "Philippines",
        "Pitcairn",
        "Poland",
        "Portugal",
        "Puerto Rico",
        "Qatar",
        "Reunion",
        "Romania",
        "Russian Federation",
        "Rwanda",
        "Saint Barthelemy",
        "Saint Helena",
        "Saint Kitts and Nevis",
        "Saint Lucia",
        "Saint Martin",
        "Saint Pierre and Miquelon",
        "Saint Vincent and the Grenadines",
        "Samoa",
        "San Marino",
        "Sao Tome and Principe",
        "Saudi Arabia",
        "Senegal",
        "Serbia",
        "Serbia and Montenegro",
        "Seychelles",
        "Sierra Leone",
        "Singapore",
        "Sint Maarten",
        "Slovakia",
        "Slovenia",
        "Solomon Islands",
        "Somalia",
        "South Africa",
        "South Georgia and the South Sandwich Islands",
        "South Sudan",
        "Spain",
        "Sri Lanka",
        "Sudan",
        "Suriname",
        "Svalbard and Jan Mayen",
        "Swaziland",
        "Sweden",
        "Switzerland",
        "Syrian Arab Republic",
        "Taiwan, Province of China",
        "Tajikistan",
        "Tanzania, United Republic of",
        "Thailand",
        "Timor-Leste",
        "Togo",
        "Tokelau",
        "Tonga",
        "Trinidad and Tobago",
        "Tunisia",
        "Turkey",
        "Turkmenistan",
        "Turks and Caicos Islands",
        "Tuvalu",
        "Uganda",
        "Ukraine",
        "United Arab Emirates",
        "United Kingdom",
        "United States",
        "United States Minor Outlying Islands",
        "Uruguay",
        "Uzbekistan",
        "Vanuatu",
        "Venezuela",
        "Viet Nam",
        "Virgin Islands, British",
        "Virgin Islands, U.s.",
        "Wallis and Futuna",
        "Western Sahara",
        "Yemen",
        "Zambia",
        "Zimbabwe"
    ];
}