'use strict'

module.exports = function setupPayload (payloadModel) {
  async function createOrUpdate (payload) {
    const cond = {
      where: {
        id: payload.id
      }
    }

    const existingEstacion = await payloadModel.findOne(cond)
    if (existingEstacion) {
      const updated = await payloadModel.update(payload, cond)
      return updated ? payloadModel.findOne(cond) : payloadModel
    }

    const result = await payloadModel.create(payload)
    return result.toJSON()
  }

  async function findById (id) {
    return await payloadModel.findOne({
      where: {
        id
      }
    })
  }

  async function findAll () {
    return await payloadModel.findAll()
  }

  async function deleteById (id) {
    return await payloadModel.destroy({
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
