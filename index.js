import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import { connect, closeConnection, addUser, findUser } from "./mongoMethods.js";
import bcrypt from "bcrypt";
import env from "dotenv";
import cors from "cors";
import { generateImage } from "./openAi.js";
import { analyzeImage } from "./azureAI.js";
import { llmGenerator, textSolutionGenerator } from "./modelLLM.js";

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

//generate pose
app.post("/generate", async (req, res) => {
  try {
    const prompt = req.body.prompt;
    //photo solution
    const url = await generateImage(JSON.stringify(prompt));
    //text solution
    const textSolution = await textSolutionGenerator(url);
    //caption for the image
    const promptLLM = `${prompt} - Generate a caption  using information about image for instagram post. Caption must be attractive and eye catching. Use all the information and generate 4 captions containg 5 words atmost.`;
    const caption = await llmGenerator(promptLLM);

    res.status(200).json({
      url: url,
      textSolution: textSolution,
      caption: caption,
    });
  } catch (err) {
    console.log(`Error while generating image ${err}`);
    res.status(500).send("Internal Server Error");
  }
});

//make prompt through analysis of image
app.post("/prompt", async (req, res) => {
  try {
    const url = req.body.url;
    const response = await analyzeImage(url);
    console.log(response);
    res.status(200).send(response);
  } catch (err) {
    console.log(`Internal server Error`);
    res.status(500).send(`Internal Server Error`);
  }
});

//generating caption
app.post("/caption", async (req, res) => {
  try {
    const url = req.body.url;
    const media = req.body.media || "Instagram";
    const response = await analyzeImage(url);
    const prompt = `${response} - Generate a caption  using information about image for ${media} post. Caption must be attractive and eye catching. Use all the information and generate 4 captions containg 5 words atmost.`;
    const text = await llmGenerator(prompt);
    res.status(500).send(text);
  } catch (err) {
    console.log(`Error while generating caption ${err}`);
    res.status(500).send(`Internal server error`);
  }
});

//place information
app.post("/place", async (req, res) => {
  try {
    const placeName = req.body.name;
    const prompt = `Tell about best places to visit and cultural events to attend for content creation for social media content creator at ${placeName}`;
    const info = await llmGenerator(prompt);

    res.status(200).send(info);
  } catch (err) {
    console.log(`Error while generating place infromation: ${err}`);
    res.status(500).send(`Internal server error`);
  }
});

app.listen(port, (req, res) => {
  console.log(`Server is listening at port ${port}`);
});

process.on("SIGINT", () => {
  closeConnection();
  process.exit();
});
