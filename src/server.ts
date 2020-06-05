import express from 'express';
import routes from './routes';
import path from 'path';
import cors from 'cors';

const app = express();

// Etapa: Definindo a porta que o projeto sera executado.
const listenPort = 3333;

app.use(cors());

// Etapa: Injeta no app a habilidade de ler JSON enviado por body por exemplo.
app.use(express.json());
app.use(routes);

app.use('/uploads', express.static(path.resolve(__dirname, '..', 'tmp')))

app.listen(listenPort).once('listening', () => {
    console.log(`O serviço esta rodando na porta ${listenPort} http://localhost:${listenPort}`);
});