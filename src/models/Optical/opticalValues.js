import mongoose from "mongoose";


const opticalValuesSchema = new mongoose.Schema({

    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Patient",
        required: true
    },
    enteredDate: {
        type: Date,
        default: Date.now
    },
    wt: {
        type: Boolean,
        default: false
    },
    ca: {
        type: Boolean,
        default: false
    },
    pge: {
        type: Boolean,
        default: false
    },
    mmt: {
        type: Boolean,
        default: false
    },
    c39: {
        type: Boolean,
        default: false
    },
    bifocal: {
        kryptok: {
            type: Boolean,
            default: false
        },
        univisD: {
            type: Boolean,
            default: false
        },
        executive: {
            type: Boolean,
            default: false
        },
    },
    progressive: {
        type: String
    },
    pgCondition: {
        good: {
            type: Boolean,
            default: false
        },
        notGood: {
            type: Boolean,
            default: false
        },
    },
    forConstantUse: {
        type: String
    },
    forReadingOnly: {
        type: String
    },
    interPupillaryDistance: {
        type: String
    },
    TintToPatientChoice: {
        type: String
    },
    values: {
        re: {
            dist: {
                sph: {
                    type: String
                },
                cyl: {
                    type: String
                },
                axis: {
                    type: String
                },

            },
            near: {
                sph: {
                    type: String
                },
                cyl: {
                    type: String
                },
                axis: {
                    type: String
                },
            }
        },
        le: {
            dist: {
                sph: {
                    type: String
                },
                cyl: {
                    type: String
                },
                axis: {
                    type: String
                },

            },
            near: {
                sph: {
                    type: String
                },
                cyl: {
                    type: String
                },
                axis: {
                    type: String
                },
            }
        }
    }


}, { timestamps: true });


const OpticalValues = mongoose.model("OpticalValues", opticalValuesSchema);
export default OpticalValues;