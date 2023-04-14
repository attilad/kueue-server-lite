// app.ts
import Koa from "koa";
import Router from "koa-router";
import bodyParser from "koa-bodyparser";
import cors from "@koa/cors";
import { createServer } from "http";
import { Server } from 'socket.io';

import { KaraokeQueue } from "./karaokeQueue";

const app = new Koa();
const router = new Router();
const karaoke = new KaraokeQueue();

interface AddSingerRequestBody {
  name?: string;
}

function isAddSingerRequestBody(obj: any): obj is AddSingerRequestBody {
  return (
    obj && (typeof obj.name === "string" || typeof obj.name === "undefined")
  );
}

router.post("/reset", (ctx) => {
  karaoke.reset();
  ctx.status = 200;
});

router.get("/current", (ctx) => {
  ctx.body = {
    currentSinger: karaoke.currentSinger(),
  };
});

router.post("/next", (ctx) => {
  ctx.body = {
    nextSinger: karaoke.nextSinger(),
  };
});

router.get("/singers", (ctx) => {
  ctx.body = {
    singers: karaoke.showSingers(),
  };
});

router.post("/add", (ctx) => {
  const requestBody = ctx.request.body;

  if (!isAddSingerRequestBody(requestBody)) {
    ctx.throw(400, "Invalid request body.");
  }

  const { name } = requestBody as AddSingerRequestBody;
  if (!name) {
    ctx.throw(400, "Name is required.");
  }

  const [success, message] = karaoke.addSinger(name as string);
  if (!success) {
    ctx.status = 409; // Conflict status code
    ctx.body = {
      error: message,
    };
  } else {
    ctx.body = {
      message: message,
    };
  }
});

router.post("/add-priority", (ctx) => {
  const requestBody = ctx.request.body;

  if (!isAddSingerRequestBody(requestBody)) {
    ctx.throw(400, "Invalid request body.");
  }

  const { name } = requestBody as AddSingerRequestBody;
  if (!name) {
    ctx.throw(400, "Name is required.");
  }

  const [success, message] = karaoke.addPrioritySinger(name as string);
  if (!success) {
    ctx.status = 409; // Conflict status code
    ctx.body = {
      error: message,
    };
  } else {
    ctx.body = {
      message: message,
    };
  }
});

router.post("/remove", (ctx) => {
  const requestBody = ctx.request.body;

  if (!isAddSingerRequestBody(requestBody)) {
    ctx.throw(400, "Invalid request body.");
  }

  const { name } = requestBody as AddSingerRequestBody;
  if (!name) {
    ctx.throw(400, "Name is required.");
  }

  const [success, message] = karaoke.removeSinger(name as string);
  if (!success) {
    ctx.status = 404; // Not Found status code
    ctx.body = {
      error: message,
    };
  } else {
    ctx.body = {
      message: message,
    };
  }
});

router.post("/bump", (ctx) => {
  const requestBody = ctx.request.body;

  if (!isAddSingerRequestBody(requestBody)) {
    ctx.throw(400, "Invalid request body.");
  }

  const { name } = requestBody as AddSingerRequestBody;
  if (!name) {
    ctx.throw(400, "Name is required.");
  }

  const [success, message] = karaoke.bumpSinger(name as string);
  if (!success) {
    ctx.status = 404; // Not Found status code
    ctx.body = {
      error: message,
    };
  } else {
    ctx.body = {
      message: message,
    };
  }
});

app.use(bodyParser());
app.use(cors());

app.use(router.routes());
app.use(router.allowedMethods());

const httpServer = createServer(app.callback());
const io = new Server(httpServer, {
  cors: {
    origin: '*',
  }
});

const port = process.env.PORT || 3030;
httpServer.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

io.on('connection', (socket) => {
  console.log('Client connected');
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

karaoke.onUpate = (singers) => {
  io.emit('singers', singers);
};