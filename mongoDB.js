import mongoose from "mongoose";

const authSchema = new mongoose.Schema({
  email: String,
  password: String,
});

const AuthData = mongoose.model("AuthData", authSchema);

export { AuthData };
