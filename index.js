const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5001;

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@boredombuster.wytllzp.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
	serverApi: {
		version: ServerApiVersion.v1,
		strict: true,
		deprecationErrors: true,
	},
	writeConcern: { w: "majority" },
});

async function run() {
	try {
		// Connect the client to the server	(optional starting in v4.7)
		client.connect();

		const classesCollection = client.db("ShapeShed").collection("classes");
		const instructorsCollection = client.db("ShapeShed").collection("instructors"); // prettier-ignore

		// All Classes
		app.get("/classes", async (req, res) => {
			const cursor = classesCollection.find();
			const result = await cursor.toArray();
			res.send(result);
		});

		// Send a ping to confirm a successful connection
		await client.db("admin").command({ ping: 1 });
		console.log(
			"Pinged your deployment. You successfully connected to MongoDB!"
		);
	} finally {
	}
}
run().catch(console.dir);

app.get("/", (req, res) => {
	res.send("Running for ShapeShed");
});

app.listen(port, () => {
	console.log(`ShapeShed Server is running on port ${port}`);
});
