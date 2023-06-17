const express = require("express");
const cors = require("cors");
const app = express();
const stripe = require("stripe")(process.env.PAYMENT_SECRET_KEY);
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
		const usersCollection = client.db("ShapeShed").collection("users");

		// users related apis
		app.get("/users", async (req, res) => {
			const result = await usersCollection.find().toArray();
			res.send(result);
		});

		app.post("/users", async (req, res) => {
			const user = req.body;
			const query = { email: user.email };
			const existingUser = await usersCollection.findOne(query);

			if (existingUser) {
				return res.send({ message: "user already exists" });
			}

			const result = await usersCollection.insertOne(user);
			res.send(result);
		});

		// Selected Classes update
		const updateUserSelectedClasses = async (req, res) => {
			const id = req.params.id;
			const classId = req.params.classId;
			const filter = { _id: new ObjectId(id) };
			const updateDoc = {
				$addToSet: {
					mySelectedClasses: classId,
				},
			};

			const result = await usersCollection.updateOne(filter, updateDoc);
			res.send(result);
		};

		app.patch("/users/:classId/:id", updateUserSelectedClasses);

		// Selected Classes update
		const updateUserEnrolledClasses = async (req, res) => {
			const id = req.params.id;
			const classId = req.params.classId;
			const filter = { _id: new ObjectId(id) };
			const updateDoc = {
				$addToSet: {
					myEnrolledClasses: classId,
				},
			};

			const result = await usersCollection.updateOne(filter, updateDoc);
			res.send(result);
		};

		app.patch("/users/:classId/:id/enrolled", updateUserEnrolledClasses);

		// Selected Classes remove
		const removeUserSelectedClasses = async (req, res) => {
			const id = req.params.id;
			const classId = req.params.classId;
			const filter = { _id: new ObjectId(id) };
			const updateDoc = {
				$pull: {
					mySelectedClasses: classId,
				},
			};

			const result = await usersCollection.updateOne(filter, updateDoc);
			res.send(result);
		};

		app.patch("/users/:classId/:id/remove", removeUserSelectedClasses);

		// Role update
		const updateUserRole = async (req, res) => {
			const id = req.params.id;
			const role = req.params.role;
			const filter = { _id: new ObjectId(id) };
			const updateDoc = {
				$set: {
					userRole: role,
				},
			};

			const result = await usersCollection.updateOne(filter, updateDoc);
			res.send(result);
		};

		app.patch("/users/:role/:id", updateUserRole);

		// All Classes
		app.get("/classes", async (req, res) => {
			const cursor = classesCollection.find();
			const result = await cursor.toArray();
			res.send(result);
		});

		// Add Classes
		app.post("/classes", async (req, res) => {
			const newClass = req.body;
			const result = await classesCollection.insertOne(newClass);
			res.send(result);
		});

		// Classes status update
		const updateClassStatus = async (req, res) => {
			const id = req.params.id;
			const status = req.params.status;
			const filter = { _id: new ObjectId(id) };
			const updateDoc = {
				$set: {
					status: status,
				},
			};

			const result = await classesCollection.updateOne(filter, updateDoc);
			res.send(result);
		};

		app.patch("/classes/:status/:id", updateClassStatus);

		// Classes availableSeats update
		const updateClassAvailableSeats = async (req, res) => {
			const id = req.params.id;
			const filter = { _id: new ObjectId(id) };
			const updateDoc = {
				$inc: {
					availableSeats: -1,
				},
			};

			const result = await classesCollection.updateOne(filter, updateDoc);
			res.send(result);
		};

		app.patch("/classes/:id", updateClassAvailableSeats);

		// All Instructors
		app.get("/instructors", async (req, res) => {
			const cursor = instructorsCollection.find();
			const result = await cursor.toArray();
			res.send(result);
		});

		// classesCollection.updateMany({}, { $set: { status: "approved" } });

		// Specific Instructors
		app.get("/instructors/:id", async (req, res) => {
			const id = req.params.id;
			const query = { _id: new ObjectId(id) };
			const result = await instructorsCollection.findOne(query);

			// find Instructor's classes
			const classPromises = result.classes.map(async (className) => {
				const classQuery = { name: className };
				const classResult = await classesCollection.findOne(classQuery);
				return classResult;
			});

			const classes = await Promise.all(classPromises);

			result.classes = classes;
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
