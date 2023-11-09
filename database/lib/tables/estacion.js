'use strict'

module.exports = function setupEstacion (estacionModel) {
  async function createOrUpdate (estacion) {
    const cond = {
      where: {
        id: estacion.id
      }
    }

    const existingEstacion = await estacionModel.findOne(cond)
    if (existingEstacion) {
      const updated = await estacionModel.update(estacion, cond)
      return updated ? estacionModel.findOne(cond) : estacionModel
    }

    const result = await estacionModel.create(estacion)
    return result.toJSON()
  }

  async function findById (id) {
    return await estacionModel.findOne({
      where: {
        id
      }
    })
  }

  async function findAll () {
    return await estacionModel.findAll()
  }

  async function deleteById (id) {
    return await estacionModel.destroy({
      where: {
        id
      }
    })
  }

  return {
    createOrUpdate,
    findById,
    findAll,
    deleteById
  }
}
