import express from 'express'
import { createServer } from "http";
import { Server } from "socket.io";
import dotenv from 'dotenv';
import { connectDB } from "./config/db.js"
import authRoutes from "./routes/authRoute.js";
import blogRoutes from "./routes/blogRoute.js";
import userRoutes from "./routes/userRoutes.js";
import auditRoutes from "./routes/auditRoute.js";
import commentRoutes from "./routes/commentRoute.js";
import { registerCommentSocket } from "./socket/comments.socket.js";
import path from "path";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from './config/swagger.js';


import cors from 'cors';


dotenv.config();
connectDB();

const app = express()
const httpServer = createServer(app);
const allowedOrigins = ["http://localhost:5174", "http://localhost:5173"];
const io = new Server(httpServer, { cors: { origin: allowedOrigins, credentials: true } });
app.set("io", io);
registerCommentSocket(io);
app.use(cors({
    origin: allowedOrigins,
    credentials:true
}))
app.use(express.json())

app.use("/api-docs",swaggerUi.serve, swaggerUi.setup(swaggerSpec))





app.use("/auth",authRoutes);
app.use("/api",blogRoutes);
app.use("/api",auditRoutes);
app.use("/api",userRoutes);
app.use("/api",commentRoutes);



app.use(
  "/uploads",
  express.static(path.join(process.cwd(), "uploads"))
);


httpServer.listen(process.env.PORT , ()=>{
    console.log(`server running ${process.env.PORT}`)

})
