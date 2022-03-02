import dotenv from 'dotenv';
dotenv.config();
import express, { Request, Response } from 'express';
import http from 'http';
import morganMiddleware from '../utils/logger/morgan';
import { getClient } from '../services/database/database';
import logger from '../utils/logger/logger';
import bcrypt from 'bcrypt';
import { Register as RegisterRequestBody } from '../types/requests';
import queriesJson from '../services/database/queries.json';
import jwt from 'jsonwebtoken';
import { UserSelect } from '../types/DBTypes';

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

        const password = await bcrypt.hash(body.password, 10);
        await client.query(queriesJson.insertUser, [ body.username, password ]);
        logger.info(`User ${body.username} created for ${req.ip}`);
        res.status(201).send('Usuario creado exitosamente.');
    } catch(err) {
        logger.error(err);
        res.status(500).send('Error completando el registro. Intente de nuevo mas tarde.');
    }
});

app.post('/users/:name', async (req: Request, res: Response) => {
    const { password } = req.body;
    const { name } = req.params;

    if (!password || !name) {
        logger.info(`Login failed for ${req.ip}. Reason: Missing fields.`);
        return res.status(400).send('nombre o contraseña no fueron proporcionados. Verifique los campos e intente de nuevo.');
    }

    try {
        const client = await getClient();
        const result = await client.query<UserSelect>(queriesJson.selectUserByName, [ name ]);

        if (result.rowCount < 1) {
            logger.info(`Login failed for ${req.ip}. Reason: username not found.`);
            return res.status(404).send(`Inicio de sesion fallido. El nombre ${name} no se encuentra registrado.`);
        }

        const user = result.rows[0];
        const same = await bcrypt.compare(password, user.user_password);

        if (!same) {
            logger.warn(`Login failed from ${req.ip} as user ${name}.`);
            res.status(401).send('Inicio de sesion fallido, clave incorrecta.');
            return;
        }

        const token = jwt.sign({ id: user.user_id }, process.env.JWT_SECRET, { expiresIn: '2h' });
        logger.info(`Login successful for user ${name} from ${req.ip}`);
        res.status(201).send(`Inicio de sesion exitoso. Tu token es ${token}`);
    } catch(err) {
        logger.error(err);
        res.status(500).send('Error completando el registro. Intente de nuevo mas tarde.');
    }
});

server.listen(PORT, () => {
    console.info(`Server running on port ${PORT}`);
});
