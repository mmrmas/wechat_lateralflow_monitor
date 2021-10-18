//app.js

App({
  onLaunch: function () {
    console.log('starting')
    const updateManager = wx.getUpdateManager()
    updateManager.onUpdateReady(function () {
      wx.showModal({
        title: '有可用更新 / Update available',
        content: '重启以更新 / Restart to update',
        success: function (res) {
          if (res.confirm) {
            // The new version has been downloaded. Call applyUpdate to apply the new version and restart the Mini Program.
            updateManager.applyUpdate()
          }
        }
      })
    })

    // first empty all the data cache
      wx.clearStorage()
      wx.cloud.init({
      // env parameter description:
      // The env parameter determines the next cloud development call (wx.cloud.xxx) initiated by the applet will request the resources of which cloud environment by default
      // Please fill in the environment ID here, the environment ID can be viewed in the cloud console
      // If left blank, use the default environment (the first environment created)
      env: this.globalData.env,
      traceUser: true
      })
  },


// login function
getLogin: function(){
  var that = this
  return new Promise ((resolve, reject) => {
    // call cloud function
      wx.cloud.callFunction({
      name : 'login',
      data : {}
      }).then(res => {
        console.log('rest', res)
        that.globalData.openid = res.result.openid
 //that.globalData.openid ='omel55Pdy3xCQJ6NlLLwdsfdf02JV8m98'
        console.log('got id', that.globalData.openid)
        wx.setStorageSync("openid", that.globalData.openid)
        // go to next function

        async function fetchUsers() {
          const location =  that.getLocation()
          const purchases = that.getPurchases()
          const personal = that.fillPersonal()//.then(that.setTabbar())
          const bundles = that.fillBundles()

          const results = await Promise.all([location, purchases, bundles, personal]);

          return results
        }
        const final = fetchUsers()
        resolve(final)
      })
    })
 },


 getLocation: function(){
   return new Promise ((resolve, reject) => {
    var that = this
    wx.getLocation({ // static
      type: 'wgs84',
      success (res) {
        const latitude = res.latitude
        const longitude = res.longitude
        const accuracy = res.accuracy

        that.globalData.latitude = latitude
        that.globalData.longitude = longitude
        that.globalData.accuracy = accuracy
        console.log('accuracy', accuracy)
        wx.setStorageSync("location", 1)
        // go to next function
      //  that.getPurchases()
        resolve(res)
      }
     })
   })
 },

 getPurchases:  function(){
  var that = this
  return new Promise((resolve,reject) => {
    wx.cloud.callFunction({
      name : 'downloadUserData',
      data :{
        openid : that.globalData.openid
      }
    }).then(res => {
      var Purchases = res.result.data
      that.globalData.Purchases = Purchases
      console.log('purchases',res.result.data, that.globalData.openid)
      wx.setStorageSync("purchases", 1)
      resolve(res)
    })
  })

 },


 fillPersonal:  function(){
  var that = this
  var languageChosen = 'CN'
  return new Promise((resolve,reject) => {
    const db = wx.cloud.database({
      env: that.globalData.env
    })
    db.collection('Users').where({
      _openid : that.globalData.openid
    }).get().then(res => {
      if (typeof res.data[0] == 'undefined' ){
        wx.showActionSheet({
          itemList: ['中文', 'English'],
          success (res) {
            console.log(res.tapIndex)
            if (res.tapIndex == 0){
              languageChosen = 'CN'
              that.globalData.languagePreference = languageChosen
              db.collection('Users').add({
                data:{
                  firstVisit: new Date().toUTCString(),
                  credits_collected:0,
                  credits_spent:0,
                  language_preference:languageChosen,
                  address: new Object({})
                }
              }).then(res=>{
          //      wx.reLaunch({
           //       url: '/pages/index/index',
           //     })
                resolve()
              })
            }
            else if (res.tapIndex == 1){
              languageChosen = 'EN'
              that.globalData.languagePreference = languageChosen
              db.collection('Users').add({
                data:{
                  firstVisit: new Date().toUTCString(),
                  credits_collected:0,
                  credits_spent:0,
                  language_preference:languageChosen,
                  address: new Object({})
                }
              }).then(res=>{
          //      wx.reLaunch({
        //          url: '/pages/index/index',
         //       })
               resolve()
              })
            }
          }
        })
      }
      else{
        console.log('users!!', res.data)
        that.globalData.Address = res.data[0].address
        that.globalData.creditsCollected = res.data[0].credits_collected
        that.globalData.creditsSpent = res.data[0].credits_spent
        that.globalData.languagePreference = res.data[0].language_preference
        console.log('address', that.globalData.Address)
        resolve(res)
      }
     })
   })
  },

  fillBundles: function (){
    var that = this
    return new Promise((resolve,reject) => {
      console.log('orderlist', that.globalData.orderlist.length)
      if (that.globalData.orderlist.length > 0){
        console.log('orderlist found', that.globalData.orderlist.length)
        return(1).then(resolve())
      }
      console.log('but not resolving', that.globalData.orderlist.length)
      console.log('env', that.globalData.env)
      const db = wx.cloud.database({
        env: that.globalData.env
      })
      console.log('db', db)
      const _ = db.command
      db.collection('Bundles').where({
        productCost : _.gt(0)
      }).get().then(res => {
          that.globalData.orderlist = res.data
          console.log('bundles', res, that.globalData.orderlist, db)
          wx.setStorageSync("bundles", that.globalData.openid)
          // go to next function
          resolve(res)
        })
      })
    },


    setTabbar: function (){
      var that = this
      return new Promise((resolve,reject) => {
        if (that.globalData.languagePreference == 'EN'){
          var tabs = ['home', 'basket', 'test', 'view', 'me']
          for (var i = 0; i < tabs.length; i++){
            wx.setTabBarItem({
              index: i,
              text: tabs[i],
            })
          }
        }
        if (that.globalData.languagePreference  == 'CN'){
          var tabs = ['主页', '购物车', '检测', '查看', '我的']
          for (var i = 0; i < tabs.length; i++){
            wx.setTabBarItem({
              index: i,
              text: tabs[i],
            })
          }
        }
        resolve(1)
      })
    },



  globalData :{
    databaseLink: '',
    openid : '',
    env : '', // env name
    latitude: '',
    longitude:'',
    accuracy: '',
    Purchases :  [],
 //   itemsToSell: [],
    fapiao: [],
    address:[],
    orderlist: [],
    measureClass: '',
    measureId : '',
    tests : '' ,// test object from the databse - total, remaining, positve, negative, U
    mainBundle : '',
    thistest : '', // for when the testing starts
    foodDetails : '',
    brand : '',
    seller: '',
    testmatrix : '',
    testSubmatrix : '',
    testSubSubmatrix : '',
    dayview : '',
    test:'',
    type : '',
    sampleLocation:'',
    sampleAddress: '',
    Address : '',
    creditsCollected:'',
    creditsSpent:'',
    languagePreference:'CN',
    fromBundle: false,
    bundleDiscount: 0
  }
})



/*Notes for products
- Products have 3 layers; matrix, submatrix, subsubmatrix
1. meat
  - pork, poultry, beef, lamb, other
    - muscle, liver, kidney, intestine, other
2. aqua
  - fish, crab&shrimp, shellfish, other
    - freshwater, seawater
3. dairy&eggs
  - milk, cream, egg, yoghurt, soymilk
    - cow, chicken, duck, other
4. fuits&vegs
  - leaf, bulb, root, fruit, mushroom, seaweed
    - unprocessed, precut/prewashed



dfdfd
dfdfd
*/
