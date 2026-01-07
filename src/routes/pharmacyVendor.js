import express from "express";
import {
    createPharmacyVendor,
    getAllPharmacyVendors,
    getPharmacyVendor,
    updatePharmacyVendor,
    deletePharmacyVendor,
    filterPharmacyVendors,
    getPharmacyVendorDM,getPharmacyVendorDropDM
} from "../controllers/pharmacyVendor.js";

import { protect } from "../controllers/admin.js";
const pharmacyVendorrouter = express.Router();

pharmacyVendorrouter.use(protect);


pharmacyVendorrouter.route("/")
    .post(createPharmacyVendor)     
    .get(getAllPharmacyVendors);   

pharmacyVendorrouter.route("/filter")
    .get(filterPharmacyVendors);   

    pharmacyVendorrouter.route("/dm-menu")
    .get(getPharmacyVendorDM); 
    pharmacyVendorrouter.route("/getPharmacyVendorDropDM").get(getPharmacyVendorDropDM)
pharmacyVendorrouter.route("/:id")
    .get(getPharmacyVendor)         
    .patch(updatePharmacyVendor)   
    .delete(deletePharmacyVendor);  


    
export default pharmacyVendorrouter;
