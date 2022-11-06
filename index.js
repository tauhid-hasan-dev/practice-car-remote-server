const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const cors = require('cors');
require('dotenv').config();
var jwt = require('jsonwebtoken');

const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.jjvuikj.mongodb.net/?retryWrites=true&w=majority`;

/* console.log(uri); */

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    console.log(authHeader);
    if (!authHeader) {
        return res.status(401).send({ message: 'Unauthorized access' });
    }
    const token = authHeader.split(' ')[1]
    jwt.verify(token, process.env.DB_TOKEN_SECRET, function (err, decoded) {
        if (err) {
            return res.status(401).send({ message: 'Forbidden access' })
        }

        req.decoded = decoded;
        next();
    })
}

async function run() {
    try {
        const serviceCollection = client.db('practiceCar').collection('services');
        const orderCollection = client.db('practiceCar').collection('orders');





        app.post('/jwt', (req, res) => {
            const user = req.body;
            //console.log(user)
            const token = jwt.sign(user, process.env.DB_TOKEN_SECRET, { expiresIn: '5' });
            res.send({ token })
        })

        app.get('/services', async (req, res) => {
            const query = {};
            const cursor = serviceCollection.find(query);
            const services = await cursor.toArray();
            res.send(services);
        })

        //getting single service info for checkout and sending order request
        app.get('/services/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const service = await serviceCollection.findOne(query);
            res.send(service)
        })

        //sending data to the mongodb sever(with the service info)
        app.post('/orders', async (req, res) => {
            const query = req.body;
            const result = await orderCollection.insertOne(query);
            res.send(result)
        })

        //getting order by filtering by email
        app.get('/orders', verifyJWT, async (req, res) => {
            /* console.log(req.headers.authorization) */
            const decoded = req.decoded;

            if (decoded.email !== req.query.email) {
                res.status(403).send({ message: 'unauthorized access' })
            }

            let query = {};
            if (req.query.email) {
                query = {
                    email: req.query.email
                }
            }
            const orders = await orderCollection.find(query).toArray();
            res.send(orders)
        })

        //deleting a single order from the order
        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await orderCollection.deleteOne(query);
            res.send(result);
        })


        app.patch('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const status = req.body.status;
            const query = { _id: ObjectId(id) }
            const updateDoc = {
                $set: {
                    status: status
                }
            };

            const result = await orderCollection.updateOne(query, updateDoc);
            res.send(result)
        })


        app.get('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const cursor = await orderCollection.findOne(query);
            res.send(cursor);
        })


        app.put('/orders/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id)
            const filter = { _id: ObjectId(id) };
            const order = req.body;
            console.log(order);
            const option = { upsert: true };
            const updatedOrder = {
                $set: {
                    name: order.name,
                    phone: order.phone
                }
            }
            const result = await orderCollection.updateOne(filter, updatedOrder, option);
            res.send(result);
        })



    } finally {

    }
}
run().catch(console.dir);





app.get('/', (req, res) => {
    res.send('Practice car server is running')
})

app.listen(port, () => {
    console.log(`Practice car server is running on ${port}`);
})
