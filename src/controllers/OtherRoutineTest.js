import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";
import APIFeatures from "../utils/ApiFeatures.js";
import OtherRoutineTest from "../models/OtherRoutineTest.js";

export const createOtherRoutineTest = catchAsync(async (req, res, next) => {
    const { patientId } = req.body;

    if (!patientId) {
        return next(new AppError("Patient ID is required", 400));
    }

    const otherRoutineTest = await OtherRoutineTest.create(req.body);

    res.status(201).json({
        status: "Success",
        data: { otherRoutineTest },
    });
});

export const getAllOtherRoutineTests = catchAsync(async (req, res, next) => {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;
    let filter = {};

    if (req.query.patientId) {
        filter.patientId = req.query.patientId;
    }

    if (req.query.date) {
        const date = new Date(req.query.date);
        filter.enteredDate = {
            $gte: new Date(date.setHours(0, 0, 0, 0)),
            $lt: new Date(date.setHours(23, 59, 59, 999)),
        };
    }
    const features = new APIFeatures(OtherRoutineTest.find(filter), req.query)
        .limitFields()
        .sort()
        .paginate();

    const otherRoutineTests = await features.query;

    const totalRecords = await OtherRoutineTest.countDocuments(filter);
    const totalPages = Math.ceil(totalRecords / limit);

    res.status(200).json({
        status: "Success",
        totalPages,
        currentPage: page,
        result: otherRoutineTests.length,
        data: { otherRoutineTests },
    });
});

export const getOtherRoutineTestById = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const otherRoutineTest = await OtherRoutineTest.findById(id);

    if (!otherRoutineTest) {
        return next(new AppError("Other Routine Test not found", 404));
    }

    res.status(200).json({
        status: "Success",
        data: { otherRoutineTest },
    });
});


export const updateOtherRoutineTest = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const updatedOtherRoutineTest = await OtherRoutineTest.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
    });

    if (!updatedOtherRoutineTest) {
        return next(new AppError("Other Routine Test not found", 404));
    }

    res.status(200).json({
        status: "Success",
        data: { updatedOtherRoutineTest },
    });
});


export const deleteOtherRoutineTest = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const deletedOtherRoutineTest = await OtherRoutineTest.findByIdAndDelete(id);

    if (!deletedOtherRoutineTest) {
        return next(new AppError("Other Routine Test not found", 404));
    }

    res.status(204).json({
        status: "Success",
        data: null,
    });
});


