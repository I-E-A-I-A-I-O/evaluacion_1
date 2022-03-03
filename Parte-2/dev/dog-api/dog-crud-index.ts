import dotenv from "dotenv";
dotenv.config();
import express, { NextFunction, Request, Response } from "express";
import http from "http";
import logger from "../utils/logger/logger";
import { DogRequest } from "../types/requests";
import { DogSelect } from "../types/DBTypes";
import queriesJson from "../services/database/queries.json";
import { getClient } from "../services/database/database";
import morganMiddleware from "../utils/logger/morgan";

const app = express();
const server = http.createServer(app);
const PORT = process.env.DOG_PORT;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morganMiddleware);

const dogOwnershipMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { userId, dogId } = req.params;
  const dbclient = await getClient();
  const result = await dbclient.query<DogSelect>(queriesJson.selectByDogId, [
    Number.parseInt(dogId),
  ]);

  if (result.rowCount < 1)
    return res.status(404).send(`No existe un perro con la id ${dogId}`);

  const dog = result.rows[0];

  if (dog.dog_owner_id !== Number.parseInt(userId)) {
    logger.warn(
      `User ${userId} tried to access dog ${dog.dog_id} from ${req.ip}`
    );
    return res
      .status(401)
      .send("No tienes permiso para acceder a los datos de este perro.");
  }

  next();
};

app.get("/users/:userId", async (req: Request, res: Response) => {
  const { userId } = req.params;
  const dbclient = await getClient();
  const result = await dbclient.query<DogSelect>(queriesJson.selectByOwner, [
    userId,
  ]);
  res.status(200).json(result.rows);
});

app.get(
  "/users/:userId/dogs/:dogId",
  dogOwnershipMiddleware,
  async (req: Request, res: Response) => {
    const { userId, dogId } = req.params;
    const dbclient = await getClient();
    const result = await dbclient.query<DogSelect>(queriesJson.selectByDogId, [
      Number.parseInt(dogId),
    ]);
    const dog = result.rows[0];
    res.status(200).json({
      id: dog.dog_id,
      name: dog.dog_name,
      age: dog.dog_age,
      breed: dog.dog_breed,
    });
  }
);

app.post("/users/:userId/dogs", async (req: Request, res: Response) => {
  const { userId } = req.params;
  const dbclient = await getClient();
  const { dog_age, dog_name, dog_breed } = req.body as DogRequest;

  if (!dog_age || !dog_breed || !dog_name)
    return res
      .status(400)
      .send(
        "Error completando registro. Algunos campos requeridos no fueron proporcionados."
      );

  try {
    const result = await dbclient.query<DogSelect>(queriesJson.insertDog, [
      dog_name,
      dog_age,
      dog_breed,
      userId,
    ]);
    const dog = result.rows[0];
    logger.info(`Registered dog with id ${dog.dog_id} for user ${userId}`);
    res.status(201).json({
      id: dog.dog_id,
      name: dog.dog_name,
      age: dog.dog_age,
      breed: dog.dog_breed,
    });
  } catch (err) {
    logger.error(err);
    res
      .status(500)
      .send("No se pudo completar el registro. Intente de nuevo mas tarde.");
  }
});

app.patch(
  "/users/:userId/dogs/:dogId",
  dogOwnershipMiddleware,
  async (req: Request, res: Response) => {
    const { userId, dogId } = req.params;
    const { dog_age, dog_name, dog_breed } = req.body as DogRequest;

    if (!dog_age || !dog_breed || !dog_name)
      return res
        .status(400)
        .send(
          "Error actualizando los datos. Algunos campos requeridos no fueron proporcionados."
        );

    try {
      const dbclient = await getClient();
      const result = await dbclient.query<DogSelect>(queriesJson.updateDog, [
        dog_name,
        dog_age,
        dog_breed,
        Number.parseInt(dogId),
      ]);
      const dog = result.rows[0];
      logger.info(`User with id ${userId} deleted dog with id ${dogId} from ${req.ip}`);
      res.status(200).json({
        id: dog.dog_id,
        name: dog.dog_name,
        age: dog.dog_age,
        breed: dog.dog_breed,
      });
    } catch (err) {
      logger.error(err);
      res.status(500).send("Error actualizando los datos.");
    }
  }
);

app.delete(
  "/users/:userId/dogs/:dogId",
  dogOwnershipMiddleware,
  async (req: Request, res: Response) => {
    const { userId, dogId } = req.params;

    try {
      const dbclient = await getClient();
      const result = await dbclient.query(queriesJson.deleteDog, [ dogId ]);
      logger.info(`User with id ${userId} deleted dog with id ${dogId} from ${req.ip}`);
      res.status(200).send('Registro borrado exitosamente.');
    } catch (err) {
      logger.error(err);
      res.status(500).send('Error borrando el registro.');
    }
  }
);

server.listen(PORT, () => {
  console.info(`Server running on port ${PORT}`);
});
