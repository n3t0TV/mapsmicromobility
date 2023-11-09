import { Injectable, Inject } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { InformationModel } from "../models/information.model";
//import { environment } from "src/environments/environment";
import { EstacionModel } from "src/models/estacion.model";
import { WaypointsModel, WaypointsbyStationModel, WaypointIdModel} from "src/models/waypoints.module";
import  {estacionwaypointModel} from "src/models/estacionwaypoint.model";
import {ConnectionModel, NewConnectionModel, AddConnectionModel} from "src/models/connection.model";
import { DOCUMENT } from "@angular/common";
@Injectable()

export class InformationService {
    //baseUrl = environment.base.apiUrl;

    routerLink = 'http://';
    token : any = '';
    hostWindow = 'local'; 
    baseUrl : any;
    
    constructor(private http: HttpClient,  @Inject(DOCUMENT) private document: Document,)
    {
        this.hostWindow = this.document.location.hostname;
        this.baseUrl = this.routerLink + this.hostWindow +':4000' + '/api/';
    }

    
    getHost()
    {
        console.log(this.baseUrl);
    }

    //Obten los datos de las estaciones
    getDatosEstaciones ()
    {
        return this.http.get<InformationModel[]>(this.baseUrl + 'estaciones');
    }

    //Obten los datos de una estacion especifica
    getEstacionesByID(id : number)
    {
        return this.http.get<InformationModel[]>(this.baseUrl + 'estaciones.geojson/'+ id);
    }

    //Almacena estacion
    saveEstaciones (estacion : EstacionModel)
    {
        estacion.fecharegistro = new Date();
        let headers = new HttpHeaders();
        headers = headers.set('Content-Type', 'application/json; charset=utf-8');
        const option = {headers};
        return this.http.post(this.baseUrl + 'agrega_estaciones',estacion,option);
    }


    getConexiones()
    {
        return this.http.get<InformationModel[]>(this.baseUrl + 'conexiones');
    }

    //Guarda waypoints
    saveWaypoint(point: WaypointsModel)
    {
        point.fechaactualizado = new Date();
        let headers = new HttpHeaders();
        headers = headers.set('Content-Type', 'application/json; charset=utf-8');
        const option = {headers};
        const result =  this.http.post(this.baseUrl + 'agrega_waypoint', point,option);
        //console.log(result);
        return result;
    }

    //Crea relacion entre waypoints y estacion
    relacionawaypoint(relacion : estacionwaypointModel)
    {
        let headers = new HttpHeaders();
        headers = headers.set('Content-Type', 'application/json; charset=utf-8');
        const option = {headers};
        const result =  this.http.post(this.baseUrl + 'relacionawaypoint', relacion,option);
        //console.log(result);
        return result;
    }

    //Retorna los id de los waypoints almacenados
    retornaid(total : number)
    {
        return this.http.get<InformationModel[]>(this.baseUrl + 'retornaid/'+ total);
    }

    lastid()
    {
        return this.http.get<WaypointIdModel[]>(this.baseUrl + 'retornaid');
    }

    //Actualiza datos de estacion
    updateestacion (estacion : EstacionModel)
    {
        estacion.fecharegistro = new Date();
        let headers = new HttpHeaders();
        headers = headers.set('Content-Type', 'application/json; charset=utf-8');
        const option = {headers};
        const result =  this.http.put(this.baseUrl + 'actualizaestacion', estacion,option);
        //console.log(result);
        return result;
    }


    //Elimina una estacion
    deleteestacion (id : number)
    {
        const result = this.http.delete(this.baseUrl +'eliminaestacion/'+ id);
        return result;
    }

    //Elimina relacion entre waypoints y estacion
    deleterealacionestacion(id : number)
    {
        const result = this.http.delete(this.baseUrl +'eliminaestacionwaypoint/'+ id);
        return result;
    }

    //obten waypoints de estación especifica
    getWaypointId(id : number)
    {
        return this.http.get<WaypointsbyStationModel[]>(this.baseUrl + 'waypoints/'+ id);
    }

    //Obtener conexiones de estación especifica
    getConecction(id : number)
    {
        return this.http.get<ConnectionModel[]>(this.baseUrl + 'conexiones/'+ id);
    }

    //Obtener ruta 
    getNewConnection(originlat : any , originlng : any, destinationlat : any, destinationlng : any)
    {
        return this.http.get<NewConnectionModel[]>(this.baseUrl + 'newconexion/'+ originlat +'/'+ originlng + '/' + destinationlat +'/'+ destinationlng);
    }

    //Save connection
    insertConnection(addConnection : AddConnectionModel)
    {
        
        let headers = new HttpHeaders();
        headers = headers.set('Content-Type', 'application/json; charset=utf-8');
        const option = {headers};
        const result =  this.http.post(this.baseUrl + 'agregaconexion', addConnection,option);
        //console.log(result);
        return result;
    }

    //Delete connection
    deleteConnection(idconexion : number)
    {
        const result = this.http.delete(this.baseUrl +'eliminaconexion/'+ idconexion);
        return result;
    }

    deleteWaypointEstacion(id : number)
    {
        const result = this.http.delete(this.baseUrl +'eliminawaypointsestacion/'+ id);
        return result;
    }

    deleteWaypointConnection(id : number)
    {
        const result = this.http.delete(this.baseUrl +'eliminaconexionwaypoints/'+ id);
        return result;
    }

    deleteWaypoint(id : number)
    {
        const result = this.http.delete(this.baseUrl +'eliminawaypoint/'+ id);
        return result;
    }

}


