// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  // API calls are kept consistent with the current environment of the cloud function
  env: cloud.DYNAMIC_CURRENT_ENV
})

exports.main = async (event, context) => {
  try {
    const result = await cloud.openapi.wxacode.getUnlimited({
      //path: '/pages/testing/testing?assayID=SA00001-u909iogr',
      page : event.page,
      scene : event.scene
      //"page": "/testing/picksample/picksample",
      //"scene": "assayID=SA00001-u909iogr"
      //encoding: null, 
    })
    return await cloud.uploadFile({
      cloudPath: event.filename,
      fileContent: result.buffer,
    })
   // return (result)
  } catch (err) {
    console.log('error', err)
    return err
  }
}
