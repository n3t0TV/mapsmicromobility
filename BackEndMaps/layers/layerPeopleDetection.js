const layerVending = require('./layerVending')
const { response, request } = require('express');
const dbVending = require('../../../dbvending/db')();

//Get All register
const FindPeopleDetectionAll = async() =>{
    try
    {
        const people = await(await dbVending).PeopleDetection.findAll();
        return people;
    }
    catch(e)
    {
        console.log(e)
    }
}

const GetAllPeopleDetection =(request, response) =>
{
    FindPeopleDetectionAll().then((result)=>
    {
        response.status(200).json(result);
    }).catch(e => {
        console.log(e)
      response.status(401).json({message: 'Operation failed to execute',error: e, status: 401}); 
    })
}

//Create Geojson file to people detection
const peopledetection = (request, response) =>
{
    var gj = {
        "type": "FeatureCollection",
        "features":[]
    };

    FindPeopleDetectionAll().then((result)=>
    {
        var data = result
        for(i = 0; i<data.length; i++)
        {
            gj.features.push({
                "type": "Feature",
                "properties": [
                    {
                        "total": result[i].quantity,
                        "starttime": result[i].starttime,
                        "endtime": result[i].endtime
                    }
                ],
                "geometry":{
                    "type": "Point",
                    "coordinates":[result[i].lng, result[i].lat]
                }
            });
        }
        response.json(gj);
    }).catch(e => {
        console.log(e)
      response.status(401).json({message: 'Operation failed to execute',error: e, status: 401}); 
    })
}


//Create json file to people detection
const peopledetectionjson = (request, response) =>
{
    FindPeopleDetectionAll().then((result)=>
    {
        var data = result

        response.status(200).json(data)
    }).catch(e => {
        console.log(e)
      response.status(401).json({message: 'Operation failed to execute',error: e, status: 401}); 
    })
}

module.exports = {
    GetAllPeopleDetection,
    peopledetection,
    peopledetectionjson
}