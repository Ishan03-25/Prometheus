import { NextFunction, Request, Response } from "express";
import client from 'prom-client';

const requestCounter = new client.Counter({
    name: "http_request_count",
    help: "Total number of HTTP requests",
    labelNames: ['method', 'route', 'status_code']
});

const activeRequestsGauge = new client.Gauge({
    name: 'active_requests',
    help: 'Number of active requests'
});

const httpRequestDurationMicroSecondsHistogram = new client.Histogram({
    name: 'http_request_duration_ms',
    help: 'Duration of HTTP requests in ms',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [0.1, 5, 15, 50, 100, 200, 300, 400, 500, 1000, 2000, 5000, 10000]
})

export const requestCountMiddleware = (req: Request, res: Response, next: NextFunction)=>{
    const startTime = Date.now();
    activeRequestsGauge.inc();
    res.on('finish', ()=>{
        const endTime = Date.now();
        const duration = endTime-startTime;
        console.log(`Request processed in: ${endTime-startTime}ms`);

        //Increment the counter
        requestCounter.inc({
            method: req.method,//GET, POST
            route: req.route ? req.route.path : req.path,//Routes like /user
            status_code: res.statusCode//status codes like 200, 404
        });
        httpRequestDurationMicroSecondsHistogram.observe({
            method: req.method,
            route: req.route ? req.route.path : req.path,
            status_code: res.statusCode
        }, duration);
        activeRequestsGauge.dec();
    });
    next();
}