import catchAsync from "../utils/catchAsync.js";
import APIFeatures from "../utils/ApiFeatures.js";
import DoctorIndents from "../models/doctorIndents.js";
import PharmacyProduct from "../models/PharmacyProduct.js"

export const createProduct = catchAsync(async (req, res, next) => {
  const { type, products } = req.body;

  // Create the doctor indent first
  const product = await DoctorIndents.create(req.body);

  for (const item of products) {
    const productData = await PharmacyProduct.findById(item.productId);

    if (!productData) continue; 

    if (type === "send") {
      productData.stock = (productData.stock || 0) - item.quantity;
    } else if (type === "receive") {
      productData.stock = (productData.stock || 0) + item.quantity;
    }

    await productData.save();
  }

  res.status(201).json({
    status: "Success",
    message: "DoctorIndents created successfully and stock updated",
    data: { product },
  });
});


export const getAllProducts = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const features = new APIFeatures(DoctorIndents.find(), req.query)
    .limitFields()
    .filter()
    .sort()
    .paginate();

  const products = await features.query.populate("doctorId");

  const totalRecords = await DoctorIndents.countDocuments(
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








