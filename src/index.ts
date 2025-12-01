import express from 'express';
import { requestCountMiddleware } from './monitoring/requestCounter';
import client from 'prom-client'; 

const app = express();
const port = 3000;

app.use(express.json());
app.use(requestCountMiddleware);

//Either this can be done or use a middleware to log time taken for each request
// app.get('/user', (req, res)=>{
//     const startTime = Date.now();
//     res.send({
//         name: "Ishan",
//         age: 20
//     });
//     const endTime = Date.now();
//     console.log('Request processed in: ', endTime-startTime, 'ms');
// });

app.get('/user', async (req, res)=>{
    await new Promise((resolve)=>setTimeout(resolve, 1000));
    const user = {
        name: "Ishan",
        age: 20
    };
    res.send(user);
})

app.post('/user', (req, res)=>{
    const user = req.body;
    res.send({
        ...user,
        id: 1
    });
});

app.get('/metrics', async (req, res)=>{
    const metrics = await client.register.metrics();
    res.set('Content-Type', client.register.contentType);
    res.end(metrics);
})

app.listen(port, ()=>{
    console.log(`Server is running at port: ${port}`);
})