import { Request, Response } from 'express';
import knex from '../database/connection';

class PointsControllers {

    async index(request: Request, response: Response) {
        const { city, uf, items } = request.query;

        if (!city) {
            const message = 'Params city not found!';
            return response.status(400).json({ message })
        }

        if (!uf) {
            const message = 'Params uf not found!';
            return response.status(400).json({ message })
        }

        if (!items) {
            const message = 'Params items not found!';
            return response.status(400).json({ message })
        }

        const parsedItems = String(items).split(',')
            .map(item => Number(item.trim()));

        const point = await knex('points')
            .join('points_items', 'points.id', '=', 'points_items.point_id')
            .whereIn('points_items.item_id', parsedItems)
            .where('city', String(city).toLowerCase())
            .where('uf', String(uf).toLowerCase())
            .distinct()
            .select('points.*');

        return response.json(point);
    }

    async show(request: Request, response: Response) {
        const { id } = request.params;

        const point = await knex('points')
            .where('id', id).first();

        if (!point) {
            return response.status(400).json({ message: 'Point not found!' });
        }

        const items = await knex('items')
            .join('points_items', 'items.id', '=', 'points_items.item_id')
            .where('points_items.point_id', id)
            .select('items.title');

        return response.json({ point, items });
    }

    async create(request: Request, response: Response) {
        const {
            name,
            email,
            whatsapp,
            city,
            uf,
            latitude,
            longitude,
            items
        } = request.body;
    
        const point = {
            image: 'https://images.unsplash.com/photo-1515936185222-2223551e65e0?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=400&q=80',
            name,
            email: email.toLowerCase(),
            whatsapp,
            city: city.toLowerCase(),
            uf: uf.toLowerCase(),
            latitude,
            longitude,
        };

        // Etapa: Responsável por garantir que todos os inserts sejam executados.
        // Etapa: Se algum insert der erro o 'trx' executa um rollback nos dados.
        // Etapa: Garantindo assim que um dado não seja salvo e o outro não.
        // Etapa: Desta forma se um insert der erro logo todos os outros não serão executados.
        const trx = await knex.transaction();
    
        const insertedPointsId = await trx('points').insert(point);
    
        const point_id = insertedPointsId[0];
    
        const pointsItems = items.map((item_id: number) => {
            return {
                item_id,
                point_id
            }
        })
    
        await trx('points_items').insert(pointsItems);

        // Etapa: Informa que o 'trx' executou todas as transações corretas.
        // Etapa: Só então depois disso ele commita as informações no banco de dados.
        await trx.commit();

        return response.json({ id: point_id, ...point });
    }
}

export default new PointsControllers();