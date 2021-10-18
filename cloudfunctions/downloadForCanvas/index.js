const cloud = require('wx-server-sdk')

cloud.init({
  // API calls are kept consistent with the current environment of the cloud function
  env: cloud.DYNAMIC_CURRENT_ENV
})


exports.main = async (event, context) => {
  const fileID = event.link
  const res = await cloud.downloadFile({
    fileID: fileID,
  })
  const buffer = res.fileContent
  //return buffer.toString('utf8')
   return buffer.toString('utf8')
}

