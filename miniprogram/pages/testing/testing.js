const English = {recQR: 'Recognized QR code', notRec: 'not recognized', noRemaining: 'No test remaining', refresh: 'Please refresh this page',   chooseOptions: 'Choose from the following options',  itemAvailable:'Check available tests', itemOrder:'Order more tests', itemData:'Check your data for this batch', noWelcome: 'Pls scan the QRcode on welcome packages',  processing: 'Please wait...'}

const Chinese = {recQR: '识别二维码',  notRec: '无法识别', noRemaining: '无可用检测',  refresh: '请刷新此页',  chooseOptions: '去看看其它选项吧', itemAvailable:'查看可用检测', itemOrder:'购买更多检测', itemData:'查看这批检测的数据' , noWelcome: '请扫描包装上的二维码',  processing: '请稍后......' }

const app = getApp()
const db = wx.cloud.database({
  env: app.globalData.env
    })

Page({

  /**
   * Page initial data
   */
  data: {
    res: '',
    lang:'CN',
    language: '',
    Purchases : '',
    scene: 'noscene'
  },

  // Only allow to scan code with camera
  takeQR: function(){
    var that = this
    wx.scanCode({
    onlyFromCamera: true,
    success (res) {
      console.log(res)
      var path = res.path
      var path_arr = path.split(/SA/)
      var identifier = path_arr.pop()
      identifier = ['SA',identifier].join('')
      console.log(identifier, 'identifier')
      wx.showModal({
        title: that.data.language.recQR,
        showCancel: false,
        success (res) {
          if (res.confirm) {
            that.enterPurchaseId(identifier)
          }
        }
      })
    },
    fail (res) {
      console.log(res)
    }
   })
   //here have to include fucntion to get 

   
  },
 
  enterPurchaseId: function(e){
    var input = ''
    var that = this
    if (typeof e == 'string'){
      input = e
    }
    else if (typeof e == 'object'){
      input = e.detail.value
    }
    if (input.match(/welcomepackage/) || input.match(/wcpk/) ){ 
      if (input.match(/_welcomepackage/) || input.match(/_wcpk/)){//underscore important to make sure we don't insert the ones that are already inside (SA000XX-welcompackage)
        this.welcomePackage(input)
        return 1
      }
      else{
        wx.showModal({
          title: that.data.language.notRec,
          content: that.data.language.noWelcome,
          showCancel: false,
        }) 
        return 0
      }
    }
    var found = false
    // look for the purchase ID
    this.data.Purchases.forEach(function(c){
      if (input == c.paymentFirstEight){
        found = true
        console.log('input', c.tests_remaining)
        if (c.tests_remaining < 1){
          that.showNewOptions(c)
        }
        else {
          app.globalData.thistest = c
          app.globalData.mainBundle = c.mainBundle
          app.globalData.measureId = c._id
          app.globalData.measureClass = c.measureClass
          app.globalData.tests = c.tests
          found = true
          wx.navigateTo({
            url: '/pages/testing/picksample/picksample',
          })
        }
      }
    })
    if (found == false){
      wx.showModal({
        title: that.data.language.notRec,
        content: that.data.language.refresh,
        showCancel: false,
      }) 
    }
   // otherwise it does not exist
  },

  showNewOptions:function(c){
    console.log('c', c)
    var that = this
    wx.showModal({
      title: that.data.language.noRemaining,
      content: that.data.language.chooseOptions,
      showCancel: false,
      success(){
        wx.showActionSheet({
          itemList: [that.data.language.itemAvailable, that.data.language.itemOrder, that.data.language.itemData],
          success (res) {
            console.log(res.tapIndex)
            if (res.tapIndex == 0){
              //go to me page - tests avaiable
              wx.switchTab({
                url: '/pages/me/me'
              })
            }
            else if (res.tapIndex == 1){
            //go to orderTest page - use food group
              that.orderTests(c.category)
            }
            else if (res.tapIndex == 2){
              //go to dayview with this batch
              that.toSampleSheet(c)
            }
          },
          fail (res) {
            console.log(res.errMsg)
          }
        })
      }
    })
  },


  welcomePackage: async function(input){
    var identifier =  input.split(/_/)[0]
    var quantity =  input.split(/_/)[2]
    var SAnumber =  identifier.split(/-/)[0]
    // test if it already in the database
    await this.checkSubmitted(identifier, SAnumber,quantity)
    //find the order
    var c = await this.checkSubmitted(identifier, SAnumber,'')
    //check if not used up
      if (c.tests_remaining > 0){
        //go to the site
        app.globalData.thistest = c
        app.globalData.mainBundle = c.mainBundle
        app.globalData.measureId = c._id
        app.globalData.measureClass = c.measureClass
        app.globalData.tests = c.tests
        wx.navigateTo({
          url: '/pages/testing/picksample/picksample',
        })
      }
      else{
        this.showNewOptions(c)
      }
   // 
  },

  checkSubmitted:function(identifier, SAnumber,quantity){
    var that = this
    return new Promise((resolve,reject) => {
     db.collection('Purchases')
    .where({
      bundleKitIdentifier: SAnumber,
      payment_id: identifier
    })
    .get().then(res=>{
      var found_array = res.data
      if (typeof found_array[0] != 'undefined'){
        if (found_array[0]._openid == that.data.Purchases[0]._openid){ // any purchase is ok
          resolve(found_array[0])
        }
        else{
          wx.showModal({
            title: that.data.language.noRemaining,
            content: that.data.language.itemOrder,
            showCancel: false,
            success (res) {
              if (res.confirm) {
                wx.switchTab({
                  url: '/pages/index/index',
                })
              }
            }
          }) 
        }
      }
      else{
        that.insertDB(identifier, SAnumber, quantity).then(res=>{
        app.getLogin().then(res=>{
          that.setData({
            Purchases: app.globalData.Purchases
          })
          resolve(0)
        })
        })
      }
    })
    })
  },

  insertDB(identifier, SAnumber, quantity){
    var that = this
   return new Promise((resolve,reject) => {
    dothis()
    async function dothis(){
      console.log('1')
      var mainIdentifier = app.globalData.openid
      var kits = app.globalData.orderlist
      if (typeof kits =='undefined'){
        //reload to get the latest product list
        await app.getLogin()
      }
      var bundlekits=new Map()
      for (var i = 0;  i < kits.length; i++){
         console.log('i', i)
        var mainIdentifier = kits[i]._id
        var bk_identifier = kits[i].identifier
        if (bk_identifier == SAnumber){
          console.log('SAnumber found', SAnumber)
          var kit = kits[i]
          var bk_measureclass = kit.measureClass
          var bk_total = kit.qrcodeValidity
          var bk_foodgroups = kit.foodGroups
          var bk_category = kit.category 
          var bk_subcategory = kit.subcategory 
          var bk_foodgroups_cn = kit.foodGroups_cn
          var bk_category_cn = kit.category_cn 
          var bk_subcategory_cn = kit.subcategory_cn 
          var bk_storage = kit.storage
          var bk_storage_cn = kit.storage_cn

          if (! (bundlekits.has(bk_identifier) )) {
            bundlekits.set(bk_identifier, {
            mainBundle : mainIdentifier,
            bundleKitIdentifier: bk_identifier,
            measureClass: bk_measureclass, 
            foodGroups: bk_foodgroups,
            category: bk_category,
            subcategory: bk_subcategory,
            foodGroups_cn: bk_foodgroups_cn,
            category_cn: bk_category_cn,
            subcategory_cn: bk_subcategory_cn,
            storage: bk_storage,
            storage_cn: bk_storage_cn,
            tests_total: 0,
            tests_done : 0,
            tests_remaining: 0,
            tests: new Array(),
            payment_id : identifier,
            paymentFirstEight: [bk_identifier, 'welcomepackage'].join('-'),
            address: 'no address',
            paid_amount: 0,
            paid: Boolean(0),
            time: new Date().toUTCString(),
            shipped: Boolean(0),
            shipping_id: 'freegift', 
            //qrLink: qrLink
              })
          }
          bundlekits.get(bk_identifier).tests_total += bk_total * quantity
          bundlekits.get(bk_identifier).tests_remaining += bk_total * quantity
          console.log('k', bundlekits)
          console.log('l',bundlekits.get(bk_identifier).tests.total)
          //console.log('m', bundlekits.tests.total)
        }
        console.log(bundlekits)
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
   * Lifecycle function--Called when page load
   */
  onLoad: function (query) {
     console.log(' query1', query)
      if (typeof query.scene != 'undefined'){
        console.log(' query2', query)
        const scene =  decodeURIComponent(query.scene)
        this.setData({
          scene: scene
        })
      }
      else{
        console.log('no query')
      }
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
     })
     if (this.data.lang == 'CN'){
      language = Chinese
    }
    else if (this.data.lang =='EN'){
      language = English
    }
    this.setData({
      language: language
     })
    wx.showLoading({
      title: this.data.language.processing,
    })

    var that = this
    app.getLogin().then(res=>{
    that.setData({
      lang: app.globalData.languagePreference,
      Purchases: app.globalData.Purchases
     })
     console.log('PurchasesStored', that.data.Purchases, that.data.lang)
    // here we need to collect all the relavant info
    if (that.data.lang == 'CN'){
      language = Chinese
      wx.setNavigationBarTitle({
        title: '检测'
      })
    }
    else if (that.data.lang =='EN'){
      language = English
      wx.setNavigationBarTitle({
        title: 'Start Testing'
      })
    }
    that.setData({
      language: language
     })
     app.setTabbar()
     wx.hideLoading()
     if (that.data.scene != 'noscene'){
       that.enterPurchaseId(that.data.scene)
     }
    })
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
      app.getLogin().then(res => {
         wx.reLaunch({
            url: '/pages/testing/testing'
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


  orderTests:function(cat){
  this.generateList(cat).then( 
     wx.navigateTo({
       url: '/pages/basket/orderTest/orderTest',
     })
  )
},

generateList: async function(cat){
     //set type to subcat
     var type = ''
     // go trough the list of product and find matching types (matrix)
     var itemObject = app.globalData.orderlist
     console.log('itmes', itemObject)
     itemObject.forEach(function(f){
       if (f.category == cat ){
           f.hidden = false
           type = f.sampleType[0]
         } 
       })
       app.globalData.type = type
    },


    toSampleSheet: function(e){   
      // now go for all teh infomration on that day: matrix, sub, subsub, seller, market, picture, chemcial, 
      var counter = 0
      var output = new Array()
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
    },
})