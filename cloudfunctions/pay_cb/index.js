// 云函数入口文件
const cloud = require('wx-server-sdk')

// initialize cloud
cloud.init({
  // API calls are kept consistent with the current environment of the cloud function
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async (event, context) => {
 // const wxContext = cloud.getWXContext()
  const db = cloud.database()
   try {
      return await db.collection('Purchases').where({
        payment_id : event.outTradeNo
      })
      .update({
        data: {
          paid : true
        },
      })
    } catch(e) {
      console.error(e)
    }
  }