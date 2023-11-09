const { response, request } = require('express');

const dbVending = require('../../../dbvending/db')()


//Get all or especific register
const getAllSalesPoints = async() =>{
  try{
    const points = await (await dbVending).SaleLocation.findAll()
    return points;
  }
  catch(e){
    console.log(e)
  }
}

const GetSalesPoints = (request, response)=>
{
      getAllSalesPoints().then(r => {
        console.log(r.main)
        response.status(200).json(r)
    }).catch(()=>{
    console.log("Error");
  })
}

const GetAllCombine =async () => {
  try{
    const point = await(await dbVending).SaleLocation.findAll({
      include:'Region'
    })
    return point;
  }
  catch(e){
    console.log(e)
  }
}

const GetSalesPointRegion = (request, response) =>
{
  GetAllCombine().then(result =>{
    response.status(200).json(result)
  }).catch(()=>{
    console.log("Error");
    response.status(401).json({message: 'Operation failed to execute', status: 401});
  })
}

const getTransactionAll = async () => {
  try {
    const transaction = await(await dbVending).Transaction.findAll();
    return transaction;
  }
  catch(e){
    console.log(e);
    return e;

  }
}

const getProductsAll = async () => {
  try{
    const product = await(await dbVending).Transaction.findDiferent();
    return product;
  }catch(e){
    console.log(e);
    throw new Error(e)
  }
}

const ProductAll= (request,response) =>
{
  getProductsAll().then(result => {
    response.status(200).json(result)
  }).catch(()=>{
    console.log("Error")
    response.status(401).json({message: 'Operation failed to execute', status: 401});
  })
}

const GetTransactionAll = (request,response) =>
{
  getTransactionAll().then(result => {
    response.status(200).json(result)
  }).catch(()=>{
    console.log("Error")
    response.status(401).json({message: 'Operation failed to execute', status: 401});
  })
}

const getTransactionId = async (Id) => {
  try {
      const transactionId = await(await dbVending).Transaction.findById(Id);
      return transactionId;
  }
  catch (e){
    console.log(e);
    return e;
  }
}

const GetTransactionById = (request,response) =>
{
  const id = parseInt(request.params.id);
  getTransactionId(id).then(result => {
    response.status(200).json(result)
  }).catch(()=>{
    console.log("Error")
    response.status(401).json({message: 'Operation failed to execute', status: 401});
  })
}

const InsertPeopleDetection = (request,response) =>
{
  let data = vehiclebridge.mqttOnSensor();
  console.log(data);
  getTransactionId(id).then(result => {
    response.status(200).json(result)
  }).catch(()=>{
    console.log("Error")
    response.status(401).json({message: 'Operation failed to execute', status: 401});
  })
}



const savedata =(request, response) => {
  const transaction = request.body
  salespoint.PostTransaction(transaction).then(result => {
    response.status(200).json(result)
  }).catch(e => {
    response.status(400).json({ message: 'Operation failed to execute', error: e, status: 401 })
  })
}

//Insert or update register
const PostSaleponint = async (SalepointModel) => {
  try {
    const wather = await (await dbVending).SaleLocation.createOrUpdate(SalepointModel)
    return wather
  } catch (e) {
    console.log(e)
    throw new Error(e)
  }
}

const PostTransaction = async(TransactionModel) => {
  //console.log("Model",TransactionModel)
  try {
    const transaction = await(await dbVending).Transaction.createOrUpdate(TransactionModel)
    return transaction
  } catch(e){
    throw new Error(e)
    console.log(e)
  }
}

const PostPeopleDetection = async(PeopleDetectionModel) => {
  try{
    const people = await(await dbVending).PeopleDetection.createOrUpdate(PeopleDetectionModel)
    return people
  }catch(e){
    throw new Error(e)
  }
  console.log("peopleModel:", PeopleDetectionModel)
}

const PostSaleMetadata = async(SaleMetadataModel) =>{
  try {
    const metada = await(await dbVending).SaleMetadata.createOrUpdate(SaleMetadataModel)
    return metada
  }catch(e){
    throw new Error(e)
  }
}


//Customer

const CustomerAll = async() =>{
    try {
      const customer = await (await dbVending).Customer.findAll()
      return customer
    }catch(e)
    {
      throw new Error(e)
    }
}

const GetCustomer = (request, response) => {
  
  CustomerAll().then(result => {
    response.status(200).json(result)
  }).catch(e => {
    response.status(400).json({ message: 'Operation failed to execute', error: e, status: 401 })
  })
} 



module.exports = {GetSalesPoints, 
  GetSalesPointRegion,  
  PostSaleponint, 
  GetTransactionAll, 
  GetTransactionById, 
  PostTransaction,
  PostPeopleDetection, 
  InsertPeopleDetection,
  PostSaleMetadata,
savedata,
getProductsAll,
ProductAll,
GetCustomer
}
