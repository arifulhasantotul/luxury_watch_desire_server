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
// console.log(uri);
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
      const userCollection = database.collection("users");

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

      // GET users
      app.get("/users", async (req, res) => {
         const cursor = userCollection.find({});
         const users = await cursor.toArray();
         res.send(users);
      });

      // POST user from email
      app.post("/users", async (req, res) => {
         const user = req.body;
         const result = await userCollection.insertOne(user);
         res.json(result);
      });

      // PUT users from google because if user is login for first time user data will be post. otherwise user data won't be post
      app.put("/users", async (req, res) => {
         const user = req.body;
         const filter = { email: user.email };
         const options = { upsert: true };
         const updateDoc = { $set: user };
         const result = await userCollection.updateOne(
            filter,
            updateDoc,
            options
         );
         res.json(result);
         console.log(result);
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
