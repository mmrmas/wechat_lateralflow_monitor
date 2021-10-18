const cloud = require('wx-server-sdk')

// initialize cloud
cloud.init({
  // API calls are kept consistent with the current environment of the cloud function
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const MAX_LIMIT = 100


exports.main = async (event, context) => {
  // get the user data
  const openid = event.openid

  // Get the total number of the collection records first
  const countResult = await db.collection('Purchases').count()
  const total = countResult.total
  if (total == 0){
    return 0
  }

  // Calculate in how many times you can get it
  const batchTimes = Math.ceil(total / 100)

  // Carry all the promise arrays with read
  const tasks = []
  for (let i = 0; i < batchTimes; i++) {
    const promise =  db.collection('Purchases').where({_openid : openid}).skip(i * MAX_LIMIT).limit(MAX_LIMIT).get()
    tasks.push(promise)
  }
  // Wait all
  return (await Promise.all(tasks)).reduce((acc, cur) => {
    return {
      data: acc.data.concat(cur.data),
      errMsg: acc.errMsg,
    }
  })
}