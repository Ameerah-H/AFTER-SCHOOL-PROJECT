const express = require('express')
const app = express()
// parse the request parameters
app.use(express.json())
// connect to MongoDB
const MongoClient = require('mongodb').MongoClient;
let db;
MongoClient.connect('mongodb+srv://ameeraharis369:pac30nov@cluster0.kyxtfvq.mongodb.net', (err, client) => {
db = client.db('webstore')
})
    
app.get('/collection/lessons', async (req, res,next) => {
    try {
        // Query the 'lessons' collection for all documents
        const lessons = await db.collection('lessons').find().toArray();
        res.json(lessons); // Send the lessons as a JSON response
    } catch (error) {
        console.error('Error retrieving lessons:', error);
        res.status(500).send('Error retrieving lessons');
    }
});

app.param('collectionName',(req,res,next,collectionName)=>{
    req.collection = db.collection(collectionName)
    return next()
})
app.get('/collection/:collectionName', (req, res, next) => { 
    req.collection.find({}).toArray((e, results) => { 
    if (e) return next(e) 
    res.send(results) 
    }) 
})
//add post
app.post('/collection/:collectionName',(req,res,next)=>{
    req.collection.insert(req.body,(e,results)=>{
        if (e) return next (e)
            res.send(results.ops)
    })
}) 

//return with object id

const objectId = require('mongodb').ObjectId;
app.get('/collection/:collectionName/:id',
    (req,res,next)=>{
        req.collection.findOne({_id: new objectId(req.params.id)}, (e,result) =>{
            if (e) return next(e)
                res.send(result)
        })
    })

//update an object

app.put('/collection/:collectionName/:id',(req,res,next)=>{
    req.collection.update(
        {_id: new objectId(req.params.id)},
        {$set:req.body},
        {safe:true, multi:false},
        (e,result)=>{
            if (e) return next(e)
                res.send((result.result.n===1)?{msg:'success'}:{msg:'error'})
        })
})

//delete 

app.delete('/collection/:collectionName/:id',(req,res,next)=>{
    req.collection.deleteOne(
        {_id:objectId(req.params.id) },(e,result)=>{
            if (e) return next (e)
                res.send((result.result.n ===1 )?
            {msg:'success'}:{msg:'error'})
        })
})

const port = process.env.PORT||3000 
app.listen(port,()=>{
    console.log('Express.js server running at localhost 3000')
})