import dotenv from "dotenv";
dotenv.config();
import express, { NextFunction, Request, Response } from "express";
import http from "http";
import jwt from "jsonwebtoken";
import compression from "compression";
import logger from "../utils/logger/logger";
import morganMiddleware from "../utils/logger/morgan";
import fetch from "node-fetch";

const app = express();
const server = http.createServer(app);
const PORT = process.env.PROXY_PORT;

const filterRequests = (req: Request, res: Response) => {
  const encoding = req.headers["accept-encoding"];

  if (!encoding || encoding !== "gzip") return false;

  return true;
};

app.use(
  compression({
    filter: filterRequests,
    threshold: 0,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morganMiddleware);

const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers["authorization"];

  if (!header) return res.status(401).send("Permisos insuficientes.");

  jwt.verify(header, process.env.JWT_SECRET, (err, p) => {
    if (err) {
      logger.warn(`Access attemp from ${req.ip} with expired token ${header}`);
      return res.status(401).send("Token expirado.");
    }

    const payload = p as { id: number };
    req.userId = payload.id;
    next();
  });
};

app.get("/dogs", verifyToken, async (req: Request, res: Response) => {
  const response = await fetch(
    `http://localhost:${process.env.DOG_PORT}/users/${req.userId}`,
    {
      method: "GET",
    }
  );

  if (response.headers.get("content-type") === "application/json") {
    const resBody = await response.json();
    res.status(response.status).json(resBody);
  } else {
    const resBody = await response.text();
    res.status(response.status).send(resBody);
  }
});

app.get("/dogs/:id", verifyToken, async (req: Request, res: Response) => {
  const { id } = req.params;

  const response = await fetch(
    `http://localhost:${process.env.DOG_PORT}/users/${req.userId}/dogs/${id}`,
    {
      method: "GET",
    }
  );

  if (response.headers.get("content-type") === "application/json") {
    const resBody = await response.json();
    res.status(response.status).json(resBody);
  } else {
    const resBody = await response.text();
    res.status(response.status).send(resBody);
  }
});

app.post("/dogs", verifyToken, async (req: Request, res: Response) => {
  const response = await fetch(
    `http://localhost:${process.env.DOG_PORT}/users/${req.userId}/dogs`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body),
    }
  );

  if (response.headers.get("content-type") === "application/json") {
    const resBody = await response.json();
    res.status(response.status).json(resBody);
  } else {
    const resBody = await response.text();
    res.status(response.status).send(resBody);
  }
});

app.patch("/dogs/:dogId", verifyToken, async (req: Request, res: Response) => {
  const { dogId } = req.params;

  const request = fetch(
    `http://localhost:${process.env.DOG_PORT}/users/${req.userId}/dogs/${dogId}`,
    {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(req.body)
    }
  );

  try {
    const response = await request;

    if (response.headers.get("content-type") === "application/json") {
      const resBody = await response.json();
      res.status(response.status).json(resBody);
    } else {
      const resBody = await response.text();
      res.status(response.status).send(resBody);
    }
  } catch (err) {
    logger.error(err);
    res.status(500).send("Error completado la solicitud.");
  }
});

app.delete("/dogs/:dogId", verifyToken, async (req: Request, res: Response) => {
    const { dogId } = req.params;
    const request = fetch(`http://localhost:${process.env.DOG_PORT}/users/${req.userId}/dogs/${dogId}`, {
        method: 'DELETE'
    });

    try {
        const response = await request;
        
        if (response.headers.get("content-type") === "application/json") {
            const resBody = await response.json();
            res.status(response.status).json(resBody);
        } else {
            const resBody = await response.text();
            res.status(response.status).send(resBody);
        }
    } catch (err) {
        logger.error(err);
        res.status(500).send('Error borrando el registro.');
    }
});

server.listen(PORT, () => {
  console.info(`Server running on port ${PORT}`);
});
