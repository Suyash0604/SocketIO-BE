require("dotenv").config();
const app = require("./src/app");

const { createServer } = require("http");
const { Server } = require("socket.io");

const generateResponse = require("./services/ai.service");

const chatHistory = [];

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors:{
    origin:"http://localhost:5173"
  }
  
});

io.on("connection", (socket) => {
  console.log("User Connected");

  socket.on("message", async (data) => {
    chatHistory.push({
      role: "user",
      parts: [{ text: data }],
    });

    const response = await generateResponse(chatHistory);
    chatHistory.push({
      role: "model",
      parts: [{ text: response }],
    });
    socket.emit("response", { response });
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

app.get("/", (req, res) => {
  res.send("hellooooo");
});

httpServer.listen(3000, () => {
  console.log("server is running on 3000");
});
