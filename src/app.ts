// app.ts
import Koa from "koa";
import Router from "koa-router";
import bodyParser from "koa-bodyparser";
import cors from "@koa/cors";
import { createServer } from "http";
import { Server } from 'socket.io';
import { z, AnyZodObject } from "zod";

import { KaraokeQueue } from "./karaokeQueue";

const app = new Koa();
const router = new Router();
const karaoke = new KaraokeQueue();

const MutateSingerSchema = z.object({
  name: z.string()
});

type MutateSingerSchema = z.infer<typeof MutateSingerSchema>;

const AddManySchema = z.object({
  names: z.array(z.string())
});

type AddManySchema = z.infer<typeof AddManySchema>;

const validateBody = (schema: AnyZodObject) => (ctx: Koa.Context, next: () => Promise<any>) => {
  try {
    schema.parse(ctx.request.body);
    return next();
  } catch (err) {
    ctx.throw(400, "Invalid request body.");
  }
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

router.post("/back", (ctx) => {
  ctx.body = {
    previousSinger: karaoke.previousSinger(),
  };
});

router.get("/singers", (ctx) => {
  ctx.body = {
    singers: karaoke.showSingers(),
  };
});

router.post("/add", validateBody(MutateSingerSchema), (ctx) => {
  const { name } = ctx.request.body as MutateSingerSchema;
  
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

router.post("/add-many", validateBody(AddManySchema),(ctx) => {
  const { names } = ctx.request.body as AddManySchema;

  let allSuccess = true;
  let messages: string[] = [];

  for (const name of names) {
    const [success, message] = karaoke.addSinger(name as string);
    if (!success) {
      allSuccess = false;
    }
    
    if(message) messages.push(message);
  }

  if (!allSuccess) {
    ctx.status = 409; // Conflict status code
    ctx.body = {
      error: messages,
    };
  } else {
    ctx.body = {
      message: messages,
    };
  }
});

router.post("/add-priority", validateBody(MutateSingerSchema), (ctx) => {
  const { name } = ctx.request.body as MutateSingerSchema;

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

router.post("/remove", validateBody(MutateSingerSchema), (ctx) => {
  const { name } = ctx.request.body as MutateSingerSchema;

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

router.post("/bump", validateBody(MutateSingerSchema), (ctx) => {
  const { name } = ctx.request.body as MutateSingerSchema;

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