export const updateOtherRoutineTestSection = catchAsync(async (req, res, next) => {
    const { patientId, section, datas } = req.body;

    let data = {};
    data = JSON.parse(datas);

    if (!patientId || !section) {
        return next(new AppError("Patient ID and section are required", 400));
    }

    if (req.files) {
        if (section === "posteriorSegment" && req.files.posteriorSegmentImage) {
            data.posteriorSegmentImage = req.files.posteriorSegmentImage[0].filename;
        }
        if (section === "confrontation" && req.files.confrontationImage) {
            data.confrontationImage = req.files.confrontationImage[0].filename;
        }
    }

    const updatedTest = await OtherRoutineTest.findOneAndUpdate(
        { patientId },
        { $push: { [section]: data } },
        { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({
        status: "Success",
        data: { updatedTest },
    });
});

export const getOtherRoutineTest = catchAsync(async (req, res, next) => {
    const { patientId, section, enteredDate } = req.query;

    if (!patientId || !section) {
        return next(new AppError("Patient ID and section are required", 400));
    }

    const otherRoutineTest = await OtherRoutineTest.findOne({ patientId }).select(section);

    if (!pastHistory || !pastHistory[section]) {
        res.status(200).json({
            status: "Success",
            data: { [section]: [] }
        });
    }

    let sectionData = otherRoutineTest[section];

    if (enteredDate) {
        const targetDate = new Date(enteredDate);
        const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
        const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

        sectionData = sectionData.filter(item => {
            const itemDate = new Date(item.enteredDate);
            return itemDate >= startOfDay && itemDate <= endOfDay;
        });
    }
    res.status(200).json({
        status: "Success",
        data: { [section]: sectionData },
    });
});

export const updateOtherRoutineTestObjectSection = catchAsync(async (req, res, next) => {
    const { patientId, section, data } = req.body;

    if (!patientId || !section || !data) {
        return next(new AppError("Patient ID, section, and data are required", 400));
    }

    const pastHistory = await OtherRoutineTest.findOneAndUpdate(
        { patientId },
        { $push: { [section]: data } },
        { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({
        status: "Success",
        data: { pastHistory },
    });
});

export const getOtherRoutineByDate = catchAsync(async (req, res, next) => {
    const { patientId, section, enteredDate, page = 1, limit = 10 } = req.query;

    if (!patientId) {
        return next(new AppError("Patient ID is required", 400));
    }

    const otherRoutineTest = await OtherRoutineTest.findOne({ patientId });

    if (!otherRoutineTest) {
        return res.status(200).json({
            status: "Success",
            data: { [section]: [] }
        });
    }

    const targetDate = enteredDate ? new Date(enteredDate) : null;
    const startOfDay = targetDate ? new Date(targetDate.setHours(0, 0, 0, 0)) : null;
    const endOfDay = targetDate ? new Date(targetDate.setHours(23, 59, 59, 999)) : null;
    const allSections = section ? [section] : Object.keys(otherRoutineTest._doc);

    const filteredData = {};

    for (const sec of allSections) {
        const sectionData = otherRoutineTest[sec];

        if (Array.isArray(sectionData)) {
            let filtered = sectionData;

            // Filter by date
            if (enteredDate) {
                filtered = filtered.filter(item => {
                    const itemDate = new Date(item.enteredDate);
                    return itemDate >= startOfDay && itemDate <= endOfDay;
                });
            }

            // Pagination
            const skip = (parseInt(page) - 1) * parseInt(limit);
            const paginated = filtered.slice(skip, skip + parseInt(limit));

            filteredData[sec] = {
                total: filtered.length,
                page: parseInt(page),
                limit: parseInt(limit),
                results: paginated
            };
        }
    }

    res.status(200).json({
        status: "Success",
        data: filteredData,
    });
});

export const getAntiorExcel = catchAsync(async (req, res, next) => {
    const { patientId } = req.query;

    if (!patientId) {
        return next(new AppError("Patient ID is required", 400));
    }

    const otherRoutineData = await OtherRoutineTest.find({ patientId });

    if (!otherRoutineData || otherRoutineData.length === 0) {
        return next(new AppError("No data found for this patient", 404));
    }

    let serial = 1;

    const flattenedData = otherRoutineData.flatMap((entry) => {
        const segments = entry.anteriorSegment || [];

        return Array.isArray(segments) ? segments.map((val) => ({
            SNo: serial++,
            EnteredDate: val.enteredDate?.toISOString().split("T")[0] || "N/A",
            FaceOD: val.face?.od || "",
            FaceOS: val.face?.os || "",
            LidsOD: val.lids?.od || "",
            LidsOS: val.lids?.os || "",
            LacrimalSystemOD: val.lacrimalSystem?.od || "",
            LacrimalSystemOS: val.lacrimalSystem?.os || "",
            ConjunctivaOD: val.conjunctiva?.od || "",
            ConjunctivaOS: val.conjunctiva?.os || "",
            CorneaOD: val.cornea?.od || "",
            CorneaOS: val.cornea?.os || "",
            ScleraOD: val.sclera?.od || "",
            ScleraOS: val.sclera?.os || "",
            AnteriorChamberOD: val.anteriorChamber?.od || "",
            AnteriorChamberOS: val.anteriorChamber?.os || "",
            IrisOD: val.iris?.od || "",
            IrisOS: val.iris?.os || "",
            PupilOD: val.pupil?.od || "",
            PupilOS: val.pupil?.os || "",
            LensOD: val.lens?.od || "",
            LensOS: val.lens?.os || ""
        })) : [];
    });

    if (flattenedData.length === 0) {
        return next(new AppError("No anterior segment data found", 404));
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Anterior Segment");

    worksheet.columns = Object.keys(flattenedData[0]).map((key) => ({
        header: key,
        key,
        width: 20,
    }));

    worksheet.addRows(flattenedData);

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", "attachment; filename=AnteriorSegment.xlsx");

    await workbook.xlsx.write(res);
    res.end();
});

export const changeOtherRoutineTestSection = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { parentId, section, data } = req.body;

    if (!["nonContactTonoMetry", "colorVision", "confrontation", "ocularMovements", "coverTest"].includes(section)) {
        return next(new AppError("Invalid section name", 400));
    }

    const filter = {
        parentId: parentId,
        [`${section}._id`]: id,
    };

    const update = {
        $set: {
            [`${section}.$`]: data,
        },
    };

    const updatedDocument = await OtherRoutineTest.findOneAndUpdate(filter, update, {
        new: true,
    });

    if (!updatedDocument) {
        return next(new AppError("Other Routine Test not found", 404));
    }

    res.status(200).json({
        status: "success",
        data: updatedDocument,
    });
});


export const updateOtherRoutineTestSectionImages = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { patientId, section, } = req.body;  

    let data = {};

    if (req.files) {
        if (section === "posteriorSegment" && req.files.posteriorSegmentImage) {
            data.posteriorSegmentImage = req.files.posteriorSegmentImage[0].filename;
        }
        if (section === "confrontation" && req.files.confrontationImage) {
            data.confrontationImage = req.files.confrontationImage[0].filename;
        }
    }

    if (id) {
        const updatedTest = await OtherRoutineTest.findOneAndUpdate(
            {
                patientId,
                [`${section}._id`]: id
            },
            {
                $set: {
                    [`${section}.$.confrontationImage`]: data.confrontationImage,
                }
            },
            { new: true, runValidators: true }
        );

        if (!updatedTest) {
            return next(new AppError("Entry not found or unable to update", 404));
        }

        return res.status(200).json({
            status: "Success",
            data: { updatedTest },
        });
    }

    const updatedTest = await OtherRoutineTest.findOneAndUpdate(
        { patientId },
        { $push: { [section]: data } },
        { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({
        status: "Success",
        data: { updatedTest },
    });
});
