
const cloud = require('wx-server-sdk')

cloud.init({
  // API calls are kept consistent with the current environment of the cloud function
  env: cloud.DYNAMIC_CURRENT_ENV
})


exports.main =  (event, context) => {
  // get the user data


  var tasks = []
  // Carry all the promise arrays with read
  tasks = getdata(tasks)
  return tasks
  }


  async function getdata(tasks){
    const db = cloud.database()
    // Get the total number of the collection records first
    const countResult = await db.collection('Purchases').count()
    const total = countResult.total

    // Calculate in how many times you can get it
    const batchTimes = Math.ceil(total / 100)
    const MAX_LIMIT = 100
    for (let i = 0; i < batchTimes; i++) {
      const promise =  db.collection('Purchases')
      .where({shipped : false})
      .skip(i * MAX_LIMIT).limit(MAX_LIMIT)
      .field({
        address: true,
        qrLink: true,
        payment_id: true,
        paymentFirstEight:true,
        subcategory: true,
        paid: true,
        tests_total: true,
        time: true,
      })
      .orderBy('payment_id', 'desc')
      .get()
    
      tasks.push(promise)
    }
    return (await Promise.all(tasks))
  }



