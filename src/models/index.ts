import { DbConnection } from '../interfaces/DbConnectionInterface';

import * as fs from "fs";
import * as path from "path";
import * as Sequelize from "sequelize";

const basename: string = path.basename(module.filename)
const env: string = process.env.NODE_ENV || 'development'
var config = require(path.resolve(`${__dirname}./../config/config`))[env];
let db = null;

if(!db){
    db = {}

    //Desativa os operadores, por segurança. Isso evita SQL Injection
    const operatorsAliases = {
        $in: Sequelize.Op.in
    }
    config = Object.assign({operatorsAliases}, config)

    const sequelize: Sequelize.Sequelize = new Sequelize(
        config.database,
        config.username,
        config.password,
        config
    )

    fs.readdirSync(__dirname)
        .filter((file: string) => {
            const fileSlice: string = file.slice(-3);
            return (file.indexOf('.') !== 0) && (file !== basename) && ((fileSlice === '.js') || (fileSlice === '.ts'));
        })
        .forEach((file: string) => {
            const model = sequelize.import(path.join(__dirname, file));
            db[model['name']] = model;
        })

    Object.keys(db).forEach((modelName: string) => {
        if (db[modelName].associate) {
            db[modelName].associate(db);
        }
    });

    db['sequelize'] = sequelize;
}

export default <DbConnection>db