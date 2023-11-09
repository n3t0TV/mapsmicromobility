'use strict'

module.exports = function setupEstadisticas (estadisticasModel) {
  async function createOrUpdate (estadisticas) {
    const cond = {
      where: {
        id: estadisticas.id
      }
    }

    const existingEstacion = await estadisticasModel.findOne(cond)
    if (existingEstacion) {
      const updated = await estadisticasModel.update(estadisticas, cond)
      return updated ? estadisticasModel.findOne(cond) : estadisticasModel
    }

    const result = await estadisticasModel.create(estadisticas)
    return result.toJSON()
  }

  async function findById (id) {
    return await estadisticasModel.findOne({
      where: {
        id
      }
    })
  }

  async function findAll () {
    return await estadisticasModel.findAll()
  }

  async function deleteById (id) {
    return await estadisticasModel.destroy({
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
