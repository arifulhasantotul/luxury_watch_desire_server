const express = require("express");
const { MongoClient } = require("mongodb");
const cors = require("cors");
require("dotenv").config();
const ObjectId = require("mongodb").ObjectId;

const app = express();
const port = process.env.PORT || 8080;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.nebgy.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
console.log(uri);
const client = new MongoClient(uri, {
   useNewUrlParser: true,
   useUnifiedTopology: true,
});

async function run() {
   try {
      await client.connect();
      console.log("connected to db");

      const database = client.db("desire_watches");
      const productCollection = database.collection("products");
      const reviewCollection = database.collection("reviews");

      // GET products
      app.get("/products", async (req, res) => {
         const cursor = productCollection.find({});
         const products = await cursor.toArray();
         res.send(products);
      });

      // GET specific product
      app.get("/products/:id", async (req, res) => {
         const id = req.params.id;
         const query = { _id: ObjectId(id) };
         const product = await productCollection.findOne(query);
         res.json(product);
      });

      // GET reviews
      app.get("/reviews", async (req, res) => {
         const cursor = reviewCollection.find({});
         const reviews = await cursor.toArray();
         res.send(reviews);
      });
   } finally {
      // await client.close();
   }
}

run().catch(console.dir);

app.get("/", (req, res) => {
   res.send("assignment 12 server is running");
});

app.listen(port, () => {
   console.log("assignment 12 server port running on", port);
});
