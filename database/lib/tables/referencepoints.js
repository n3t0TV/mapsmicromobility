'use strict'

module.exports = function setupReferencePoints (referencesPointsModel) {
  async function createOrUpdate (referencePoints) {
    const cond = {
      where: {
        id: referencePoints.id
      }
    }

    const existingEstacion = await referencesPointsModel.findOne(cond)
    if (existingEstacion) {
      const updated = await referencesPointsModel.update(referencePoints, cond)
      return updated ? referencesPointsModel.findOne(cond) : referencesPointsModel
    }

    const result = await referencesPointsModel.create(referencePoints)
    return result.toJSON()
  }

  async function findById (id) {
    return await referencesPointsModel.findOne({
      where: {
        id
      }
    })
  }

  async function findAll () {
    return await referencesPointsModel.findAll()
  }

  async function deleteById (id) {
    return await referencesPointsModel.destroy({
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
