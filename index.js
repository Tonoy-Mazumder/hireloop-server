import express from 'express'
import cors from 'cors'
import { MongoClient, ObjectId } from 'mongodb';
import 'dotenv/config'
const app = express();
const port = process.env.PORT || 5000;
app.use(express.json())
app.use(cors())

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

const connectedClient = await connectToMongoDB()
const database = connectedClient.db("hireloopdb")
const user = database.collection('user')
const jobs = database.collection('jobs')
app.get('/', (req, res) => {
    res.send('Hello World!');
});

//http://localhost:5000/users
app.get('/users', async (req, res) => {
    const cursor = user.find({})
    const result = await cursor.toArray()
    res.send(result)
})
//http://localhost:5000/jobs
app.post('/jobs', async (req, res) => {
    try {
        const job = req.body

        const result = await jobs.insertOne(job)

        res.send(result)
    } catch (error) {
        res.status(500).send({
            message: "Failed to create job"
        })
    }
})
app.get('/jobs', async (req, res) => {
    try {
        const cursor = jobs.find({})
        const result = await cursor.toArray()
        res.send(result)
    } catch (error) {
        res.status(500).send({
            message: "Failed to fetch jobs"
        })
    }
})

// delete 
app.delete('/jobs/:id', async (req, res) => {
    const id = req.params.id
    const query = { _id: new ObjectId(id) }
    try {
        const result = await jobs.deleteOne(query)
        res.send(result)
    } catch (error) {
        res.status(500).send({
            message: "Failed to delete job"
        })
    }
})
app.listen(port, () => {
    console.log(`Server run on http://localhost:${port}/`);
});