import { Router } from "express";
import { Request, Response } from "express";
import subsciberRouter from "./subscriber.routes";
import messageRouter from "./message.routes"
import courseRouter from "./course.routes"

const routes = Router();

// routes.get("/", (req: Request, res: Response) => {
//   console.log("res",res);
//   res.json({
//     hello: "hello world",
//   });
// });
routes.use("/message", messageRouter)
routes.use("/subscriber", subsciberRouter);
routes.use("/course", courseRouter)
export default routes;
