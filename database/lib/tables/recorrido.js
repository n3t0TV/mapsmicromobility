'use strict'

module.exports = function setupRecorrido (recorridoModel) {
  async function createOrUpdate (recorrido) {
    const cond = {
      where: {
        id: recorrido.id
      }
    }

    const existingEstacion = await recorridoModel.findOne(cond)
    if (existingEstacion) {
      const updated = await recorridoModel.update(recorrido, cond)
      return updated ? recorridoModel.findOne(cond) : recorridoModel
    }

    const result = await recorridoModel.create(recorrido)
    return result.toJSON()
  }

  async function findById (id) {
    return await recorridoModel.findOne({
      where: {
        id
      }
    })
  }

  async function findAll () {
    return await recorridoModel.findAll()
  }

  async function deleteById (id) {
    return await recorridoModel.destroy({
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
