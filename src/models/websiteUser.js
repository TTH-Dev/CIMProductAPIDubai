import mongoose from "mongoose";


const websiteUSerSchema = new mongoose.Schema({

    name : {
        type : String,
        required : true
    },
    phoneNo : {
        type : String,
        required : true
    },
},{timestamps:true});

const WebsiteUser = mongoose.model("WebsiteUser",websiteUSerSchema);
export default WebsiteUser;