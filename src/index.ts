import { normalizePort, onError, onListening } from './helpers/utils';
import * as http from 'http'
import app from './app'
import db from './models'

const server = http.createServer(app);
const PORT = normalizePort(process.env.PORT || 3000);

//Conectando ao banco
db.sequelize.sync()
    .then(() => {
        //Inicia o servidor após sincronizar o sequelize com o banco de dados
        server.listen(PORT)
        server.on('error', onError(server))
        server.on('listening', onListening(server))
    })


