const cloud = require('wx-server-sdk')

cloud.init({
  // API calls are kept consistent with the current environment of the cloud function
  env: cloud.DYNAMIC_CURRENT_ENV
})


exports.main = async (event, context) => {
  const fileListin = new Array(event.link)
  const result = await cloud.getTempFileURL({
    fileList: fileListin,
  })
  return result.fileList
}
