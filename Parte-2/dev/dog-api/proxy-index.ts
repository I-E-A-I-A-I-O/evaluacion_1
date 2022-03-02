import express, { Request, Response } from 'express';
import http from 'http';
import jwt from 'jsonwebtoken';
import compression from 'compression';
import logger from '../utils/logger/logger';

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3001;

const filterRequests = (req: Request, res: Response) => {
    const encoding = req.headers['accept-encoding'];
    
    if (!encoding || encoding !== 'gzip') return false;

    return true;
};

app.use(compression({
    filter: filterRequests,
    threshold: 0
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/dogs/:id', async (req: Request, res: Response) => {
    res.sendStatus(200);
});


server.listen(PORT, () => {
    console.info(`Server running on port ${PORT}`);
});