"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageStatus = void 0;
exports.connectDatabase = connectDatabase;
exports.getImagesCollection = getImagesCollection;
exports.toObjectId = toObjectId;
exports.isValidObjectId = isValidObjectId;
exports.disconnectDatabase = disconnectDatabase;
const mongodb_1 = require("mongodb");
const config_1 = require("../config");
const logger_1 = require("./logger");
var ImageStatus;
(function (ImageStatus) {
    ImageStatus["PENDING"] = "PENDING";
    ImageStatus["PROCESSING"] = "PROCESSING";
    ImageStatus["ACCEPTED"] = "ACCEPTED";
    ImageStatus["REJECTED"] = "REJECTED";
})(ImageStatus || (exports.ImageStatus = ImageStatus = {}));
const globalForMongo = globalThis;
let db;
async function connectDatabase() {
    try {
        const client = globalForMongo.mongoClient ??
            new mongodb_1.MongoClient(config_1.config.database.url, {
                serverSelectionTimeoutMS: 10000,
            });
        await client.connect();
        db = client.db();
        if (process.env.NODE_ENV !== 'production') {
            globalForMongo.mongoClient = client;
        }
        await db.collection('images').createIndex({ status: 1 });
        await db.collection('images').createIndex({ hash: 1 });
        await db.collection('images').createIndex({ createdAt: -1 });
        logger_1.logger.info('Database connected successfully');
    }
    catch (error) {
        logger_1.logger.error('Failed to connect to database', error);
        throw error;
    }
}
function getImagesCollection() {
    if (!db) {
        throw new Error('Database not connected');
    }
    return db.collection('images');
}
function toObjectId(id) {
    return new mongodb_1.ObjectId(id);
}
function isValidObjectId(id) {
    return mongodb_1.ObjectId.isValid(id);
}
async function disconnectDatabase() {
    if (globalForMongo.mongoClient) {
        await globalForMongo.mongoClient.close();
        globalForMongo.mongoClient = undefined;
        logger_1.logger.info('Database disconnected');
    }
}
//# sourceMappingURL=mongodb.js.map