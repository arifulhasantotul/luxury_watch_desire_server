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
      const orderCollection = database.collection("orders");

      // GET products for products page
      app.get("/products", async (req, res) => {
         const cursor = productCollection.find({});
         const size = parseInt(req.query.size);
         let products;
         if (size) {
            products = await cursor.limit(size).toArray();
         } else {
            products = await cursor.toArray();
         }
         res.send(products);
      });

      // GET specific product
      app.get("/products/:id", async (req, res) => {
         const id = req.params.id;
         const query = { _id: ObjectId(id) };
         const product = await productCollection.findOne(query);
         res.json(product);
      });

      // POST products
      app.post("/products", async (req, res) => {
         const newProduct = req.body;
         const result = await productCollection.insertOne(newProduct);
         res.json(result);
      });

      // GET reviews
      app.get("/reviews", async (req, res) => {
         const cursor = reviewCollection.find({});
         const reviews = await cursor.toArray();
         res.send(reviews);
      });

      // POST reviews
      app.post("/reviews", async (req, res) => {
         const newReview = req.body;
         console.log(newReview);
         const result = await reviewCollection.insertOne(newReview);
         res.json(result);
      });

      // GET users
      app.get("/users", async (req, res) => {
         const cursor = userCollection.find({});
         const users = await cursor.toArray();
         res.send(users);
      });

      // POST user from create email
      app.post("/users", async (req, res) => {
         const user = req.body;
         const result = await userCollection.insertOne(user);
         res.json(result);
      });

      // PUT users from google. if user is going to login for the first time user data will be post. otherwise user data won't be post
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

      // GET orders for products page
      app.get("/orders", async (req, res) => {
         const email = req.query.email;
         let orders;
         if (email) {
            const query = { email: email };
            const cursor = orderCollection.find(query);
            orders = await cursor.toArray();
         } else {
            const cursor = orderCollection.find({});
            orders = await cursor.toArray();
         }
         res.send(orders);
      });

      // POST orders
      app.post("/orders", async (req, res) => {
         const newOrders = req.body;
         const result = await orderCollection.insertOne(newOrders);
         res.json(result);
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
