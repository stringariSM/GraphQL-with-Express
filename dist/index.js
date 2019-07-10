"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./helpers/utils");
const http = require("http");
const app_1 = require("./app");
const models_1 = require("./models");
const server = http.createServer(app_1.default);
const PORT = utils_1.normalizePort(process.env.PORT || 3000);
//Conectando ao banco
models_1.default.sequelize.sync()
    .then(() => {
    //Inicia o servidor após sincronizar o sequelize com o banco de dados
    server.listen(PORT);
    server.on('error', utils_1.onError(server));
    server.on('listening', utils_1.onListening(server));
});
