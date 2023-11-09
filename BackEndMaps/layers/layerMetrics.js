const { response, request } = require('express');
const dbVending = require('../../../dbvending/db')();

//Save or update metrics red
const PostMetricRed = async (MetricModel) => {
    //console.log("MetricModel",MetricModel)
    try {
        const metric = await (await dbVending).MetricRed.createOrUpdate(MetricModel)
        return metric
    }catch(e){
        throw new Error(e)
        console.log("error:", e)
    }
}


module.exports = {
    PostMetricRed
}

