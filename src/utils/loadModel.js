// utils/loadModel.js
import mongoose from "mongoose";


export const loadModel = (modelName, modelPath) => {
  if (mongoose.models[modelName]) {
    return mongoose.models[modelName];
  } else {
    return import(modelPath).then((mod) => mod.default);
  }
};
