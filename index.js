const express = require("express");
const { MongoClient } = require("mongodb");
const cors = require("cors");
require("dotenv").config();
const ObjectId = require("mongodb").ObjectId;
// const admin = require("firebase-admin");
const app = express();
const port = process.env.PORT || 8080;

// DB_USER=assignment12
// DB_PASS=9YQhbUa6naq419M4
// const serviceAccount = JSON.parse(`${process.env.FIREBASE_CREATE_ACCOUNT}`);
// const serviceAccount = require("./desired-a1f73-firebase-adminsdk-cx6kp-b5d44e7d54.json");
// console.log(serviceAccount);

// admin.initializeApp({
//    credential: admin.credential.cert(serviceAccount),
// });

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.nebgy.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
// console.log(uri);
const client = new MongoClient(uri, {
   useNewUrlParser: true,
   useUnifiedTopology: true,
});

// async function verifyToken(req, res, next) {
//    if (req.headers?.authorization?.startsWith("Bearer ")) {
//       const token = req.headers.authorization.split(" ")[1];
//       try {
//          const decodedUser = await admin.auth().verifyIdToken(token);
//          req.decodedEmail = decodedUser.email;
//       } catch {}
//    }

//    next();
// }

async function run() {
   try {
      await client.connect();
      console.log("connected to db");

      const database = client.db("desire_watches");
      const productCollection = database.collection("products");
      const reviewCollection = database.collection("reviews");
      const userCollection = database.collection("users");
      const orderCollection = database.collection("orders");
      const shippingCollection = database.collection("shipping");

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

      // DELETE products
      app.delete("/products/:id", async (req, res) => {
         const id = req.params.id;
         const query = { _id: ObjectId(id) };
         const result = await productCollection.deleteOne(query);
         console.log("deleted", result);
         res.json(result);
      });

      // PUT orders
      app.put("/products/:id", async (req, res) => {
         const id = req.params.id;
         const updateOrder = req.body;
         const filter = { _id: ObjectId(id) };
         const options = { upsert: true };
         const updateDoc = {
            $set: { status: updateOrder.status },
         };
         const result = await productCollection.updateOne(
            filter,
            updateDoc,
            options
         );
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

      // GET specific user email for role
      app.get("/users/:email", async (req, res) => {
         const email = req.params.email;
         const query = { email: email };
         const user = await userCollection.findOne(query);
         let isAdmin = false;
         if (user?.role === "admin") {
            isAdmin = true;
         }
         res.json({ admin: isAdmin });
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
      // PUT make user without jwt
      app.put("/users/admin", async (req, res) => {
         const user = req.body;
         console.log("put", user);
         const filter = { email: user.email };
         const updateDoc = { $set: { role: "admin" } };
         const result = await userCollection.updateOne(filter, updateDoc);
         res.json(result);
      });

      // PUT update normal user to admin
      // app.put("/users/admin", verifyToken, async (req, res) => {
      //    const user = req.body;
      //    // getting already authorized admin email
      //    // console.log("put", req.decodedEmail);
      //    const requester = req.decodedEmail;
      //    if (requester) {
      //       const requesterAccount = await userCollection.findOne({
      //          email: requester,
      //       });
      //       if (requesterAccount.role === "admin") {
      //          const filter = { email: user.email };
      //          const updateDoc = { $set: { role: "admin" } };
      //          const result = await userCollection.updateOne(filter, updateDoc);
      //          res.json(result);
      //       }
      //    } else {
      //       res.status(403).json({
      //          message: "You do not have access to make admin",
      //       });
      //    }
      // });

      // PUT users for moderator
      app.put("/users/:id", async (req, res) => {
         const id = req.params.id;
         const updateOrder = req.body;
         const filter = { _id: ObjectId(id) };
         const options = { upsert: true };
         const updateDoc = {
            $set: { role: updateOrder.role },
         };
         const result = await userCollection.updateOne(
            filter,
            updateDoc,
            options
         );
         res.json(result);
      });

      // GET orders for products page
      app.get("/orders", async (req, res) => {
         const email = req.query.email;
         let cursor;
         if (email) {
            const query = { email: email };
            cursor = orderCollection.find(query);
         } else {
            cursor = orderCollection.find({});
         }
         const orders = await cursor.toArray();
         res.send(orders);
      });

      // POST orders
      app.post("/orders", async (req, res) => {
         const newOrders = req.body;
         const result = await orderCollection.insertOne(newOrders);
         res.json(result);
      });

      // DELETE orders
      app.delete("/orders/:id", async (req, res) => {
         const id = req.params.id;
         const query = { _id: ObjectId(id) };
         const result = await orderCollection.deleteOne(query);
         console.log("deleted", result);
         res.json(result);
      });

      // PUT orders
      app.put("/orders/:id", async (req, res) => {
         const id = req.params.id;
         const updateOrder = req.body;
         const filter = { _id: ObjectId(id) };
         const options = { upsert: true };
         const updateDoc = {
            $set: { status: updateOrder.status },
         };
         const result = await orderCollection.updateOne(
            filter,
            updateDoc,
            options
         );
         res.json(result);
      });

      // GET shipping
      app.get("/shipping", async (req, res) => {
         const email = req.query.email;
         let cursor;
         if (email) {
            const filter = { email: email };
            cursor = shippingCollection.find(filter);
         } else {
            cursor = shippingCollection.find({});
         }
         const result = await cursor.toArray();
         res.send(result);
      });

      // POST shipping
      app.post("/shipping", async (req, res) => {
         const newShipping = req.body;
         const result = await shippingCollection.insertOne(newShipping);
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
