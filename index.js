import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import { connect, closeConnection, addUser, findUser } from "./mongoMethods.js";
import bcrypt from "bcrypt";
import env from "dotenv";
import cors from "cors";
import { run } from "./model.js";

const app = express();
const port = process.env.PORT || 3000;
const saltRounds = 10;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
env.config();

connect();

app.get("/", (req, res) => {
  res.status(200).send("Hello");
});

app.post("/register", async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const check = await findUser({
      email,
      password,
    });
    console.log(email);
    console.log(password);

    //if user already exists
    if (check) {
      console.log(check);
      res.status(409).send(`User already exists. Try loggin in.`);
    } else {
      bcrypt.hash(password, saltRounds, async (err, hash) => {
        if (err) {
          console.log(`Error while hashing the password ${err}`);
        } else {
          const user = {
            email: email,
            password: hash,
          };
          await addUser(user);
          res.status(200).send(true);
        }
      });
    }
  } catch (err) {
    console.error(`Error while registering the user: ${err}`);
    res.status(500).send(`Internal server error`);
  }
});

app.post("/login", async (req, res) => {
  try {
    const data = {
      email: req.body.email,
      password: req.body.password,
    };
    const user = await findUser(data);
    if (user) {
      const storedHashedPassword = user.password;
      bcrypt.compare(data.password, storedHashedPassword, (err, result) => {
        if (err) {
          res.status(500).send(`Error while Authorizing`);
        } else {
          if (result) {
            res.status(200).send(true);
          } else {
            res.status(401).send(`Password not match`);
          }
        }
      });
    } else {
      res.status(401).send(`User not found`);
    }
  } catch {
    res.status(500).send(`Internal Server Error`);
  }
});

app.listen(port, (req, res) => {
  console.log(`Server is listening at port ${port}`);
});

process.on("SIGINT", () => {
  closeConnection();
  process.exit();
});
