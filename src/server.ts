import express from 'express';
import routes from './routes';
import path from 'path';
import cors from 'cors';
import { errors } from 'celebrate';
import CONSTANTS from './config/constants';

const app = express();

app.use(cors());

// Etapa: Injeta no app a habilidade de ler JSON enviado por body por exemplo.
app.use(express.json());
app.use(routes);

app.use('/files', express.static(path.resolve(__dirname, '..', 'tmp')));

app.use(errors());

app.listen(CONSTANTS.port).once('listening', () => {
    console.log(`O serviço esta rodando na porta ${CONSTANTS.port}, ${CONSTANTS.external_ip}:${CONSTANTS.port}`);
});