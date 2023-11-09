const { response, request } = require('express');

const dbVending = require('../../../dbvending/db')()

//Find product by Name
const findproductByName = async(_name) =>
{
    try
    {
        const product = await(await dbVending).Product.findByName(_name)
        return product
        //console.log("Product:", product)
    }
    catch(e) 
    {
        console.log("Error:",e)
    }
}

//save or update product
const PostProduct = async (ProductModel) => {
    console.log(ProductModel)
    try{
      const product = await(await dbVending).Product.createOrUpdate(ProductModel)
     return product
    }catch(e){
      throw new Error(e)
    }
    console.log("error:", e)
  }

const ProductAll = async() =>
{
    try
    {
      const products = await (await dbVending).Product.findAll()
      return products
    } catch(e){
      throw new Error(e)
    }
}

const GetAllProducts = (request, response) =>
{
    ProductAll().then(result => {
      response.status(200).json(result)
    }).catch(()=>{
      console.log("Error")
      response.status(401).json({message: 'Operation failed to execute', status: 401});
    })
}

const transactionByProduct = async (product) =>
{
  console.log(product)
    try
    {
        const transactions = await(await dbVending).Transaction.findByProduct(product)
        return transactions

    }
    catch(e) 
    {
        console.log("Error:",e)
    }
}

const getTransctionsByProduct = (request, response)=>
{
  const product = request.params.product;
  console.log("Producto:", product); 
    
    transactionByProduct(product).then(result => {
      response.status(200).json(result)
    }).catch(()=>{
      console.log("Error")
      response.status(401).json({message: 'Operation failed to execute', status: 401});
    })
}


const transactionByProductDate = async (_product, _start, _end) =>
{
  console.log(_product, _start, _end)
    try
    {
        const transactions = await(await dbVending).Transaction.findByProductDate(_product, _start, _end)
        return transactions

    }
    catch(e) 
    {
        console.log("Error:",e)
    }
}

const getTransctionsByProductDate = (request, response)=>
{
  const _product = request.params.product;
  const _start = request.params.start;
  const _end = request.params.end;
  console.log(_product, _start, _end);
  transactionByProductDate(_product, _start, _end).then(result => {
      response.status(200).json(result)
    }).catch(()=>{
      console.log("Error")
      response.status(401).json({message: 'Operation failed to execute', status: 401});
    })
}

/*const saveproduct =(request, response) => {
    const product = request.body
    salespoint.PostProduct(product).then(result => {
      response.status(200).json(result)
    }).catch(e => {
      response.status(400).json({ message: 'Operation failed to execute', error: e, status: 401 })
    })
  }*/


module.exports ={
 findproductByName,
 PostProduct,
 GetAllProducts,
 transactionByProductDate,
 transactionByProduct,
 getTransctionsByProduct,
 getTransctionsByProductDate
 
}