import mongoose from "mongoose";


const temperatureMonitorSchema = new mongoose.Schema({
   organizationId:{
      type:String,
      required:true
    },
 
        branch: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Branch",
        },
    employeeName : {
        type : String
    },
    placeName : {
        type : String
    },
    Celsius : {
        type : String
    },
    temperatureMonitorDate : {
        type : String
    },
    temperatureMonitorTime : {
        type : String
    }
 },
{timestamps:true});


const TemperatureMonitor = mongoose.model("TemperatureMonitor", temperatureMonitorSchema);

export default TemperatureMonitor;