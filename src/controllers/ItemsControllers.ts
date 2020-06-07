import { Request, Response } from 'express';
import knex from '../database/connection';
import CONSTANTS from '../config/constants';

class ItemsControllers {
    async index(request: Request, response: Response) {
        const items = await knex('items').select('*');
    
        const serializedItems = items.map(item => {
            item.image_url = `${CONSTANTS.external_ip}:${CONSTANTS.port}/files/${item.image}`;
            return item;
        });
    
        return response.json(serializedItems);
    }
}

export default new ItemsControllers();