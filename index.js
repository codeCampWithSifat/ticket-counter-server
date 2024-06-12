const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const jwt = require("jsonwebtoken");
const port = process.env.PORT || 3001;

// use all the middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.7aech.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
async function run() {
  try {
    await client.connect();
    const userCollection = client.db("TICKET-COUNTER").collection("users");
    const eventCollection = client.db("TICKET-COUNTER").collection("events");

    const verifyToken = (req, res, next) => {
      if (!req.headers.authorization) {
        return res.status(401).send({ message: "Forbidden Access" });
      }
      const token = req.headers.authorization.split(" ")[1];
      jwt.verify(token, process.env.ACCESS_TOKEN, (error, decoded) => {
        if (error) {
          return res.status(401).send({ message: "Forbidden Access" });
        }
        req.decoded = decoded;
        next();
      });
    };

    // jwt related api
    app.post("/jwt", (req, res) => {
      const data = req.body;
      const token = jwt.sign(data, process.env.ACCESS_TOKEN, {
        expiresIn: "1d",
      });
      res.send({ token });
    });

    // users related api
    app.post("/users", async (req, res) => {
      const data = req.body;
      const result = await userCollection.insertOne(data);
      res.send(result);
    });

    //event related api
    app.post("/events", verifyToken, async (req, res) => {
      const data = req.body;
      const result = await eventCollection.insertOne(data);
      res.send(result);
    });

    app.get("/events", async (req, res) => {
      const result = await eventCollection.find().toArray();
      res.send(result);
    });
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello Ticket Counter App");
});

app.listen(port, () => {
  console.log(`Listening To The ${port} Successfully`);
});
