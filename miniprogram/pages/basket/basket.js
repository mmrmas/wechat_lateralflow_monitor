// pages/checkout/checkout.js
const app = getApp()
const db = wx.cloud.database({
  env: app.globalData.env
    })

const English = {address: 'address', plsSubAddress: 'Please submit address' , checkedOut: 'Checked Out' , checkedOutThanks: 'You have already checked out, thank you!' , thankYou: 'Thank you', toCheckOut: 'Proceeding to checkout', processing: 'Processing...', paymentFailed: 'Payment failed', tryAgain: 'Please try again', placedOrder: 'your order has been placed', startShipping: 'we will start shipping your order',  noQR: 'QR failed'}

const Chinese = {address: '地址', plsSubAddress: '请输入您的收货地址', checkedOut: '支付成功', checkedOutThanks: '您已支付成功，谢谢!' , thankYou: '感谢购买', toCheckOut: '去支付', processing: '请稍后......',  paymentFailed: '支付失败', tryAgain: '请重试。', placedOrder: '已下单，谢谢',  startShipping:'我们将开始准备您的包裹。',   noQR: '无二维码' }


Page({

  /**
   * Page initial data
   */
  data: {
    items:[],
    sum: 0,
    discount: 0,
    shippingFee: 0,
    total : 0,
    id: 1,
    templateId : '',
    alternativeConfirmation : '',
    outTradeNo: '',
    checked_out : 0,
    qr : false,
    qrbuffer : '',
    address_filled : '',
    fapiao_filled : 0,
    address: '',
    fapiao: '',
    nonceStr:'',
    lang:'CN',
    language: '', //the translation object
    fromBundle: false,
    bundleDiscount: 0
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {

  },

  checkOut: async function(e){
    var that = this
    console.log('e', e)
    if (this.data.address == 'noAddress' || this.data.address_filled == 0){ // change
      wx.showModal({
        title: that.data.language.address,
        content: that.data.language.plsSubAddress,
        showCancel: false ,
        success(res){
          that.getAddress('')
        }
      })
      return 0
    }
    if (this.data.checked_out !== 0){
      wx.showModal({
        title: that.data.language.checkedOut,
        content: that.data.language.checkedOutThanks,
        showCancel: false ,
        success(res){
          return false
        }
      })
    }
    else{
    //confirm order
      await wx.showModal({
        title: that.data.language.thankYou,
        content: that.data.language.toCheckOut,
        showCancel: true,
        success(res){
          if (res.confirm) {
            wx.showLoading({
              title: that.data.language.processing,
            })
            that.proceedCheckout()
          } else if (res.cancel) {
            console.log('用户点击取消')
            return false
          }
        }
      })
    }
  },


  //CALCULATIONS
  getRandomText:function(length) {
    var charset = "0123456789".match(/./g);
    var text = "";
    for (var i = 0; i < length; i++) {
      text += charset[Math.floor(Math.random() * charset.length)];
    }
    return text;
  },


  //DATABASE
  proceedCheckout:async function(){
    // first make sure the button cannot be pressed again
    this.data.checked_out += 1
    //get the necessary variables
    this.data.outTradeNo = await this.getRandomText(32)
    this.data.nonceStr =  await Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    this.setData({
      alternativeConfirmation: this.data.outTradeNo.substring(1,9)
    })
    var body = ['Your order ', this.data.alternativeConfirmation].join(':')

    //then prepare the data for the database
    await this.firstEntrydb()
    wx.hideLoading()
    console.log('waited for db')

    var data =
    { body : body,
      outTradeNo : this.data.outTradeNo,
      spbillCreateIp : "127.0.0.1",
      mch_id : "",  //add the mch_id, create in the wechat devtools cloud
      subMchId : "", //add the same id as above
      totalFee : this.data.total, 
      envId: "anthill-test-a8ula", // cahnge to real db
      functionName: "pay_cb",
      nonceStr: this.data.nonceStr
    }

    console.log('data', data)

    var that = this
    wx.cloud.callFunction({
      name: 'sa-pay',
      data:{  // we should send all the relevatn data to the cloud server here: price, random strings, etc
        // type: 'unifiedorder',
        // data: data
        data
      },
      success: result=>{
        console.log('paid!', result)
        const payment  = result.result.payment
        console.log('payment',payment)
        // pay
        wx.requestPayment({
          ...payment,
          success (res) {
          console.log('succes')
          console.log('res of transaction' , res)
          if (res.errMsg == 'requestPayment:ok'){  // or some other way to get confirmation
            console.log('thank you')
            //this.placeOrderOut()
            that.PaidInDb()
            // confirm "paid" in the database, add payment ID etc
            that.clearAll()
            }
            },
          fail (res) {
            wx.showModal({
              title: that.data.language.paymentFailed,
              content: that.data.language.tryAgain,
              success (res) {
                if (res.confirm) {
                  that.setData({
                    checked_out : 0
                  })
                  that.checkOut()
                } else if (res.cancel) {
                  that.clearAll()
                  wx.reLaunch({
                    url: '/pages/index/index',
                  })
                }
              }
            })
            console.log('failed', res)
            }
          })
        },
     fail: console.error,
   })
  },

PaidInDb:function(){
  var that = this
    db.collection('Purchases').where({
      payment_id : that.data.outTradeNo
    }).update({
      data: {
        paid : true
      }
    }).then(res =>{
     that.clearAll()
      wx.showModal({
        title: that.data.language.placedOrder,
        content: that.data.language.startShipping,
        showCancel: false ,
        success(res){
          if (res.confirm){
            wx.reLaunch({
              url: '/pages/index/index',
            })
          }
        }
      })
    })
  },



placeOrderOut: function (filename, path, scene){
  var that = this
  return new Promise((resolve,reject) => {
    wx.cloud.callFunction({
      name: 'qrcode',
      data:{
        filename : filename,
        page: path,
        scene: scene
      }
    }).then(res => {
      console.log('rcode', res, res.result.fileID)
      resolve (res.result.fileID)
    }).catch(error =>{
      wx.showToast({
        title: that.data.language.address.noQR
      })
    })
  })
    console.log('res', this.data.qrbuffer)
},


firstEntrydb: function(){
  var that = this
  return new Promise((resolve,reject) => {
    dothis()
    async function dothis(){
    //get all the bundlekit.identifiers from the orders
    var bundlekits = new Map()
    var items = that.data.items
    for (var i = 0;  i < items.length ; i++){
      var b = that.data.items[i]
      var mainIdentifier = b._id
      var quantity = b.quantity
  // here we test if this one actually belongs in the list
      if (quantity < 1){
        continue
      }
        //  bk.forEach(async function(b){
        var bk_identifier = b.identifier
        var bk_measureclass = b.measureClass
        var bk_total = b.qrcodeValidity
        var bk_foodgroups = b.foodGroups
        var bk_foodgroups_cn = b.foodGroups_cn
        var bk_category = b.category
        var bk_category_cn = b.category_cn
        var bk_subcategory = b.subcategory
        var bk_subcategory_cn = b.subcategory_cn
        var bk_storage = b.storage
        var bk_storage_cn = b.storage_cn
        var paymentFirstEight = [bk_identifier,that.data.alternativeConfirmation].join('-')
        var path = 'pages/testing/testing'
        var scene = paymentFirstEight
        var filename =  [bk_identifier,'_' ,that.data.outTradeNo ,'.png'].join('')
            // first put everything into the database
        var qrLink = await that.placeOrderOut(filename, path, scene) // shoudl be done for every bundle
        console.log('qrlink', qrLink)

        if (! (bundlekits.has(bk_identifier) )) {
          bundlekits.set(bk_identifier, {
            mainBundle : mainIdentifier,
            bundleKitIdentifier: bk_identifier,
            measureClass: bk_measureclass,
            foodGroups: bk_foodgroups,
            foodGroups_cn: bk_foodgroups_cn,
            category: bk_category,
            category_cn: bk_category_cn,
            subcategory: bk_subcategory,
            subcategory_cn: bk_subcategory_cn,
            storage: bk_storage,
            storage_cn: bk_storage_cn,
            tests_total: 0,
            tests_done : 0,
            tests_remaining: 0,
            tests: new Array(),
            /*[{
              qualResult:  '',
              quantResult: '',
              testDate: '',
              testLocation: '',
              matrix:'',
              submtrix:'',
              subsubmtrix:'',
              cloudFileId: '',
              market : '',
              seller:'',

            }] , */
            payment_id : that.data.outTradeNo,
            paymentFirstEight: paymentFirstEight,
            address: that.data.address,
            paid_amount: that.data.total,
            paid: Boolean(0),
            time: new Date().toUTCString(),
            shipped: Boolean(0),
            shipping_id: 'null',
            qrLink: qrLink
          })
        }
        bundlekits.get(bk_identifier).tests_total += bk_total * quantity
        bundlekits.get(bk_identifier).tests_remaining += bk_total * quantity
          console.log('k', bundlekits)
          console.log('l',bundlekits.get(bk_identifier).tests_total)
          //console.log('m', bundlekits.tests.total)
      }


    // now create the data array to feed to the database
    bundlekits.forEach(function(value,key){
        // now add it to the database
      db.collection('Purchases').add({
        data: value
       })
    })
    resolve()
  }
  })
  },


  /**
   * Lifecycle function--Called when page is initially rendered
   */
  onReady: function () {

  },

  /**
   * Lifecycle function--Called when page show
   */
  onShow: function () {
    var language = ''
    this.setData({
      lang: app.globalData.languagePreference,
      fromBundle: app.globalData.fromBundle,
      bundleDiscount: app.globalData.bundleDiscount
     })
    // here we need to collect all the relavant info
    if (this.data.lang == 'CN'){
      language = Chinese
      wx.setNavigationBarTitle({
        title: '购物车'
      })
    }
    else if (this.data.lang =='EN'){
      language = English
      wx.setNavigationBarTitle({
        title: 'Basket'
      })
    }
    this.setData({
      language: language
     })

    console.log('addressbasket ', app.globalData.Address)
    if (app.globalData.Address.errMsg == "chooseAddress:ok" ){
      this.setData({
        address_filled : 1,
        address : app.globalData.Address
      })
    }
    else{
      this.setData({
        address_filled : 0,
        address : "noAddress"
      })
    }
    console.log('addressbasket ', this.data.address)
    this.setData({
      //sum : app.globalData.sum,
      //discount : app.globalData.discount,
      items: app.globalData.orderlist
    })

    //order the items by bundle
    var sortedItems = this.data.items
    function compare(a, b) {
      // Use toUpperCase() to ignore character casing
      const bA = a.bundleItem
      const bB = b.bundleItem

      let comparison = 0;
      if (bA == true &&  bB == false) {
        comparison = 1;
      } else {
        comparison = -1;
      }
      return comparison;
    }
    sortedItems.sort(compare);

    // calculate the sum
    // calculate the discount
    this.sumAndDiscount()
    console.log('fromBundle', this.data.fromBundle)
    app.setTabbar()
  },

  sumAndDiscount: function(){
    var sum= 0
    var discount = 0
    var shippingFee = 0
    var bundleDiscount = this.data.bundleDiscount
    for (var i = 0; i <this.data.items.length; i++){
      var c = this.data.items[i]
      if(c.price > 0 && c.checked == true){
        sum += c.productCost * c.quantity
      }
    }
    if (sum > 0){
      shippingFee = 10
    }
    if (this.data.fromBundle == true){
      shippingFee = 0
    }
    if (sum > 101){
      shippingFee = 0
    }
    if (sum > 165){
      discount = discount + parseInt(sum / 15)
    }

    discount = discount + bundleDiscount
    this.setData({
      sum : sum,
      discount: discount,
      shippingFee: shippingFee,
      total: parseInt(sum - discount + shippingFee)
    })
    console.log('total', this.data.total)
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
    if (openid == '') {
      console.log('empty')
      app.getLogin().then(res => {
         wx.reLaunch({
            url: '/pages/basket/basket'
        })
      })
    }
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


  removeThis: function(e){
    var removeId = e.currentTarget.id
    var items =  this.data.items
    for (var i = 0; i < items.length; i++){
      var c = items[i]
      if (c._id == removeId){
        c.quantity = 0
        c.price = 0
        c.showprice = 0
        c.checked = false
      }
    }
    this.setData({
      items : items
    })
    this.sumAndDiscount()
  },

  clearAll:function(){
    var items =  this.data.items
    for (var i = 0; i < items.length; i++){
    var c = items[i]
     c.quantity = 0
     c.price = 0
     c.showprice = 0
     c.checked = false
     c.bundleItem = false
    }
    this.setData({
      items : items,
      fromBundle : false,
      bundleDiscount : 0,
      discountPrice: 0
    })
    app.globalData.fromBundle = false
    app.globalData.orderlist = this.data.items
    app.globalData.bundleDiscount = 0
    this.sumAndDiscount()
  },

  toOrder:function(){
    wx.setStorageSync('buyProduct', 1)
    console.log("set?", wx.getStorageSync('buyProduct'))
    wx.switchTab({
      url: '/pages/index/index',
    })
  }
})
