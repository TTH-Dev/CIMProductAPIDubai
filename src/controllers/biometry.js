import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";
import APIFeatures from "../utils/ApiFeatures.js";
import Biometry from "../models/biometry.js";

export const createBiometry = catchAsync(async (req, res, next) => {

    const data = {
        biometryData: JSON.parse(req.body.biometryData),
        biometryWorkSheet: req.body.biometryWorkSheet,
        patientId: req.body.patientId,
        organizationId:req.body.organizationId,
        branch:req.body.branch
    };

    const biometry = await Biometry.create(data);

    res.status(201).json({
        status: "success",
        message: "Biometry created successfully",
        data: { biometry },
    });
});

export const getAllBiometrys = catchAsync(async (req, res, next) => {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const { createdAt, patientId } = req.query;

    let query = {};

    if(!req.query.organizationId){
        return next(new AppError("Organizationid is required!",400))
    }else{
        query.organizationId=req.query.organizationId
    }

    if(req.query.branch){
        query.branch=req.query.branch
    }

    if (createdAt) {
        const date = new Date(createdAt);
        const nextDay = new Date(date);
        nextDay.setDate(date.getDate() + 1);

        query.createdAt = { $gte: date, $lt: nextDay };
    }
    if (patientId) {
        query.patientId = req.query.patientId;
    }
    const features = new APIFeatures(Biometry.find(query), req.query)
        .sort()
        .limitFields()
        .paginate();

    const biometrys = await features.query;
    const totalRecords = await Biometry.countDocuments(query);
    const totalPages = Math.ceil(totalRecords / limit);

    res.status(200).json({
        status: "success",
        totalPages,
        currentPage: page,
        results: biometrys.length,
        data: { biometrys },
    });
});

export const getBiometry = catchAsync(async (req, res, next) => {
      let query = {};

    if(!req.query.organizationId){
        return next(new AppError("Organizationid is required!",400))
    }else{
        query.organizationId=req.query.organizationId
    }

    if(req.query.branch){
        query.branch=req.query.branch
    }

    const biometry = await Biometry.find(query);

    if (!biometry || biometry.length === 0) {
        return next(new AppError("No biometry records found for the given date", 404));
    }

    res.status(200).json({
        status: "success",
        results: biometry.length,
        data: { biometry },
    });
});

export const updateBiometry = catchAsync(async (req, res, next) => {
    const biometry = await Biometry.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });

    if (!biometry) {
        return next(new AppError("No biometry found with that ID", 404));
    }

    res.status(200).json({
        status: "success",
        message: "Biometry updated successfully",
        data: { biometry },
    });
});

export const deleteBiometry = catchAsync(async (req, res, next) => {
    const biometry = await Biometry.findByIdAndDelete(req.params.id);
    if (!biometry) {
        return next(new AppError("No biometry found with that ID", 404));
    }

    res.status(204).json({
        status: "success",
        message: "Biometry deleted successfully",
    });
});