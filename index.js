const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());


// ==================== MongoDB Code ========================
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ufrxsge.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();

        // ================ create db collection and api start ======================
        const productsCollection = client.db("techShopDB").collection("products")
        const cartCollection = client.db("techShopDB").collection("cart")

        // all post method
        app.post('/add-product', async (req, res) => {
            const productInfo = req.body;
            const result = await productsCollection.insertOne(productInfo);
            res.send(result);
        })

        // add to cart product by user
        app.post('/add-cart', async (req, res) => {
            const productInfo = req.body;
            const result = await cartCollection.insertOne(productInfo);
            res.send(result);
        })





        // get all products
        app.get('/products', async (req, res) => {
            const result = await productsCollection.find().toArray();
            res.send(result);
        })

        // get single product by id
        app.get('/product-details/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await productsCollection.findOne(query);
            res.send(result);
        })

        // update single product by id
        app.put('/update-product/:id', async (req, res) => {
            const id = req.params.id;
            const productInfo = req.body;
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const updateProduct = {
                $set: {
                    name: productInfo.name,
                    userMail: productInfo.userMail,
                    image: productInfo.image,
                    brandName: productInfo.brandName,
                    type: productInfo.type,
                    price: productInfo.price,
                    rating: productInfo.rating,
                    description: productInfo.description
                }
            }
            const result = await productsCollection.updateOne(filter, updateProduct, options);
            res.send(result);
        })

        // to get users product from db: get cart by email
        // http://localhost:5000/cart?email=user@gmail.com
        app.get('/cart', async (req, res) => {
            const email = req.query.email;
            const query = { email: email }
            const result = await cartCollection.find(query).toArray();
            res.send(result);
        })


        // delete cart by id
        app.delete('/cart/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await cartCollection.deleteOne(query);
            res.send(result)
        })

        // ================ create db collection and api end ========================

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);
// ==================== MongoDB Code ========================

app.get('/', (req, res) => {
    res.send('Tech Shop server is running...')
})

app.listen(port, () => {
    console.log('Tech Shop running on port: ', port)
})