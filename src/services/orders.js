import request from '../utils/request';

export function getList( opt ) {
  return request(`api/orderInfo/getOrderList?currentPage=${opt.page}&pageSize=10&outSalesOrderNo=${opt.outSalesOrderNo}&orderId&orderby=&orderFlowState=&startTime=${opt.startTime}&endTime=${opt.endTime}`,{
      method: 'GET',
      headers: {'Content-Type': 'application/json', 'MSP-AuthKey': 'EKum6zvLoCRXUOTbzqlbP7Gg.1472543098'}
    }
  );
}

export function getDetail(id){
  return request(`api/orderInfo/getOrderDetail?outSalesOrderNo=${id}`,{
      method: 'GET',
      headers: {'Content-Type': 'application/json', 'MSP-AuthKey': 'EKum6zvLoCRXUOTbzqlbP7Gg.1472543098'}
    }
  );
}

export function cancel(obj){
  return request(`api/orderInfo/cancelOrder?outSalesOrderNo=${obj.outSalesOrderNo}&customerId=${obj.customerId}`,{
      method: 'PUT',
      headers: {'Content-Type': 'application/json', 'MSP-AuthKey': 'EKum6zvLoCRXUOTbzqlbP7Gg.1472543098'}
    }
  );
}

export function chjd(id){
  let body = {
    "outSalesOrderNo": "1000001",
    "warehouseCode":"C10001",
    "barCode":[
      {"prdCode":"10001","SNs":"SN1,SN2"},
      {"prdCode":"10002","SNs":"SN1002,SN1003"}
    ],
    "expressType":"1",
    "expressCode":"SF1001"
  };

  return request(`/api/pcsd-newretail-transaction-salesorder/orderInfo/finishOrder`,{
      method: 'PUT',
      headers: {'Content-Type': 'application/json', 'MSP-AuthKey': 'EKum6zvLoCRXUOTbzqlbP7Gg.1472543098'},
      body: JSON.stringify(body),
    }
  );
}


