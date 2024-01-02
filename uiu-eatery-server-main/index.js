const express = require("express");
const app = express();
const cors = require("cors");
//json Web token
const jwt = require("jsonwebtoken");
require("dotenv").config();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// this is checking the token
const verifyJwt = (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization) {
    return res
      .status(401)
      .send({ error: true, message: "Unauthorized access" });
  }
  // [barer token]
  const token = authorization.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decode) => {
    if (err) {
      return res
        .status(401)
        .send({ error: true, message: "Unauthorized access" });
    }
    req.decode = decode;
    next();
  });
};

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const { send } = require("vite");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.z68se.mongodb.net/?retryWrites=true&w=majority`; // ` this is use to daynamic somthig `

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
// update
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    // here we making database collection
    const usersCollection = client.db("uiuEateryDb").collection("users");
    const menuCollection = client.db("uiuEateryDb").collection("menu");
    const foodItemCollection = client.db("uiuEateryDb").collection("fooditem");
    const foodCartsCollection = client
      .db("uiuEateryDb")
      .collection("foodCarts");
    const webReviewCollection = client
      .db("uiuEateryDb")
      .collection("webReviews");

    //jwt token cause form client
    app.post("/jwt", (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "48h",
      });
      res.send({ token });
    });

    //  user related apis

    app.get("/users", async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    });
    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });

    // this is checking an user is admin or not
    app.get("/users/admin/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      const result = { admin: user?.role === "admin" };
      res.send(result);
    });

    //  making admin
    app.patch("/users/admin/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          role: "admin",
        },
      };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    app.patch("/users/restaurantName/:id", async (req, res) => {
      // here use param cause id taken ^ form param
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const { restaurantName } = req.body;
      const updateDoc = {
        $set: {
          restaurantName: restaurantName,
        },
      };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.send(result);
    });
    // user Payment
    app.patch("/users/payment/:id", async (req, res) => {
      // here use param cause id taken ^ form param
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          payment: 0,
        },
      };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.send(result);
    });
    //  delete user
    app.delete("/users/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await usersCollection.deleteOne(query);
      res.send(result);
    }); // this is for restaurant info
    app.get("/menu", async (req, res) => {
      const result = await menuCollection.find().toArray();
      res.send(result); // use to send response to client site
    });
    // take data for client site
    app.post("/menu", async (req, res) => {
      const item = req.body;
      const result = await menuCollection.insertOne(item);
      res.send(result);
    });
    //TODO:  this is for menu approve
    // app.patch("/menu/approve/:id", async (req, res) => {
    //   const id = req.params.id;
    //   const filter = { _id: new ObjectId(id) };
    //   const updateDoc = {
    //     $set: {
    //       approve: "approve",
    //     },
    //   };
    //   const result = await menuCollection.updateOne(filter, updateDoc);
    //   res.send(result);
    // });
    // //  TODO : this is for menu reject
    // app.patch("/menu/reject/:id", async (req, res) => {
    //   const id = req.params.id;
    //   const filter = { _id: new ObjectId(id) };
    //   const updateDoc = {
    //     $set: {
    //       approve: "reject",
    //     },
    //   };
    //   const result = await menuCollection.updateOne(filter.updateDoc);
    //   res.send(result);
    // });

    app.patch("/menu/approve/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          approve: "approve",
        },
      };
      const result = await menuCollection.updateOne(filter, updateDoc);
      res.send(result);
    });
    app.patch("/menu/reject/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          approve: "reject",
        },
      };
      const result = await menuCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    // this is  for foodItem
    app.get("/fooditem", async (req, res) => {
      const result = await foodItemCollection.find().toArray();
      res.send(result);
    });
    // take the info of item from client
    app.post("/fooditem", async (req, res) => {
      const item = req.body;
      const result = await foodItemCollection.insertOne(item);
      res.send(result);
    });
    // delete an item from  data base base on rest admin
    // TODO : can't delete the item for here giving error find and make right
    app.delete("/fooditem/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await foodItemCollection.deleteOne(filter);
      res.send(result);
    });
    // this is for all web site review
    app.get("/webReviews", async (req, res) => {
      const result = await webReviewCollection.find().toArray();
      res.send(result);
    });
    app.get("/foodCarts", async (req, res) => {
      const result = await foodCartsCollection.find().toArray();
      res.send(result);
    });
    // this to add the data payment done
    app.delete("/foodCarts/paymentDone", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };

      const result = await foodCartsCollection.deleteMany(query);
      res.send(result);
    });

    // this is for data take from client site 1st
    app.post("/foodCarts", async (req, res) => {
      const item = req.body;
      const result = await foodCartsCollection.insertOne(item);
      res.send(result);
    });

    // delete item form  database 3rd also done
    app.delete("/foodCarts/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await foodCartsCollection.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB! this is from uiu Rest server "
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("UIU restaurent is open  ");
});

app.listen(port, () => {
  console.log(`UIU rest is running Port ${port}`);
});
