import {Sequelize} from "sequelize";
import model from "./connector.model.js";
const sequelize=new Sequelize({dialect:"sqlite",storage:process.env.DB_STORAGE||"connector.sqlite",logging:false});
const Connector=model(sequelize);export {sequelize,Connector};