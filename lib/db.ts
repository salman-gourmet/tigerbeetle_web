import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://salmanplay788:salman123@gourmetpakistan.p9yw814.mongodb.net/tigerbeetle_web?retryWrites=true&w=majority&appName=gourmetpakistan';

if (!MONGO_URI) {
    throw new Error('Please define the MONGO_URI inside .env.local');
}

// 1. Define the interface for the cached object
interface MongooseCache {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
}

// 2. Extend the NodeJS global scope
declare global {
    var mongoose: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
    global.mongoose = cached;
}

async function connectMongo() {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        cached.promise = mongoose.connect(MONGO_URI!).then((mongoose) => {
            return mongoose;
        });
    }
    cached.conn = await cached.promise;
    return cached.conn;
}

export default connectMongo;