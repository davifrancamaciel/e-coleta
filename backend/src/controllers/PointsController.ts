import { BASE_URL } from './../constants/config'
import { Request, Response } from 'express'
import knex from '../database/connection'

class PointsController {
  async index (request: Request, res: Response) {
    const { city, uf, items } = request.query

    const parseditems = String(items)
      .split(',')
      .map(item => Number(item.trim()))

    const points = await knex('points')
      .join('point_items', 'points.id', '=', 'point_items.point_id')
      .whereIn('point_items.item_id', parseditems)
      .where('city', String(city))
      .where('uf', String(uf))
      .distinct()
      .select('points.*')

    const serializedPoints = points.map(point => {
      return {
        ...point,
        image_url: `${BASE_URL}/uploads/${point.image}`
      }
    })

    return res.json(serializedPoints)
  }

  async show (request: Request, res: Response) {
    const { id } = request.params
    const point = await knex('points')
      .where('id', id)
      .first()

    if (!point) {
      return res.status(400).json({ message: 'Point not found' })
    }

    const items = await knex('items')
      .join('point_items', 'items.id', '=', 'point_items.item_id')
      .where('point_items.point_id', id)
      .select('items.title')

    const serializedPoint = {
      ...point,
      image_url: `${BASE_URL}/uploads/${point.image}`
    }
    return res.json({ serializedPoint, items })
  }

  async create (request: Request, res: Response) {
    const {
      name,
      email,
      whatsapp,
      latitude,
      longitude,
      city,
      uf,
      items
    } = request.body

    const trx = await knex.transaction()

    const point = {
      image: request.file.filename,
      name,
      email,
      whatsapp,
      latitude,
      longitude,
      city,
      uf
    }
    const insertedIds = await trx('points').insert(point)

    const point_id = insertedIds[0]

    const pointItems = items
      .split(',')
      .map((item: string) => Number(item.trim()))
      .map((item_id: Number) => {
        return {
          item_id,
          point_id
        }
      })
    await trx('point_items').insert(pointItems)

    trx.commit()
    return res.json({
      id: point_id,
      ...point
    })
  }
}

export default PointsController
