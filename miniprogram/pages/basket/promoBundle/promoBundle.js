// pages/basket/promoBundle/promoBundle.js
const app = getApp()
const db = wx.cloud.database({
  env: app.globalData.env
})
Page({

  /**
   * Page initial data
   */
  data: {
    dateUntill: '',
    originalPrice: 0,
    kitsIncluded:'',
    promoID: '',
    promo: '',
    items:'',
    array: '',
    discount: 0.87,
    fromBundle: true
  },
 
  /**
   * Lifecycle function--Called when page load
   */
  onLoad: async function (options) {
    let openid = await wx.getStorageSync("bundles"); // if not set then there is no user data
    if (openid == '') {
      await app.getLogin()
    }
    console.log('options11', options)
    this.onShowManually(options)
  },

  /**
   * Lifecycle function--Called when page is initially rendered
   */
  onReady: function () {

  },

  /**
   * Lifecycle function--Called when page show
   */
  onShowManually: function (options) {
    var array = Array.from(Array(100).keys())
    var originalPrice = 0
    array.shift()
    console.log('array', array)
    var that = this
      that.setData({
        lang: app.globalData.languagePreference,
        array:array
      })
      console.log('bkoptions', options)
      var key = options.bundleKey
      that.setData({
        promoID : key,
        items : app.globalData.orderlist
      })
      
      for (var i = 0; i < that.data.items.length; i++){
        that.data.items[i].hidden_search = false
        that.data.items[i].bundleItem = false
      }

      console.log('its', that.data.items)
      //find the promotion in the database or go to Index
      const _ = db.command   
      db.collection('Promos').where({
        date_until : _.gt(new Date()),
        promoId : that.data.promoID
      }).get().then(res => {
          console.log('promo', res, new Date())
          that.setData({
            promo: res.data[0]
          })
        }).then(res=>{
      //then select the right packages
      var changed = {};
      console.log('promo', that.data.promo, app.globalData.orderlist)
      for (var i = 0; i < that.data.items.length; i++) {          
        for (var j = 0; j < that.data.promo.kitsIncluded.length; j++){
          if (that.data.items[i].identifier === that.data.promo.kitsIncluded[j]){
            console.log('found', that.data.items[i].identifier, that.data.promo.quantityEach)
            var thisPrice  = 0
            if (that.data.items[i].quantity == 0){
              changed['items[' + i + '].quantity'] = that.data.promo.quantityEach
              thisPrice = that.data.promo.quantityEach * that.data.items[i].productCost
            }
            else{
              thisPrice = that.data.items[i].quantity * that.data.items[i].productCost
            }
            changed['items[' + i + '].price'] = thisPrice
       //     changed['items[' + i + '].showprice'] = parseInt(thisPrice * that.data.discount)
            changed['items[' + i + '].showprice'] = parseInt(10 * thisPrice * that.data.discount)/10
         //   parseInt(100* (sum - discount + shippingFee))/100

            originalPrice = originalPrice + thisPrice
            if (that.data.promo.quantityEach > 0){
              changed['items[' + i + '].checked'] = true
              changed['items[' + i + '].bundleItem'] = true
              changed['items[' + i + '].hidden'] = false
              console.log('itemsi', i, that.data.items[i] )
            }
            else if (that.data.promo.quantityEach == 0){
                changed['items[' + i + '].checked'] = false
            }
          }
        }
      } 
      that.setData(changed)   
      that.setData({ 
        items: that.data.items,
        originalPrice : originalPrice,
        discountPrice : parseInt(originalPrice * that.data.discount)
      })
      app.globalData.orderlist = that.data.items
      app.globalData.bundleDiscount = that.data.originalPrice - that.data.discountPrice
    })

      // add the extra discount
      // provide "buy now" option (don't forget the address)
      // also download the right pictures and maybe some description
      // if the user buys more, the discount remains as long as the whole bundle is bought
      // if the bundle has expired, send to the index page
  },

  bindPickerChange: function(e) {
    var that = this
    var originalPrice = this.data.originalPrice
    var target = e.currentTarget.id
    var quantity = e.detail.value
    console.log('target', target, quantity )
    quantity =  parseInt(quantity) + 1
    console.log('target', target, quantity )
    var changed = {};
    for (var i = 0; i < this.data.items.length; i++) {
      if (this.data.items[i].productName === target) {
        var oldPrice = this.data.items[i].price 
        var newPrice =  quantity * this.data.items[i].productCost 
        originalPrice = originalPrice - oldPrice + newPrice
        changed['items[' + i + '].quantity'] = quantity
        changed['items[' + i + '].price'] = newPrice 
        changed['items[' + i + '].showprice'] = parseInt(10 * newPrice * that.data.discount)/10
        if (quantity > 0){
          changed['items[' + i + '].checked'] = true
        }
        else if (quantity == 0){
            changed['items[' + i + '].checked'] = false
        }
      }
    }
    this.setData(changed)   
    this.setData({
      items: that.data.items,
      originalPrice : originalPrice,
      discountPrice : parseInt(originalPrice * that.data.discount)
    })
    app.globalData.orderlist = this.data.items
    app.globalData.bundleDiscount = that.data.originalPrice - that.data.discountPrice
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
  toTestDescriptionDetail:function(e){
    var identifier = e.currentTarget.id
    console.log('e clicked', e, identifier)
    this.setData({
      expanded:identifier
    })
  },

  toTestDescription:function(e){
    console.log(e, 'idtest')
    wx.setStorage({
      key:"testKitPage",
      data: e.currentTarget.id
    }).then(res=>{
      wx.redirectTo({
        url: ['/pages/basket/orderTest/testDescription/testDescription?bundleKey=', this.data.promoID].join('')
      })
    })
 },

 goBack:function(){
   var changed = {}
  for (var i = 0; i < this.data.items.length; i++) { 
    changed['items[' + i + '].bundleItem'] = false
    if (this.data.items[i].bundleItem == true && (!('nonBundlePicked' in this.data.items[i]) ||  this.data.items[i].nonBundlePicked == false)){         
      changed['items[' + i + '].quantity'] = 0
      changed['items[' + i + '].price'] = 0
      changed['items[' + i + '].showprice'] = 0
      changed['items[' + i + '].checked'] = false
    }
  }
  this.setData(changed)   
  app.globalData.orderlist = this.data.items
  app.globalData.discountPrice = 0
  app.globalData.fromBundle = false
  app.globalData.originalPrice = 0
  app.globalData.bundleDiscount = 0
  wx.switchTab({
    url:'/pages/index/index',
  })
},  

toBasket: function(e){
  app.globalData.fromBundle = this.data.fromBundle
  wx.switchTab({
    url: '/pages/basket/basket',
  })
},


closePopup: function(){
  this.setData({
    expanded:'null'
  })
 }
})