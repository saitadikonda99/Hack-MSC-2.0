import { createClient } from 'redis';

export const redisClient = createClient({
    url: process.env.REDIS_URL
});

redisClient.connect()
    .then(() => {
        console.log('Connected to Redis');
    })
    .catch(error => {
        console.error('Error connecting to Redis:', error);
    });

redisClient.on('error', (error) => {
    console.error('Redis Client Error:', error);
});