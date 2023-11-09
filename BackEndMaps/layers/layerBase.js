const { response, request } = require('express');
const XMLHttpRequest = require('xhr2')
const API_key = 'ac70a16406fc23a208e689d66dd8f795';
const dbVending = require('../../../dbvending/db')();
const Nomination = require('nominatim-browser');
const {parse, stringify} = require('flatted');

    //Get and return the wather for external API
    function getClima(lat,lng){
        const URL = 'https://api.openweathermap.org/data/2.5/weather?lat='+lat+'&lon='+lng+'&appid='+API_key;
        //console.log("URL:",URL);
       return new Promise(function(resolve, reject){
            var req = new XMLHttpRequest();
            req.open('GET',URL);
            req.onload = function() {
                if(req.status == 200){
                    resolve(JSON.parse(req.response));
                }
                else
                {
                    reject();
                }
            }
            req.send();
        })
    }

    //EndPoint to get and return the address for ReversGeocode
    const getAddress = (request, response) => 
    {
        let _lat = request.params.lat;
        let _lng = request.params.lng; 
        Nomination.reverseGeocode({
            lat:_lat,
            lon: _lng,
            addressdetails : true
        }).then(result =>{
            let address = result.address;
            var data = {
                "city": address.city,
                "state": address.state,
                "county": address.country_code.toUpperCase()
            }
            response.send(data)
        }).catch((e)=>{
            console.log(e);
        });
        
    }
    
    //EndPoint to get and return the wather
    const getWather = (request, response) => 
    {
        let lat = request.params.lat;
        let lng = request.params.lng;
        var id_city = 0;
        var city = [];
        getClima(lat, lng).then(r => {
                var data = {
                    "temperature": r.main.temp,
                    "wind": r.wind.speed,
                    "humidity": r.main.humidity,
                    "time_sunshine": r.sys.sunrise,
                    "time_sunset":r.sys.sunset,
                    "weekDay": new Date().getDate(),
                    "holiday": false
                };
                response.send(data)
             
        }).catch((e)=>{
            console.log("Error:", e);
        })
        
    }

    //Save wather in DB
    const saveWather = async (WatherModel) => {
        try{
            
            const wather = await(await dbVending).RegionTime.createOrUpdate(WatherModel)
            return wather;
        }
        catch(e){
            console.log(e)
        }       

    }

    //Save city in DB
    const saveCity = async (CityModel) =>{
        console.log("CityModel :",CityModel);
       try{
            const city = await(await dbVending).City.createOrUpdate(CityModel);
            return city;
        }
        catch(e){
            console.log(e)
        }

        
    }

    //Search the City in DB
    const FindCity = async (_city) =>{
        try{
            const city = await(await dbVending).City.findByName(_city);
            return city;
        }
        catch(e){
            console.log(e)
        }

        
    }

    //Save Region, City all in one
    const saveRegionCity = (request, response) =>
    {
        let lat = request.params.lat;
        let lng = request.params.lng;
        var city = {};
        var address;
        var time = {};
        var gCity = 0;
        var gTime = 0;
        //ReverseGeocode to find and save city, state and country
        Nomination.reverseGeocode({
            lat:lat,
            lon: lng,
            addressdetails : true
        }).then(result =>{
            address = result.address;

            //Check if the city exist
            FindCity(address.city).then(result =>{
                if(result != null)
                {
                    city = {
                        "id_city": result.id_city, 
                        "city": address.city,
                        "state": address.state,
                        "country": address.country_code.toUpperCase()
                    }
                }
                else{
                    city = {
                        "city": address.city,
                        "state": address.state,
                        "country": address.country_code.toUpperCase()
                    }
                }
                //console.log("City:",city);
                        //Save or update city
                        saveCity(city).then(result =>{
                            gCity = 1;
                        }).catch((e)=>{
                            console.log(e)
                        });
            })
        }).catch((error)=>{
            console.log(error);
        });
        //Return and save wather
        getClima(lat, lng).then(r => {
           time = {
                "temperature": r.main.temp,
                "wind": r.wind.speed,
                "humidity": r.main.humidity,
                "time_sunshine": r.sys.sunrise,
                "time_sunset":r.sys.sunset,
                "weekDay": new Date().getDate(),
                "holiday": false
            };
            //console.log("wather:",time);
                    //Save wather
                    saveWather(time).then(result =>{
                        gTime = 1
                    }).catch((e)=>{
                        console.log(e)
                    });    
        }).catch((e)=>{
            console.log(e);
        });
        console.log("gTime:",gTime)
        response.status(200).json({message:"Operation completed"})
        /*if( console.error() && gCity == 1)
        {
            response.status(200).json({message:"Operation completed"})
        }
        else{
            response.status(400).json({ message: 'Operation failed to execute', status: 401 })
        }*/

    }

    //Find and return all register in DB for wather
    const FindAllWather = async() =>
    {
        try{
            const wather = await(await dbVending).RegionTime.findAll();
            //console.log(wather);
            return wather;
        }
        catch(e){
            console.log(e)
        }
    }

    const GetAllWather =(request,response) =>
    {
        FindAllWather().then((result)=>
        {
            response.status(200).json(result)
        }).catch(e => {
            console.log(e)
          response.status(401).json({message: 'Operation failed to execute',error: e, status: 401}); 
        })
    }


    module.exports={getWather,saveWather,saveCity, getAddress,saveRegionCity, FindAllWather, GetAllWather}