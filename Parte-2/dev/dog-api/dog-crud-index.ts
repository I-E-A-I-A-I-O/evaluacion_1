import express, { Request, Response } from 'express';
import http from 'http';
import logger from '../utils/logger/logger';

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3002;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/dogs/:id', async (req: Request, res: Response) => {
    res.sendStatus(200);
});


server.listen(PORT, () => {
    console.info(`Server running on port ${PORT}`);
});
