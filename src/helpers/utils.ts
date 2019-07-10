import { Server } from "http";
import * as fs from 'fs';
import * as path from 'path';

export const normalizePort = (val: number | string): number | string | boolean => {
    let port: number = (typeof val === 'string') ? parseInt(val) : val;
    if (isNaN(port)) return val;
    else if (port >= 0) return port;
    else return false;
}

export const onError = (server: Server) => {
    return (error: NodeJS.ErrnoException): void => {
        let port: number | string = server.address().toString();
        if (error.syscall !== 'listen') throw error;
        let bind = (typeof port === 'string') ? `pipe ${port}` : `port ${port}`;
        switch(error.code) {
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
    }
}

export const onListening = (server: Server) => {
    return (): void => {
        let addr = server.address();
        let bind = (typeof addr === 'string') ? `${addr}` : `${addr.port}`;

        console.log('-----------------------------------------------');
        console.log("Ambiente: " + process.env.NODE_ENV);
        console.log("Rodando em http://localhost:" + bind);
        console.log('-----------------------------------------------');
    }
}

export const handleError = (error: Error) => {
    let errorMessage: string = `${error.name}: ${error.message}`
    if(process.env.NODE_ENV !== 'test')
        console.error(errorMessage)
    return Promise.reject(new Error(errorMessage))
}

export const throwError = (condition: boolean, message: string): void => {
    if(condition)
        throw new Error(message)
}


export const JWT_SECRET: Buffer = fs.readFileSync(path.resolve(__dirname, '../config/keys/jwtRS256.key'))