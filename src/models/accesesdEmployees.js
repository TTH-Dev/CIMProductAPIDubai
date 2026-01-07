import mongoose from "mongoose";

const accessSchema = new mongoose.Schema({

    email: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    accessModules : {
        type : [String]
    }
},
{timestamps:true});

const Access = mongoose.model("Access", accessSchema);

export default Access;