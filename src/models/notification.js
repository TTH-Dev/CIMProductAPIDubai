import mongoose from "mongoose";


const notifySchema = new mongoose.Schema({

    message: {
        type: String
    },
    isRead:{
        type:Boolean,
        default:false
    },
    reciever:{
        type:String
    }
  

}, { timestamps: true }
);

const Notify = mongoose.model("Notify", notifySchema);

export default Notify;