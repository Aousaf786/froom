exports.userObj = (user) => {
    // convert model document into a plain JavaScript object
    user = user.toObject();
    let proImg = (user.pro_img)? process.env.APP_URL+"/storage/users/"+user.pro_img: "";
    let dataObj = {id:user._id, first_name: user.first_name, last_name: user.last_name, email: user.email, phone_number: user.phone_number, api_token: user.api_token, dob: user.dob, pro_img: proImg, is_host: user.host_access, gender: user.gender, country: user.country, city: user.city, address: user.address, zip_code: user.zip_code, email_verified: user.email_verified, about_me: user.about_me, currency: user.currency, language: user.language, push_notification: user.push_notification}
    return dataObj;
}

exports.otherUserObj = (user) => {
    // convert model document into a plain JavaScript object
    user = user.toObject();
    let proImg = (user.pro_img)? process.env.APP_URL+"/storage/users/"+user.pro_img: "";
    let dataObj = {id:user._id, first_name: user.first_name, last_name: user.last_name, email: user.email, phone_number: user.phone_number, dob: user.dob, pro_img: proImg, is_host: user.host_access, gender: user.gender, country: user.country, city: user.city, address: user.address, zip_code: user.zip_code, about_me: user.about_me}
    return dataObj;
}

exports.venueObj = (venue) => {
    // convert model document into a plain JavaScript object
    venue = venue.toObject();
    let img = (venue.image)? process.env.APP_URL+"/storage/venues/"+venue.image: "";
    let galeryImgs = [];
    venue.gallery_images.forEach(element => {
        galeryImgs.push({"file": element, "path": process.env.APP_URL+"/storage/venues/"+element});
    });
    let dataObj = {id:venue._id, title: venue.title, description: venue.description, type_of_event_room: venue.type_of_event_room, min_people_limit: venue.min_people_limit, max_people_limit: venue.max_people_limit, address: venue.address, lat: venue.lat, long: venue.long, image: img, price: venue.price, status:venue.status, publicly_show: venue.publicly_show, gallery_images: galeryImgs, amenities: venue.amenities}
    return dataObj;
}

exports.otherVenueListObj = (venue, convertObj = true) => {
    if(convertObj){
        // convert model document into a plain JavaScript object
        venue = venue.toObject();
    }
    let img = (venue.image)? process.env.APP_URL+"/storage/venues/"+venue.image: "";
    let userImg = (venue.user.pro_img)? process.env.APP_URL+"/storage/users/"+venue.user.pro_img: "";
    let dataObj = {};
    dataObj.venue = {id:venue._id, title: venue.title, description: venue.description, address: venue.address, lat: venue.lat, long: venue.long, image: img, price: venue.price, rating: 0};
    dataObj.host = {id: venue.user._id, name: venue.user.first_name+" "+venue.user.last_name, pro_img: userImg};
    return dataObj;
}

exports.otherVenueObj = (venue, convertObj = true) => {
    if(convertObj){
        // convert model document into a plain JavaScript object
        venue = venue.toObject();
    }
    let img = (venue.image)? process.env.APP_URL+"/storage/venues/"+venue.image: "";
    let galeryImgs = [];
    venue.gallery_images.forEach(element => {
        galeryImgs.push(process.env.APP_URL+"/storage/venues/"+element);
    });
    let userImg = (venue.user.pro_img)? process.env.APP_URL+"/storage/users/"+venue.user.pro_img: "";
    let dataObj = {};
    dataObj.venue = {id:venue._id, title: venue.title, description: venue.description, type_of_event_room: venue.type_of_event_room, min_people_limit: venue.min_people_limit, max_people_limit: venue.max_people_limit, address: venue.address, lat: venue.lat, long: venue.long, image: img, price: venue.price, gallery_images: galeryImgs, amenities: venue.amenities, rating: 0};
    dataObj.host = {id: venue.user._id, name: venue.user.first_name+" "+venue.user.last_name, pro_img: userImg};
    dataObj.reviews = [];
    return dataObj;
}