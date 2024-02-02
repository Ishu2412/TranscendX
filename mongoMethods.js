import mongoose from "mongoose";
import { AuthData } from "./mongoDB.js";

const uri =
  "mongodb+srv://ishu:lNwKH7FlCS8wwZBx@cluster0.bbugwp2.mongodb.net/?retryWrites=true&w=majority";

async function connect() {
  try {
    mongoose.connect(uri);
    console.log("Connected to Database");
  } catch (err) {
    console.error(`Error in connecting to Database${err}`);
  }
}

async function closeConnection() {
  try {
    mongoose.connection.close();
    console.log("Disconnected");
  } catch (err) {
    console.error(`Error while disconnecting ${err}`);
  }
}

async function addUser(data) {
  try {
    const user = new AuthData(data);
    await user.save();
    console.log(data);
  } catch (err) {
    console.error(`Error while adding new user ${err}`);
  }
}

async function findUser(data) {
  try {
    const user = await AuthData.findOne({ email: data.email });
    if (user) return user;
    return null;
  } catch (err) {
    console.error(`Error while finding user ${err}`);
  }
}

export { connect, closeConnection, addUser, findUser };
