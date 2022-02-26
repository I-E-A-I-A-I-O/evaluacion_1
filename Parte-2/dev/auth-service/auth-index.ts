import express, { Request, Response } from 'express';
import http from 'http';
import morganMiddleware from '../utils/logger/morgan';
import { getClient } from '../services/database/database';
import logger from '../utils/logger/logger';
import bcrypt from 'bcrypt';
import { Register as RegisterRequestBody } from '../types/requests';
import queriesJson from '../services/database/queries.json';

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morganMiddleware);

app.post('/users', async (req: Request, res: Response) => {
    const body = req.body as RegisterRequestBody;
    
    if (!body.password || !body.username) {
        logger.info(`Registration failed for ${req.ip}. Reason: Missing fields.`);
        return res.status(400).send('nombre o contraseña no fueron proporcionados. Verifique los campos e intente de nuevo.');
    }

    try {
        const client = await getClient();
        const result = await client.query(queriesJson.selectUserByName, [ body.username ]);

        if (result.rowCount > 0) {
            logger.info(`Registration failed for ${req.ip}. Reason: username already in use.`);
            return res.status(400).send(`Registro fallido. El nombre ${body.username} ya se encuentra en uso.`);
        }


    } catch(err) {
        logger.error(err);
        res.status(500).send('Error completando el registro. Intente de nuevo mas tarde.');
    }
});

server.listen(PORT, () => {
    console.info(`Server running on port ${PORT}`);
});
