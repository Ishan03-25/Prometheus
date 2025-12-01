"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestCountMiddleware = void 0;
const prom_client_1 = __importDefault(require("prom-client"));
const requestCounter = new prom_client_1.default.Counter({
    name: "http_request_count",
    help: "Total number of HTTP requests",
    labelNames: ['method', 'route', 'status_code']
});
const activeRequestsGauge = new prom_client_1.default.Gauge({
    name: 'active_requests',
    help: 'Number of active requests'
});
const httpRequestDurationMicroSecondsHistogram = new prom_client_1.default.Histogram({
    name: 'http_request_duration_ms',
    help: 'Duration of HTTP requests in ms',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [0.1, 5, 15, 50, 100, 200, 300, 400, 500, 1000, 2000, 5000, 10000]
});
const requestCountMiddleware = (req, res, next) => {
    const startTime = Date.now();
    activeRequestsGauge.inc();
    res.on('finish', () => {
        const endTime = Date.now();
        const duration = endTime - startTime;
        console.log(`Request processed in: ${endTime - startTime}ms`);
        //Increment the counter
        requestCounter.inc({
            method: req.method, //GET, POST
            route: req.route ? req.route.path : req.path, //Routes like /user
            status_code: res.statusCode //status codes like 200, 404
        });
        httpRequestDurationMicroSecondsHistogram.observe({
            method: req.method,
            route: req.route ? req.route.path : req.path,
            status_code: res.statusCode
        }, duration);
        activeRequestsGauge.dec();
    });
    next();
};
exports.requestCountMiddleware = requestCountMiddleware;
