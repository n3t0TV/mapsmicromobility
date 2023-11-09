import { formatDate } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDatepickerInputEvent, MatDateRangeInput } from '@angular/material/datepicker';
import { MatSelect } from '@angular/material/select';
import { Title } from '@angular/platform-browser';
import { TransactionService } from './transactions.service';



@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.css']
})
export class TransactionsComponent implements OnInit {

//ViewChild
@ViewChild('customer',{static:false}) customer! : MatSelect;
@ViewChild('productos',{static:false}) productos! : MatSelect;
@ViewChild('dates',{static: false}) dates! : MatDateRangeInput<FormGroup>;
range = new FormGroup({
  start: new FormControl(),
  end: new FormControl(),
});

title = 'Transacctions';
date: any;
products : any =[];
list : any = [];
customers : any = [];
transactions : any = [];
transactionsAll : any = [];
startDate : any;
endDate : any;


  constructor(private titleService : Title, private transactionservice : TransactionService) {
    this.ProductAll();
    this.TransactionAll();
    this.CustomerAll();
  }

    ngOnInit(): void {

      this.titleService.setTitle(this.title);

    }

    ProductAll()
    {
       this.transactionservice.getProduct().subscribe((result : any)=>
      {
        let msj = result;
        /*for(var i=0;i<msj.length; i++)
        {
          this.products.push(msj[i].name)
        }*/
        //this.products = msj;
        this.list = msj;
        console.log(this.products)
      })
    }

    TransactionAll()
    {
      this.transactionservice.getTransaction().subscribe((result : any)=>
      {
        let msj = result;
        this.transactionsAll = msj;
      })
    }

    CustomerAll()
    {
      this.transactionservice.getCustomer().subscribe((result : any)=>
      {
          let msj = result;
          for(var i=0;i<msj.length; i++)
          {
            this.customers.push({"id_customer":msj[i].id_customer, "name": msj[i].name})
          }
          console.log(this.customers)
      })
    }

    FilterbyCustomer(_customer : any)
    {
      this.products = [];
     console.log(_customer)
      let r =this.list.filter((product : any) => product.id_customer == _customer.value)
      console.log(r)
      for(var i=0; i<r.length; i++)
      {
        this.products.push({"name": r[i].name})
      }
    }


    ButtonClick()
    {
          this.customer.value = null;
          this.products = [];
          this.range.value.start = null;
          this.range.value.end  = null;
          this.startDate = null;
          this.endDate = null;
    }

    FillterTransactions()
    {
      let _customer = this.customer.value;
      let _product =`"`+this.productos.value+ `"`;
      let _start =  this.range.value.start;
      let _end =  this.range.value.end;
      console.log( _product, _start, _end);
      console.log(this.transactionsAll);
      let r = this.transactionsAll.filter((t : any)=> t.name === _product);
        console.log(r)

    }

}
