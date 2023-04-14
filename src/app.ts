// app.ts
import Koa from "koa";
import Router from "koa-router";
import bodyParser from "koa-bodyparser";
import cors from "@koa/cors";
import WebSocket from "ws";

import { KaraokeQueue } from "./karaokeQueue";

const app = new Koa();
const router = new Router();
const karaoke = new KaraokeQueue({
  broadcastUpdate: (singers) => {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN)
        client.send(JSON.stringify(singers));
    });
  },
});

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

const wss = new WebSocket.Server({ noServer: true });

wss.on("connection", (ws) => {
  console.log("Client connected");

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});

app.use(router.routes());
app.use(router.allowedMethods());

const port = process.env.PORT || 3030;
const server = app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

server.on("upgrade", (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit("connection", ws, request);
  });
});
