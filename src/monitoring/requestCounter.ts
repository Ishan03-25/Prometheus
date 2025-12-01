import { NextFunction, Request, Response } from "express";
import client from 'prom-client';

const requestCounter = new client.Counter({
    name: "http_request_count",
    help: "Total number of HTTP requests",
    labelNames: ['method', 'route', 'status_code']
});

export const requestCountMiddleware = (req: Request, res: Response, next: NextFunction)=>{
    const startTime = Date.now();
    res.on('finish', ()=>{
        const endTime = Date.now();
        console.log(`Request processed in: ${endTime-startTime}ms`);

        //Increment the counter
        requestCounter.inc({
            method: req.method,//GET, POST
            route: req.route ? req.route.path : req.path,//Routes like /user
            status_code: res.statusCode//status codes like 200, 404
        });
    });
    next();
}