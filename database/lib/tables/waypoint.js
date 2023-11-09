'use strict'

module.exports = function setupWaypoint (wayPointModel) {
  async function createOrUpdate (wayPoint) {
    const cond = {
      where: {
        id: wayPoint.id
      }
    }

    const existingEstacion = await wayPointModel.findOne(cond)
    if (existingEstacion) {
      const updated = await wayPointModel.update(wayPoint, cond)
      return updated ? wayPointModel.findOne(cond) : wayPointModel
    }

    const result = await wayPointModel.create(wayPoint)
    return result.toJSON()
  }

  async function findById (id) {
    return await wayPointModel.findOne({
      where: {
        id
      }
    })
  }

  async function findAll () {
    return await wayPointModel.findAll()
  }

  async function deleteById (id) {
    return await wayPointModel.destroy({
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
