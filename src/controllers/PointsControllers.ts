import { Request, Response } from 'express';
import knex from '../database/connection';
import CONSTANTS from '../config/constants';

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

        const points = await knex('points')
            .join('points_items', 'points.id', '=', 'points_items.point_id')
            .whereIn('points_items.item_id', parsedItems)
            .where('city', String(city).toLowerCase())
            .where('uf', String(uf).toLowerCase())
            .distinct()
            .select('points.*');

        const serializedPoints = points.map(point => {
            return {
                ...point,
                image_url: `${CONSTANTS.external_ip}:${CONSTANTS.port}/files/uploads/${point.image}`
            }
        });

        return response.json(serializedPoints);
    }

    async show(request: Request, response: Response) {
        const { id } = request.params;

        const point = await knex('points')
            .where('id', id).first();

        if (!point) {
            return response.status(400).json({ message: 'Point not found!' });
        }

        const serializedPoints = {
            ...point,
            image_url: `${CONSTANTS.external_ip}:${CONSTANTS.port}/files/uploads/${point.image}`
        };

        const items = await knex('items')
            .join('points_items', 'items.id', '=', 'points_items.item_id')
            .where('points_items.point_id', id)
            .select('items.title');

        return response.json({ point: serializedPoints, items });
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
            image: request.file.filename,
            name,
            email: email.toLowerCase(),
            whatsapp,
            city: city.toLowerCase(),
            uf: uf.toLowerCase(),
            latitude: Number(latitude),
            longitude: Number(longitude),
        };

        // Etapa: Responsável por garantir que todos os inserts sejam executados.
        // Etapa: Se algum insert der erro o 'trx' executa um rollback nos dados.
        // Etapa: Garantindo assim que um dado não seja salvo e o outro não.
        // Etapa: Desta forma se um insert der erro logo todos os outros não serão executados.
        const trx = await knex.transaction();
    
        const insertedPointsId = await trx('points').insert(point);
    
        const point_id = insertedPointsId[0];
    
        const pointsItems = items
            .split(',')
            .map((item: string) => Number(item.trim()))
            .map((item_id: number) => {
                return {
                    item_id,
                    point_id
                }
            });
    
        await trx('points_items').insert(pointsItems);

        // Etapa: Informa que o 'trx' executou todas as transações corretas.
        // Etapa: Só então depois disso ele commita as informações no banco de dados.
        await trx.commit();

        return response.json({ id: point_id, ...point });
    }
}

export default new PointsControllers();