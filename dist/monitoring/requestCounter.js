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
const requestCountMiddleware = (req, res, next) => {
    const startTime = Date.now();
    res.on('finish', () => {
        const endTime = Date.now();
        console.log(`Request processed in: ${endTime - startTime}ms`);
        //Increment the counter
        requestCounter.inc({
            method: req.method, //GET, POST
            route: req.route ? req.route.path : req.path, //Routes like /user
            status_code: res.statusCode //status codes like 200, 404
        });
    });
    next();
};
exports.requestCountMiddleware = requestCountMiddleware;
