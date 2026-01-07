import express from "express";
import {
  createPharmacyProduct,
  getAllPharmacyProducts,
  getPharmacyProduct,
  updatePharmacyProduct,
  deletePharmacyProduct,
  filterPharmacyProducts,
  getPharmacyProductDM,
  getAllPharmacyProductsPO,
  getAllPharmacyProductsType,
  bulkUpdatePurchase,getPurchaseEntry,bulkUpdateReturn,deletePharmacyProductByName,getDropdownByName,getProductByName,getPharmacyProductVendorDM
} from "../controllers/PharmacyProduct.js";
import {uploadPharmacyproductMasterExcel,getAllParmacyMaster,getPharmaMasterDrop,getPharmaMasterById,createPharmacyproductMaster} from "../controllers/pharmacyProductMaster.js"
import { protect } from "../controllers/admin.js";
import { uploadExcel } from "../utils/multerConfig.js";

const pharmacyProductrouter = express.Router();

pharmacyProductrouter.use(protect);

pharmacyProductrouter
  .route("/")
  .post(createPharmacyProduct)
  .get(getAllPharmacyProducts);
pharmacyProductrouter
  .route("/getAllPharmacyProductsPO")
  .get(getAllPharmacyProductsPO);
pharmacyProductrouter
  .route("/getAllPharmacyProductsType")
  .get(getAllPharmacyProductsType);
pharmacyProductrouter.route("/filter").get(filterPharmacyProducts);
pharmacyProductrouter.route("/dm-menu").get(getPharmacyProductDM);
pharmacyProductrouter.route("/getPharmacyProductVendorDM").get(getPharmacyProductVendorDM)
pharmacyProductrouter.route("/bulkUpdatePurchase").post(bulkUpdatePurchase).get(getPurchaseEntry)
pharmacyProductrouter.route("/bulkUpdateReturn").post(bulkUpdateReturn)
  pharmacyProductrouter.route("/getAllParmacyMaster").get(getAllParmacyMaster)
  pharmacyProductrouter.route("/getPharmaMasterDrop").get(getPharmaMasterDrop)
pharmacyProductrouter.route("/getPharmaMasterById").get(getPharmaMasterById)
pharmacyProductrouter.route("/deletePharmacyProductByName").delete(deletePharmacyProductByName)
pharmacyProductrouter.route("/getDropdownByName").get(getDropdownByName)  
pharmacyProductrouter.route("/getProductByName").get(getProductByName)
pharmacyProductrouter.route("/createPharmacyproductMaster").post(createPharmacyproductMaster)

pharmacyProductrouter
  .route("/:id")
  .get(getPharmacyProduct)
  .patch(updatePharmacyProduct)
  .delete(deletePharmacyProduct);

pharmacyProductrouter
  .route("/uploadPharmacyproductMasterExcel")
  .post(uploadExcel.single("file"), uploadPharmacyproductMasterExcel); 



export default pharmacyProductrouter;
