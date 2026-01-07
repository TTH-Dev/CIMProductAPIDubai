import mongoose from "mongoose";
const consultingFeeItemSchema = new mongoose.Schema({
  feesType: { type: String, required: true },
  feesAmount: { type: Number, required: true }
})

const consultingFeesSchema = new mongoose.Schema({
    organizationId:{
        type:String,
        required:true
    },
    branch:{
      type:String
    },
    fees:[consultingFeeItemSchema]
   
}, { timestamps: true });



const ConsultingFees = mongoose.model("ConsultingFees", consultingFeesSchema);

export default ConsultingFees;