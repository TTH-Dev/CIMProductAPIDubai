import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";
import APIFeatures from "../utils/ApiFeatures.js";
import ProvisionalDiagnosis from "../models/provisionalDiagnosis.js";

export const createProvisionalDiagnosis = catchAsync(async (req, res, next) => {

    const provisionalDiagnosis = await ProvisionalDiagnosis.create(req.body);
    
    res.status(201).json({
        status: "success",
        message: "ProvisionalDiagnosis created successfully",
        data: { provisionalDiagnosis },
    });
});

export const getAllProvisionalDiagnosiss = catchAsync(async (req, res, next) => {
    const { createdAt } = req.query;

    let query = {};

    if (createdAt) {
        const date = new Date(createdAt);
        const nextDay = new Date(date);
        nextDay.setDate(date.getDate() + 1);

        query.createdAt = { $gte: date, $lt: nextDay };
    }
    if (req.query.patientId) {
        query.patientId = req.query.patientId
    }
    if(req.query.orgnizationId){
        query.orgnizationId=req.query.orgnizationId
    }

       if(req.query.branch){
        query.branch=req.query.branch
    }
 
    const features = new APIFeatures(ProvisionalDiagnosis.find(query).populate("doctorId"), req.query)
        .sort()
        .limitFields()
        .paginate();

    const provisionalDiagnosiss = await features.query;

    res.status(200).json({
        status: "success",
        results: provisionalDiagnosiss.length,
        data: { provisionalDiagnosiss },
    });
});

export const getProvisionalDiagnosis = catchAsync(async (req, res, next) => {
  
    const provisionalDiagnosis = await ProvisionalDiagnosis.find();

    if (!provisionalDiagnosis || provisionalDiagnosis.length === 0) {
        return next(new AppError("No provisionalDiagnosis records found for the given date", 404));
    }

    res.status(200).json({
        status: "success",
        results: provisionalDiagnosis.length,
        data: { provisionalDiagnosis },
    });
});


export const updateProvisionalDiagnosis = catchAsync(async (req, res, next) => {
    const provisionalDiagnosis = await ProvisionalDiagnosis.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });

    if (!provisionalDiagnosis) {
        return next(new AppError("No provisionalDiagnosis found with that ID", 404));
    }

    res.status(200).json({
        status: "success",
        message: "ProvisionalDiagnosis updated successfully",
        data: { provisionalDiagnosis },
    });
});

export const deleteProvisionalDiagnosis = catchAsync(async (req, res, next) => {
    const provisionalDiagnosis = await ProvisionalDiagnosis.findByIdAndDelete(req.params.id);
    if (!provisionalDiagnosis) {
        return next(new AppError("No provisionalDiagnosis found with that ID", 404));
    }

    res.status(204).json({
        status: "success",
        message: "ProvisionalDiagnosis deleted successfully",
    });
});


