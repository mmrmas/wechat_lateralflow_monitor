// pages/me/me.js
const app = getApp()
const db = wx.cloud.database({
  env: app.globalData.env
})
const languages = {CN:0, EN:1}

Page({

  /**
   * Page initial data
   */
  data: {
    orders: '',
    organized : '',
    purchase_amount: '',
    contributions : '',
    tests_remaining:'',
    availability : 'Available',
    availableBool: false,
    expanded:'',
    address_filled:'',
    address:'',
    languagePreference: 'CN',
    exposeSettings: false,
    exposeOrders: false,
    languages: ['CN', 'EN'],
    langArray: [
      { id: 0, name: 'CN' },
      { id: 1, name: 'EN'}
    ],
    langIndex:new Array(0),

  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {
    var that = this
    var langIndex = [ languages[app.globalData.languagePreference] ]
    this.setData({
      orders: app.globalData.Purchases.reverse(),  // reverse so that the newest order is on top
      languagePreference: app.globalData.languagePreference,
      langIndex :langIndex
    }) 
    if (app.globalData.Address !='' || app.globalData.Address !='no address'){
      this.setData({
        address_filled : 1,
        address : app.globalData.Address
      })
    }
    if (this.data.languagePreference =='CN'){
      this.setData({
        availability : '可用检测'
      })
      wx.setNavigationBarTitle({
        title: '我的'
      })
    }
    else if (this.data.languagePreference == 'EN'){
      this.setData({
        availability : 'Available'
      })
      wx.setNavigationBarTitle({
        title: 'Me'
      })
    }
    console.log('orders', this.data.orders)
  }, 

  availableOnly:function(){
    console.log('pressed')
    var buttonText = this.data.availability
    var availableBool =''
  
    //English??
    if (buttonText == 'Available'){
      buttonText = 'All tests'
      availableBool = true
    }
    else if (buttonText == 'All tests'){
      buttonText = 'Available'
      availableBool = false
    }

    //Chinese??
    if (buttonText == '可用检测'){
      buttonText = '所有检测'
      availableBool = true
    }
    else if (buttonText == '所有检测'){
      buttonText = '可用检测'
      availableBool = false
    }
    
    this.setData({
      availability: buttonText,
      availableBool: availableBool
    })
    this.onShow()
  },

  /**
   * Lifecycle function--Called when page is initially rendered
   */
  onReady: function () {
  
  },

    toClipboard:function(e){
      console.log(e.target.id)
      wx.setClipboardData({
        data: e.target.id,
        success (res) {
    //      wx.getClipboardData({
     //       success (res) {
     //         console.log(res.data) // data
     //       }
     //     })
        }
      })
    },

  handleContact (e) {
      console.log(e.path)
      console.log(e.query)

    },


   searchItems: function(e){  // this needs improvement
    var inputValue = e.detail.value
    var changed = this.data.organized
    for (var i = 0; i < changed.length; i++) {
      var orders =changed[i]
      for (var j = 0; j < orders.length; j++) {
        var str_1 = changed[i][j].category
        var str_2 = changed[i][j].subcategory
        var str_3 = changed[i][j].paymentFirstEight
        var str_4 = changed[i][j].category_cn
        var str_5 = changed[i][j].subcategory_cn
        var searchSubject = [ str_1 , str_2 , str_3 , str_4, str_5].join(' ')
        console.log('search',searchSubject)
        var pattern = new RegExp(inputValue);
        if(searchSubject.match(pattern) == null ){
          changed[i][j].hidden_search = true
        }
        else{
          changed[i][j].hidden_search = false
        }
      }
    }
    this.setData({
      organized: changed
    })   
    console.log('orga', this.data.organized)
 },


  /**
   * Lifecycle function--Called when page show
   */
  onShow: function () {
      //make a list based on order ids. If they are the same, then it is the same order
      var orders = this.data.orders
      var orders_organized = new Array()
      var combinded_order = new Array()
      var prev_id = ''
      var purchase_amount = 0
      var total_done = 0
      var remaining = 0
      var that = this
      for (let i = 0; i < orders.length; i++) {
        var c = orders[i]
      //orders.forEach(function(c){
        if (c.tests_remaining < 1 && that.data.availableBool == true){
          continue
        }
      //  get the total tests and remaining tests
        c.hidden_search = false
        purchase_amount += c.tests_total
        total_done += c.tests_done
        remaining += c.tests_remaining
        var time = new Date(c.time)
        var shipdate = new Date(c.shipping_date)
        c.shipdate = [shipdate.getFullYear(), shipdate.getMonth() + 1 , shipdate.getDate()].join('-')
        console.log('time', time)
        var orderDate = [time.getFullYear(), time.getMonth() + 1 , time.getDate()].join('-')
        console.log('time', orderDate)
        c.orderDate = orderDate
        if (c.payment_id == prev_id){
          combinded_order.push(c)
        }
        else {  // make sure we do nto include the empty array in the first loop
          if (combinded_order.length != 0){
            orders_organized.push(combinded_order)
          }
          combinded_order = new Array()
          combinded_order.push(c)
          prev_id = c.payment_id
        }
      }
      //)
      orders_organized.push(combinded_order) // to include the last
  
      // also get the total tests and remaining tests
  
      this.setData({
        organized : orders_organized,
        purchase_amount : purchase_amount,
        contributions : total_done,
        tests_remaining : remaining,
      })
      app.setTabbar()

    
  },

  /**
   * Lifecycle function--Called when page hide
   */
  onHide: function () {

  },

  /**
   * Lifecycle function--Called when page unload
   */
  onUnload: function () {

  },

  /**
   * Page event handler function--Called when user drop down
   */
  onPullDownRefresh: function () {
    let openid = wx.getStorageSync("bundles");
    console.log("incoming id：" + openid);
      app.getLogin().then(res => {
         wx.reLaunch({
            url: '/pages/me/me'
        })
      })
  },

  /**
   * Called when page reach bottom
   */
  onReachBottom: function () {

  },

  /**
   * Called when user click on the top right corner to share
   */
  onShareAppMessage: function () {

  },
  expandList:function(e){
    var listItem = e.currentTarget.id
    this.setData({
      expanded: listItem
    })
  },
  closeExpansion:function(){
    this.setData({
      expanded: 'none'
    })
  },

  toSampleSheet: function(d){ 
    console.log('tooSample', d)  
    // now go for all teh infomration on that day: matrix, sub, subsub, seller, market, picture, chemcial, 
    var counter = 0
    var output = new Array()
    var orders = this.data.orders
    for (var i =0 ; i < orders.length; i++){
      if (orders[i].paymentFirstEight == d.currentTarget.id){
        var e = orders[i]
        var category = e.category
        var subcategory = e.subcategory
        var category_cn = e.category_cn
        var subcategory_cn = e.subcategory_cn
        var tests = e.tests
        tests.forEach(function(c){
        counter = counter + 1
        var measuredate = c.testDate
        measuredate = new Date(measuredate)
        output.push({
            date : [measuredate.getFullYear(), ' 年 ' , measuredate.getMonth(), ' 月 ' , measuredate.getDate() , ' 日 ' ].join(''),
            category: category, 
            subcategory: subcategory,
            category_cn: category_cn, 
            subcategory_cn: subcategory_cn,
            matrix: c.matrix,
            submatrix: c.submatrix,
            qualresult_en : c.qualResult_en,
            qualresult_cn : c.qualResult_cn,
            fileID : c.cloudFileId,
            seller : c.seller,
            brand : c.brand,
            details : c.foodDetails,
            address: c.address,
            canvasId: counter
            }) 
          })
        console.log('ov', output)
        app.globalData.dayview = output  // send to app to obtaoin from dayview later
        wx.navigateTo({
          url: '/pages/view/dayview/dayview',
        })
      }
    }
  },

  settingReview:function(){
    console.log('opemnSetting')
    wx.openSetting({
    success (res) {
      console.log(res.authSetting)
      // res.authSetting = {
      // "scope.userInfo": true,
      // "scope.userLocation": true
      // }
    }
  })
},

getAddress: function(e){
  // do we still need authorization??
  var that = this
  wx.chooseAddress({
    success (res) {
      console.log('address', res)
      that.setData({
        address : res,
        address_filled : 1
      })
      app.globalData.Address = that.data.address,
      console.log('address', app.globalData.Address)
      that.storeAddress(that.data.address)
    }
  })
 },

 storeAddress(address){
   var thisId= app.globalData.openid
   db.collection('Users').where({
    _openid : thisId
  }).update({
    //Pass the data to be locally updated in "data"
      data: {
      // Indicates to set the done field as true
        address : address,
      }
    })  
  },

  deleteAddress:function(){
    var that = this
    var thisId= app.globalData.openid
   // const _ = db.command
    var thisAddress =  app.globalData.Address
    var Obkeys  = Object.keys(thisAddress)
    console.log('vakyes',  thisAddress, Obkeys)
    for (var i = 0; i < Obkeys.length; i++){
      thisAddress[Obkeys[i]] = ''
    }
   db.collection('Users').where({
    _openid : thisId
  }).update({
    //Pass the data to be locally updated in "data"
      data: {
      // Indicates to set the done field as true
        address : thisAddress
      }
    }).then(res=>{
      that.onPullDownRefresh()
    })  
  },

  exposeSettings:function(){
    var update = ''
    if (this.data.exposeSettings == false){
      update = true
    }
    else{
      update = false
    }
    this.setData({
      exposeSettings: update
    })
  },

  exposeOrders:function(){
    var update = ''
    if (this.data.exposeOrders == false){
      update = true
    }
    else{
      update = false
    }
    this.setData({
      exposeOrders: update
    })
  },
  
  chooseLanguage:function(e){
    var index = e.detail.value
    var language = this.data.languages[index]
    console.log('language', language)
    this.setData({
      language:language
    })
    app.globalData.languagePreference = language
    
    //also to the database
    var thisId= app.globalData.openid
    console.log('thisid',thisId)
    db.collection('Users').where({
      _openid : thisId
    }).update({
    //Pass the data to be locally updated in "data"
      data: {
      // Indicates to set the done field as true
        language_preference : language,
      }
    })  
    app.setTabbar().then(res => {
      wx.reLaunch({
       url: '/pages/me/me'
    })
  })
  },
}) 