const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5001;

// middleware
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
	res.send("Running ShapeShed");
});

app.listen(port, () => {
	console.log(`ShapeShed Server is running on port ${port}`);
});
