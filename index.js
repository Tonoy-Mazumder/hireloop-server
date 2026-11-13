import express from "express";
import cors from "cors";
import { MongoClient, ObjectId } from "mongodb";
import "dotenv/config";
const app = express();
const port = process.env.PORT || 5000;
app.use(express.json());
app.use(cors());

const client = new MongoClient(process.env.DATABASE_URI);

export async function connectToMongoDB() {
  try {
    await client.connect();
    console.log("You successfully connected to MongoDB!");
    return client;
  } catch (err) {
    console.dir(err);
  }
}

const connectedClient = await connectToMongoDB();
const database = connectedClient.db("hireloopdb");
const user = database.collection("user");
const jobs = database.collection("jobs");
app.get("/", (req, res) => {
  res.send("Hello World!");
});

//http://localhost:5000/users
app.get("/users", async (req, res) => {
  const cursor = user.find({});
  const result = await cursor.toArray();
  res.send(result);
});
//http://localhost:5000/jobs
app.post("/jobs", async (req, res) => {
  try {
    const job = req.body;

    const result = await jobs.insertOne(job);

    res.send(result);
  } catch (error) {
    res.status(500).send({
      message: "Failed to create job",
    });
  }
});
app.get("/jobs", async (req, res) => {
  console.log("Get request received for jobs");
  const query = {};
  console.log(req.query);
  if (req.query) {
    if (req.query.jobType) {
      query.jobType = req.query.jobType;
    }
    if (req.query.isRemote) {
      query.isRemote = req.query.isRemote === "true";
    }
    if (req.query.jobCategory) {
      query.jobCategory = req.query.jobCategory;
    }
    if (req.query.search) {
      query.$or = [
        { jobTitle: { $regex: req.query.search, $options: "i" } },
        { responsibilities: { $regex: req.query.search, $options: "i" } },
        { qualifications: { $regex: req.query.search, $options: "i" } },
        { companyName: { $regex: req.query.search, $options: "i" } },
      ];
    }
  }

  const cursor = jobs.find(query);
  const result = await cursor.toArray();
  res.send(result);
});

// delete
app.delete("/jobs/:id", async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  try {
    const result = await jobs.deleteOne(query);
    res.send(result);
  } catch (error) {
    res.status(500).send({
      message: "Failed to delete job",
    });
  }
});
app.listen(port, () => {
  console.log(`Server run on http://localhost:${port}/`);
});
