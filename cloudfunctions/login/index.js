const cloud = require('wx-server-sdk')

// initialize cloud
cloud.init({
  // API calls are kept consistent with the current environment of the cloud function
  env: cloud.DYNAMIC_CURRENT_ENV
})

/**
  * This example returns the automatically authenticated applet user openid to the applet
  *
  * The event parameter contains the data passed in the applet call
  *
  */
exports.main = async (event, context) => {
  var promise = new Promise((resolve,reject) => {
 
     const wxContext =  cloud.getWXContext()
    
      returnObj = {
          event,
          openid: wxContext.OPENID,
          appid: wxContext.APPID,
          unionid: wxContext.UNIONID,
          env: wxContext.ENV,
      }
      resolve(returnObj)
  })
  return promise
}



