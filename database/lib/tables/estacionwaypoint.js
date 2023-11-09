'use strict'

module.exports = function setupEstacionWaypoints (estacionWayPointsModel) {
  async function createOrUpdate (estacionWaypoints) {
    const cond = {
      where: {
        id: estacionWaypoints.id
      }
    }

    const existingEstacion = await estacionWayPointsModel.findOne(cond)
    if (existingEstacion) {
      const updated = await estacionWayPointsModel.update(estacionWaypoints, cond)
      return updated ? estacionWayPointsModel.findOne(cond) : estacionWayPointsModel
    }

    const result = await estacionWayPointsModel.create(estacionWaypoints)
    return result.toJSON()
  }

  async function findById (id) {
    return await estacionWayPointsModel.findOne({
      where: {
        id
      }
    })
  }

  async function findAll () {
    return await estacionWayPointsModel.findAll()
  }

  async function deleteById (id) {
    return await estacionWayPointsModel.destroy({
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
