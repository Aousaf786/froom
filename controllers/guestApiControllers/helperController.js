const { returnApiJson, randomNumber } = require('../../includes/functions');

exports.imageUploading = async(req, res) => {
    let reqFile = req.files;
    let reqType = req.body.type;
    if(reqType == ""){
        return returnApiJson(res, 0, "Type is empty");
    }
    if (!reqFile || Object.keys(reqFile).length === 0) {
        return returnApiJson(res, 0, "No file was selected");
    } else {
        let storagePath, imgExt, fileName, filePath;
        if(reqType == "venue_img"){
            storagePath = storageBasePath + "/venues/";
            imgExt = reqFile.image.name.split('.').pop().toLowerCase();
            fileName = "venue-" + Date.now() + randomNumber(1, 100000) + "." + imgExt;
            filePath = process.env.APP_URL+"/storage/venues/"+fileName;
        }
        // save image on server
        reqFile.image.mv(storagePath + '/' + fileName, function(err) {
            if (err) {
                return returnApiJson(res, 0, err);
            } else {
                return returnApiJson(res, 1, "Profile image updated successfully", {path: filePath, file: fileName});
            }
        });
    }
}