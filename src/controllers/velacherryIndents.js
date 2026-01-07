import catchAsync from "../utils/catchAsync.js";
import APIFeatures from "../utils/ApiFeatures.js";
import VelacheryIndents from "../models/velacherryIndents.js";
import PharmacyProduct from "../models/PharmacyProduct.js";
import ManualBilling from "../models/manualBilling.js";
import PrescribeBilling from "../models/prescribeBilling.js";
import Billing from "../models/billing.js";
import CampBilling from "../models/campIndents.js";
import DoctorIndents from "../models/doctorIndents.js"

export const createProduct = catchAsync(async (req, res, next) => {
  const { products } = req.body;
  console.log(req.body);

  const indent = await VelacheryIndents.create(req.body);

  for (const item of products) {
    const product = await PharmacyProduct.findById(item.productId);
    if (!product) continue;

    const currentStock = product.stock || 0;
    if (currentStock < item.quantity) {
      console.warn(`Insufficient stock for product ${product.name}`);
      continue;
    }

    product.stock = currentStock - item.quantity;
    await product.save();
  }

  res.status(201).json({
    status: "Success",
    message: "VelacheryIndent created and stock reduced",
    data: { indent },
  });
});

export const getAllProducts = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const features = new APIFeatures(VelacheryIndents.find(), req.query)
    .limitFields()
    .filter()
    .sort()
    .paginate();

  const products = await features.query.populate("salesId");

  const totalRecords = await VelacheryIndents.countDocuments(
    features.filterQuery || {}
  );

  const totalPages = Math.ceil(totalRecords / limit);

  res.status(200).json({
    status: "Success",
    totalRecords,
    totalPages,
    currentPage: page,
    results: products.length,
    data: { products },
  });
});

export const getSalesReport = catchAsync(async (req, res) => {
  const { date } = req.query;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  if (!date || isNaN(new Date(date))) {
    return res
      .status(400)
      .json({ status: "Fail", message: "Invalid date format" });
  }

  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const [manualBills, prescribeBilling] = await Promise.all([
    ManualBilling.find({ createdAt: { $gte: startOfDay, $lte: endOfDay } })
      .populate("patientId")
      .populate("billDetails.productId")
      .populate({
        path: "patientId",
        populate: {
          path: "doctorId",
          model: "Doctor",
        },
      }),
    PrescribeBilling.find({
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    }).populate("patientId"),
  ]);

  const sortedData = [...manualBills, ...prescribeBilling].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  const totalRecords = sortedData.length;
  const totalPages = Math.ceil(totalRecords / limit);
  const paginatedData = sortedData.slice((page - 1) * limit, page * limit);

  res.status(200).json({
    status: "Success",
    totalRecords,
    totalPages,
    currentPage: page,
    results: paginatedData.length,
    data: paginatedData,
  });
});






export const getPaymentDetails = catchAsync(async (req, res) => {
  const { date } = req.query;

  console.log(date,"hi");
  

  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const data = {
    totalBillamount: 0,
    cashAmount: 0,
    cardAmount: 0,
    upiAmount: 0,
    discountAmount: 0,
    indentAmount: 0,
    indentReturn: 0,
  };

  // Collect from Billing
  const billings = await Billing.find({
    createdAt: { $gte: startOfDay, $lte: endOfDay },
  });

  billings.forEach((b) => {
    data.totalBillamount += b.amount || 0;
    data.discountAmount += b.discount || 0;

    switch (b.paymentMode) {
      case "cash":
        data.cashAmount += b.amount || 0;
        break;
      case "card":
        data.cardAmount += b.amount || 0;
        break;
      case "upi":
        data.upiAmount += b.amount || 0;
        break;
    }
  });

  // PrescribeBilling
  const prescribes = await PrescribeBilling.find({
    createdAt: { $gte: startOfDay, $lte: endOfDay },
  });

  prescribes.forEach((p) => {
    data.totalBillamount += p.amount || 0;
    data.discountAmount += p.discount || 0;

    switch (p.paymentMode) {
      case "cash":
        data.cashAmount += p.amount || 0;
        break;
      case "card":
        data.cardAmount += p.amount || 0;
        break;
      case "upi":
        data.upiAmount += p.amount || 0;
        break;
    }
  });

  // CampBilling
  const camps = await CampBilling.find({
    createdAt: { $gte: startOfDay, $lte: endOfDay },
  });

  camps.forEach((c) => {
    data.totalBillamount += c.amount || 0;
    data.discountAmount += c.discount || 0;

    switch (c.paymentMode) {
      case "cash":
        data.cashAmount += c.amount || 0;
        break;
      case "card":
        data.cardAmount += c.amount || 0;
        break;
      case "upi":
        data.upiAmount += c.amount || 0;
        break;
    }
  });

  // ManualBilling
  const manual = await ManualBilling.find({
    createdAt: { $gte: startOfDay, $lte: endOfDay },
  });

  manual.forEach((m) => {
    data.totalBillamount += m.amount || 0;
    data.discountAmount += m.discount || 0;

    switch (m.paymentMode) {
      case "cash":
        data.cashAmount += m.amount || 0;
        break;
      case "card":
        data.cardAmount += m.amount || 0;
        break;
      case "upi":
        data.upiAmount += m.amount || 0;
        break;
    }
  });

  // VelacheryIndents
const velachery = await VelacheryIndents.find({
  createdAt: { $gte: startOfDay, $lte: endOfDay },
}).populate("products.productId");

velachery.forEach((indent) => {
  indent.products.forEach((item) => {
    const product = item.productId;
    if (product) {
      const mrp = product.MRP || 0;
      const tax1 = product.salesTax1 || 0;
      const priceWithTax = mrp + (mrp * tax1) / 100;

      data.indentAmount += priceWithTax * (item.quantity || 1);
    }
  });
});

  // DoctorIndents 
const doctorIndents = await DoctorIndents.find({
  type: "return",
  createdAt: { $gte: startOfDay, $lte: endOfDay },
}).populate("products.productId");

doctorIndents.forEach((indent) => {
  indent.products.forEach((item) => {
    const product = item.productId;
    if (product) {
      const mrp = product.MRP || 0;
      const tax1 = product.salesTax1 || 0;
      const priceWithTax = mrp + (mrp * tax1) / 100;

      data.indentReturn += priceWithTax * (item.quantity || 1);
    }
  });
});

res.status(200).json({
  message:"Success",
  data
})

});

