import catchAsync from "../../utils/catchAsync.js";
import OpticalBilling from "../../models/Optical/opticalBilling.js";
import AppError from "../../utils/AppError.js";
import APIFeatures from "../../utils/ApiFeatures.js";
import OpticalProduct from "../../models/Optical/OpticalProducts.js";
import Patient from "../../models/patient.js";

export const getOpticalSalesReport = catchAsync(async (req, res, next) => {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
        return next(new AppError("Start and End date are required", 400));
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const bills = await OpticalBilling.find({
        date: { $gte: start, $lte: end }
    })
        .populate("patientId", "PatientName UHID")
        .populate("billData.productId", "vendorName");

    const report = [];

    bills.forEach((bill) => {
        bill.billData.forEach((item) => {
            const existing = report.find((r) => r.barCode === item.barCode);
            if (existing) {
                existing.quantity += item.quantity;
                existing.totalAmount += item.totalAmount;
            } else {
                report.push({
                    barCode: item.barCode,
                    productName: item.productName,
                    vendorName: item.productId?.vendorName || "N/A",
                    quantity: item.quantity,
                    totalAmount: item.totalAmount
                });
            }
        });
    });

    res.status(200).json({
        status: "Success",
        data: report
    });
});

export const createOpticalBilling = catchAsync(async (req, res, next) => {
  const { patientId, billData } = req.body;

  if (!patientId) {
    return next(new AppError("Patient Id is required", 404));
  }

  for (const item of billData) {
    const product = await OpticalProduct.findById(item.productId);

    if (!product) {
      return next(new AppError(`Product not found for ID: ${item.productId}`, 404));
    }

    if (item.type === "Frame") {
      const frameVariant = product.frameStockandcolors?.frames?.find(
        (val) => val.color === item.color
      );

      if (!frameVariant) {
        return next(new AppError(`Color '${item.color}' not found for product: ${product.productName}`, 404));
      }

      if (frameVariant.stock < item.quantity) {
        return next(new AppError(`Insufficient stock for color '${item.color}' in product: ${product.productName}`, 400));
      }

      // Reduce stock for the specific frame color
      frameVariant.stock -= item.quantity;

      
      await product.save();

    } else {

        
      if (product.stocks < item.quantity) {
        return next(new AppError(`Insufficient stock for product: ${product.productName}`, 400));
      }

      await OpticalProduct.findByIdAndUpdate(item.productId, {
        $inc: { stocks: -item.quantity },
      });
    }
  }

  const opticalBilling = await OpticalBilling.create(req.body);

  const patientUpdate = await Patient.findByIdAndUpdate(
    patientId,
    {
      opticalStatus: "Completed",
      opticalBillingId: opticalBilling._id,
    },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    status: "Success",
    data: {
      opticalBilling,
      patientUpdate,
    },
  });
});



export const getAllOpticalBilling = catchAsync(async (req, res, next) => {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;


    let fillter = {};

    if (req.query.patientId) {
        fillter.patientId = req.query.patientId;
    }
    if (req.query.productName) {
        fillter.productName = req.query.productName;
    }

    if (req.query.date) {
        const date = new Date(req.query.date);
        fillter.createdAt = {
            $gt: new Date(date.setHours(0, 0, 0, 0)),
            $lt: new Date(date.setHours(23, 59, 59, 999)),
        };
    }

    const features = new APIFeatures(OpticalBilling.find(fillter).populate("patientId").populate("billData.productId"), req.query)
        .limitFields()
        .paginate()
        .sort();

    const opticalBilling = await features.query;

    const totalRecords = await OpticalBilling.countDocuments(fillter);
    const totalPages = Math.ceil(totalRecords / limit);

    res.status(200).json({
        status: "Success",
        totalPages,
        currentPage: page,
        result: opticalBilling.length,
        data: { opticalBilling },
    });
});

export const getOpticalBillingById = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const opticalBilling = await OpticalBilling.findById(id).populate({
        path: "patientId",
        populate: {
            path: "doctorId",
            model: "Doctor"
        }
    });
    if (!opticalBilling) {
        return next(new AppError("opticalBilling  not found", 404));
    }

    res.status(200).json({
        status: "Success",
        data: { opticalBilling },
    });
});


export const updateOpticalBilling = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { billData } = req.body;

    const originalBill = await OpticalBilling.findById(id);
    if (!originalBill) {
        return next(new AppError("Optical billing not found", 404));
    }

    for (const originalItem of originalBill.billData) {
        const updatedItem = billData.find(item => item.productId.toString() === originalItem.productId.toString());

        if (!updatedItem) {
            await OpticalProduct.findByIdAndUpdate(originalItem.productId, {
                $inc: { stocks: originalItem.quantity }
            });
        }
    }

    const updatedBill = await OpticalBilling.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
    });

    for (const item of updatedBill.billData) {
        const product = await OpticalProduct.findById(item.productId);

        if (!product) {
            return next(new AppError(`Product not found for ID: ${item.productId}`, 404));
        }

        if (product.stocks < item.quantity) {
            return next(new AppError(`Insufficient stock for product: ${product.productName}`, 400));
        }

        await OpticalProduct.findByIdAndUpdate(item.productId, {
            $inc: { stocks: -item.quantity }
        });
    }

    res.status(200).json({
        status: "Success",
        data: {
            opticalBilling: updatedBill
        }
    });
});


export const deleteOpticalBilling = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const opticalBilling = await OpticalBilling.findByIdAndDelete(id);
    if (!opticalBilling) {
        return next(new AppError("opticalBilling not found", 404));
    }

    res.status(204).json({
        status: "Success",
        data: null,
    });
});
