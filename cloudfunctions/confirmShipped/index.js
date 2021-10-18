const cloud = require('wx-server-sdk')

// initialize cloud
cloud.init({
  // API calls are kept consistent with the current environment of the cloud function
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
exports.main = async (event, context) => {
  try {
    return await db.collection('Purchases')
    .where({
      payment_id : event.paymentID,
      paymentFirstEight : event.orderID
    })
    .update({
      //Pass the data to be locally updated in "data"
      data: {
        // Indicates to set the done field as true
        shipped: true,
        shipping_id: event.shipmentNumber,
        shipping_date : new Date().toUTCString(),
      }
    })
  } catch(e) {
    console.error(e)
  }
}

