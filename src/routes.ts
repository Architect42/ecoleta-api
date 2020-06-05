import express from 'express';
import knex from './database/connection';

// Controllers
import PointsControllers from './controllers/PointsControllers';
import ItemsControllers from './controllers/ItemsControllers';

const routes = express.Router();

routes.get('/items', ItemsControllers.index);

routes.post('/points', PointsControllers.create);
routes.get('/points', PointsControllers.index);
routes.get('/points/:id', PointsControllers.show);

export default routes;