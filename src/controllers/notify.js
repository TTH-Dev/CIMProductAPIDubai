import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";
import Notify from "../models/notification.js";

export const getallNotifyById = catchAsync(async (req, res, next) => {
  if (!req.query.id) {
    return next(new AppError("ID is Missing", 404));
  }

  const data = await Notify.find({reciever:req.query.id,isRead:false});

  res.status(200).json({
    status: "Success",
    data,
  });
});



export const updateNotify = catchAsync(async (req, res, next) => {
  if (!req.query.notifyId) {
    return next(new AppError("ID is Missing", 404));
  }

  const data = await Notify.findByIdAndUpdate({_id:req.query.notifyId},{isRead:true});

  res.status(200).json({
    status: "Success",
    data,
  });
});


export const getAllNotify=catchAsync(async(req,res)=>{
  const data=await Notify.find({isRead:false})
    res.status(200).json({
    status: "Success",
    data,
  });
})