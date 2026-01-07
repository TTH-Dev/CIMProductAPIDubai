import mongoose from "mongoose";

const testedBySchema = new mongoose.Schema({
    testedBy: { type: [String] },
    organizationId:{
      type:String,
      required:true
    }
    ,
        branch: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Branch",
        },
});

const TestedBy = mongoose.model("TestedBy", testedBySchema);

export default TestedBy;