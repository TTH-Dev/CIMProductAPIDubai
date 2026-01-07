import TPA from "../models/tpaManagement.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";
import APIFeatures from "../utils/ApiFeatures.js";



export const createTpaCompany = catchAsync(async (req, res, next) => {
    const { insuranceCompanyName, insuranceCompanyCoad, contactNumber } = req.body;


    if (!insuranceCompanyName || !insuranceCompanyCoad || !contactNumber) {
        return next(new AppError("Add All Required Fields!", 404));
    }

    if (req.files) {
        if (req.files.form) {
            req.body.form = req.files?.form[0].filename;
        }
    }


    const tpa = await TPA.create(req.body);

    res.status(200).json({
        status: "Success",
        message: "TPA Created",
        data: {
            tpa,
        },
    });

});

export const getAllTpa = catchAsync(async (req, res, next) => {
    let matchStage = {};

    if (req.query.insuranceCompanyCoad) {
        matchStage.insuranceCompanyCoad = { $regex: req.query.insuranceCompanyCoad, $options: "i" };
    }

    if (req.query.insuranceCompanyName) {
        matchStage.insuranceCompanyName = {
            $regex: req.query.insuranceCompanyName,
            $options: "i",
        };
    }

    const totalDocs = await TPA.countDocuments(matchStage);

    const features = new APIFeatures(TPA.find(matchStage), req.query)
        .limitFields()
        .sort()
        .paginate();

    const tpa = await features.query;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const totalPages = Math.ceil(totalDocs / limit);

    res.status(200).json({
        status: "success",
        results: totalDocs,
        page,
        totalPages,
        data: {
            tpa
        },
    });
});


export const getTpa = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const tpa = await TPA.findById(id);

    if (!tpa) {
        return next(new AppError("No tpa found with that ID", 404));
    }

    res.status(200).json({
        status: "success",
        data: {
            tpa,
        },
    });
});

export const updateTPA = catchAsync(async (req, res, next) => {

    const { id } = req.params;


    if (req.files) {

        if (req.files.form) {
            req.body.form = req.files.form[0].filename;
        }
    }
    const tpaData = await TPA.findById(id);

    const updatedData = { ...tpaData.toObject(), ...req.body };

    const tpa = await TPA.findByIdAndUpdate(
        id,
        updatedData,
        { new: true, runValidators: true }
    );

    if (!tpa) {
        return next(new AppError("No TPA found with that ID", 404));
    }

    res.status(200).json({
        status: "success",
        data: {
            tpa,
        },
    });
});


export const deleteTPA = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const tpa = await TPA.findByIdAndDelete(id);

    if (!tpa) {
        return next(new AppError("No TPA found with that ID", 404));
    }

    res.status(204).json({
        status: "success",
        message: "Doctor Deleted Successfully"
    });
});


export const filterTPA = catchAsync(async (req, res, next) => {

    let filter = {};


    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;

    const features = new APIFeatures(TPA.find(filter), req.query)
        .limitFields()
        .sort()
        .paginate();

    const tpa = await features.query;

    let finalTPAs = tpa;

    const totalTPAs = finalTPAs.length;
    const totalPages = Math.ceil(totalTPAs / limit);

    res.status(200).json({
        status: "Success",
        totalPages: totalPages,
        result: totalTPAs,
        data: { tpa: finalTPAs },
    });
});