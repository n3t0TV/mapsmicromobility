export interface TransacctionsModel
{
  id : number;
  quantity : number;
  timestamp : string;
  amount : any;
  currency: any;
  lat : any;
  lng : any;
  alt : any;
  name : string
}

export interface ProductosModel
{
  id_product : number;
  name : string;
  product_type : string;
  price : any;
  enable : any;
  id_costumer: number;
}


export interface CustomerModel
{
  id_customer: number;
  id_operator: number;
  name: string;
  password: string;
  timestamp: any;
  customer_code: any;
}
