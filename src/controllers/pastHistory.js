import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";
import APIFeatures from "../utils/ApiFeatures.js";
import PastHistory from "../models/pastHistory.js";

export const createPastHistory = catchAsync(async (req, res, next) => {
    const { patientId } = req.body;

    if (!patientId) {
        return next(new AppError("Patient ID is missing", 404));
    }

    const pastHistory = await PastHistory.create(req.body);

    res.status(200).json({
        status: "Success",
        data: { pastHistory },
    });
});

export const getAllPastHistories = catchAsync(async (req, res, next) => {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;

    const features = new APIFeatures(PastHistory.find(), req.query)
        .filter()
        .limitFields()
        .sort()
        .paginate();

    const pastHistories = await features.query;
    const totalRecords = await PastHistory.countDocuments();
    const totalPages = Math.ceil(totalRecords / limit);

    res.status(200).json({
        status: "Success",
        totalPages,
        currentPage: page,
        result: pastHistories.length,
        data: { pastHistories },
    });
});

export const getPastHistoryById = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const pastHistory = await PastHistory.findById(id);
    if (!pastHistory) {
        return next(new AppError("Past history not found", 404));
    }

    res.status(200).json({
        status: "Success",
        data: { pastHistory },
    });
});

export const updatePastHistory = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const updatedHistory = await PastHistory.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
    });

    if (!updatedHistory) {
        return next(new AppError("Past history not found", 404));
    }

    res.status(200).json({
        status: "Success",
        data: { updatedHistory },
    });
});

export const deletePastHistory = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const deletedHistory = await PastHistory.findByIdAndDelete(id);
    if (!deletedHistory) {
        return next(new AppError("Past history not found", 404));
    }

    res.status(204).json({
        status: "Success",
        data: null,
    });
});

export const updatePastHistorySection = catchAsync(async (req, res, next) => {
    const { patientId, section, data } = req.body;

    if (!patientId || !section || !data) {
        return next(new AppError("Patient ID, section, and data are required", 400));
    }

    const pastHistory = await PastHistory.findOneAndUpdate(
        { patientId },
        { $push: { [section]: data } }, 
        { new: true, upsert: true, runValidators: true }
    );
    
    res.status(200).json({
        status: "Success",
        data: { pastHistory },
    });
});

export const updatePastHistorySectionData = catchAsync(async (req, res, next) => {
    const { patientId, section, sectionItemId, data } = req.body;
  
    if (!patientId || !section || !sectionItemId || !data) {
      return next(new AppError("Patient ID, section, sectionItemId, and data are required", 400));
    }
  
    const updatePath = `${section}.$`;
  
    const pastHistory = await PastHistory.findOneAndUpdate(
      {
        patientId,
        [`${section}._id`]: sectionItemId
      },
      {
        $set: {
          [updatePath]: data
        }
      },
      {
        new: true,
        runValidators: true
      }
    );
  
    if (!pastHistory) {
      return next(new AppError("Past history entry not found", 404));
    }
  
    res.status(200).json({
      status: "success",
      data: { pastHistory },
    });
  });
  

export const getPastHistorySection = catchAsync(async (req, res, next) => {
    const { patientId, section, enteredDate } = req.query;

    if (!patientId || !section) {
        return next(new AppError("Patient ID and section are required", 400));
    }

    const pastHistory = await PastHistory.findOne({ patientId }).select(section);

    if (!pastHistory || !pastHistory[section]) {
        res.status(200).json({
            status: "Success",
            data: { [section]: [] },
        });    }

    let sectionData = pastHistory[section];

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
