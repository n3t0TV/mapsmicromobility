'use strict'

module.exports = function setupViaje (viajeModel) {
  async function createOrUpdate (viaje) {
    const cond = {
      where: {
        id: viaje.id
      }
    }

    const existingEstacion = await viajeModel.findOne(cond)
    if (existingEstacion) {
      const updated = await viajeModel.update(viaje, cond)
      return updated ? viajeModel.findOne(cond) : viajeModel
    }

    const result = await viajeModel.create(viaje)
    return result.toJSON()
  }

  async function findById (id) {
    return await viajeModel.findOne({
      where: {
        id
      }
    })
  }

  async function findAll () {
    return await viajeModel.findAll()
  }

  async function deleteById (id) {
    return await viajeModel.destroy({
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
