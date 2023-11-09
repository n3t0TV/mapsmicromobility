import { Injectable, Inject } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { DOCUMENT } from '@angular/common';

//Models
import { TransacctionsModel, ProductosModel, CustomerModel } from "./transactions.model";

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  routerLink = 'http://';
  token: any = '';
  resultDirection: any = '';
  hostWindow = 'local';
  host : any = '';
 // baseUrl = environment.base.apiUrl;

  constructor(private http: HttpClient, @Inject(DOCUMENT) private document: Document)
  {
    this.hostWindow = this.document.location.host;
    this.host = this.hostWindow.replace('3002','4000');
  }

  getProduct() : Observable<any>
  {

    const url = `${this.routerLink}${this.host}/api/allProducts`;
    return this.http.get<(ProductosModel[])>(url);
  }

  getTransaction() : Observable<any>
  {
    const url = `${this.routerLink}${this.host}/api/transactions`;
    return this.http.get<(TransacctionsModel)>(url);
  }

  getCustomer() : Observable<any>
  {
    const url = `${this.routerLink}${this.host}/api/customer`;
    return this.http.get<(CustomerModel)>(url);
  }



}
