// 云函数入口文件
const cloud = require('wx-server-sdk')

// initialize cloud
cloud.init({
  // API calls are kept consistent with the current environment of the cloud function
  env: cloud.DYNAMIC_CURRENT_ENV
})

exports.main = async (event, context) => {
  const res = await cloud.cloudPay.unifiedOrder({
    "body" : event.data.body,
    "outTradeNo" : event.data.outTradeNo,
    "spbillCreateIp" : event.data.spbillCreateIp,
    "mch_id" : event.data.mch_id,
    "subMchId" : event.data.subMchId,
    "totalFee" : parseInt(100 * event.data.totalFee), 
    "envId":event.data.envId, 
    "nonceStr":event.data.nonceStr,
    "functionName": "pay_cb"
  })
  return res
}