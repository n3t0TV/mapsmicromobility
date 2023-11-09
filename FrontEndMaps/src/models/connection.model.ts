export interface ConnectionModel
{
    id: number,
    distancia: number;
    puntos : any[];
}
export interface NewConnectionModel
{
    distance : any;
    points : any[];
}
export interface AddConnectionModel
{
    idBegin: number;
    idEnd : number;
    distanceMeters : any;
    pointsString: any[];

}