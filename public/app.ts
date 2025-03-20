import express, { Request, Response } from 'express';
import path from "path";

const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, '.')));


app.get('/', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});