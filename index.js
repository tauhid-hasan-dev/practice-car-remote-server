const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express();
const cors = require('cors');
require('dotenv').config();

const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

/* console.log(process.env.DB_USER);
console.log(process.env.DB_PASSWORD); */


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.jjvuikj.mongodb.net/?retryWrites=true&w=majority`;

console.log(uri);

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        const serviceCollection = client.db('practiceCar').collection('services');

        app.get('/services', async (req, res) => {
            const query = {};
            const cursor = serviceCollection.find(query);
            const services = await cursor.toArray();
            res.send(services);
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