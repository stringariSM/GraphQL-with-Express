"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
exports.normalizePort = (val) => {
    let port = (typeof val === 'string') ? parseInt(val) : val;
    if (isNaN(port))
        return val;
    else if (port >= 0)
        return port;
    else
        return false;
};
exports.onError = (server) => {
    return (error) => {
        let port = server.address().toString();
        if (error.syscall !== 'listen')
            throw error;
        let bind = (typeof port === 'string') ? `pipe ${port}` : `port ${port}`;
        switch (error.code) {
            case 'EACCES':
                console.error(`${bind} requires elevated privileges`);
                process.exit(1);
                break;
            case 'EADDRINUSE':
                console.error(`${bind} is already in use`);
                process.exit(1);
                break;
            default:
                throw error;
        }
    };
};
exports.onListening = (server) => {
    return () => {
        let addr = server.address();
        let bind = (typeof addr === 'string') ? `${addr}` : `${addr.port}`;
        console.log('-----------------------------------------------');
        console.log("Ambiente: " + process.env.NODE_ENV);
        console.log("Rodando em http://localhost:" + bind);
        console.log('-----------------------------------------------');
    };
};
exports.handleError = (error) => {
    let errorMessage = `${error.name}: ${error.message}`;
    if (process.env.NODE_ENV !== 'test')
        console.error(errorMessage);
    return Promise.reject(new Error(errorMessage));
};
exports.throwError = (condition, message) => {
    if (condition)
        throw new Error(message);
};
exports.JWT_SECRET = fs.readFileSync(path.resolve(__dirname, '../config/keys/jwtRS256.key'));
