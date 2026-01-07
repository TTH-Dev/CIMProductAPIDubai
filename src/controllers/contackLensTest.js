import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";
import APIFeatures from "../utils/ApiFeatures.js";
import ContactLensTest from "../models/contackLensTest.js";

export const createContactLensTest = catchAsync(async (req, res, next) => {
    const { patientId, contactLensData } = req.body;

    const data = {
        contactLensData: JSON.parse(contactLensData),
        patientId: patientId,
        contactLensTestWorkSheet: req.body.contactLensTestWorkSheet,
    }

    if (!patientId) {
        return next(new AppError("Patient ID is missing", 400));
    }
    if (req.files) {
        if (req.files.signatureDocument) {
            req.body.signatureDocument = req.files?.signatureDocument[0].filename;
        }
    }

    const contactLensTest = await ContactLensTest.create(data);

    res.status(201).json({
        status: "Success",
        data: { contactLensTest },
    });
});

export const getAllContactLensTests = catchAsync(async (req, res, next) => {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const { createdAt, patientId } = req.query;
    let query = {};
    if (createdAt) {
        const date = new Date(createdAt);
        const nextDay = new Date(date);
        nextDay.setDate(date.getDate() + 1);
        query.createdAt = { $gte: date, $lt: nextDay };
    }
    if (patientId) {
        query.patientId = req.query.patientId;
    }
    const features = new APIFeatures(ContactLensTest.find(query), req.query)
        .limitFields()
        .sort()
        .paginate();

    const contactLensTests = await features.query;
    const totalRecords = await ContactLensTest.countDocuments(query);
    const totalPages = Math.ceil(totalRecords / limit);

    res.status(200).json({
        status: "Success",
        totalPages,
        currentPage: page,
        result: contactLensTests.length,
        data: { contactLensTests },
    });
});

export const getContactLensTestById = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const contactLensTest = await ContactLensTest.findById(id);
    if (!contactLensTest
    ) {
        return next(new AppError("Refraction Sheet not found", 404));
    }

    res.status(200).json({
        status: "Success",
        data: {
            contactLensTest
        },
    });
});

export const updateContactLensTest = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const { patientId, contactLensData } = req.body;

    const data = {
        contactLensData: JSON.parse(contactLensData),
        patientId: patientId,
        contactLensTestWorkSheet: req.body.contactLensTestWorkSheet,
    }
    const updatedContactLensTest = await ContactLensTest.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
    });

    if (!updatedContactLensTest) {
        return next(new AppError("Refraction Sheet not found", 404));
    }

    res.status(200).json({
        status: "Success",
        data: { updatedContactLensTest },
    });
});

export const deleteContactLensTest = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const deletedContactLensTest = await ContactLensTest.findByIdAndDelete(id);
    if (!deletedContactLensTest) {
        return next(new AppError("Refraction Sheet not found", 404));
    }

    res.status(204).json({
        status: "Success",
        data: null,
    });
});
