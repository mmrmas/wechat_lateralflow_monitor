// pages/orderPrivateTest/orderPrivateTest.js
const app = getApp()

Page({

  /**
   * Page initial data
   */
    data: {
      items: [],
      sampleType:[],
      array: Array.from(Array(100).keys()),
      expanded : '',
      swipers:[ 
        {fileName: 'cloud://anthill-2hbtj.616e-anthill-2hbtj-1302839884/appImages/Swiper_1.jpg'},
        {fileName: 'cloud://anthill-2hbtj.616e-anthill-2hbtj-1302839884/appImages/Swiper_2.jpg' },
        {fileName: 'cloud://anthill-2hbtj.616e-anthill-2hbtj-1302839884/appImages/Swiper_3.jpg'},
        {fileName: 'cloud://anthill-2hbtj.616e-anthill-2hbtj-1302839884/appImages/Swiper_4.jpg'},
      ],
      swipers_en:[
      {fileName_en: 'cloud://anthill-2hbtj.616e-anthill-2hbtj-1302839884/appImages/Swiper_1_Eng.jpg'},
      {fileName_en: 'cloud://anthill-2hbtj.616e-anthill-2hbtj-1302839884/appImages/Swiper_2_Eng.jpg' },
      {fileName_en: 'cloud://anthill-2hbtj.616e-anthill-2hbtj-1302839884/appImages/Swiper_3_Eng.jpg'},
      {fileName_en: 'cloud://anthill-2hbtj.616e-anthill-2hbtj-1302839884/appImages/Swiper_4_Eng.jpg'},
      ],
      false:false,
      true:true,
      lang:'CN',
      products: {
        meat:['Pork', 'Poultry', 'Beef'],
        aqua:['Aquaproducts'],
        dairyeggs:['Milk', 'Eggs'],
        fruitsvegs:['nothing']
      },
      products_cn: {
        meat:['猪肉', '禽肉', '牛肉'],
        aqua:['水产'],
        dairyeggs:['牛奶', '鲜蛋'],
        fruitsvegs:['nothing']
      },
      productIndex:new Array(0),
      listProducts :'',
      barPlot:'',
      thisProduct: '',
      estimates_en: {
        Pork: {r1: 'Tetracyclines', r2: 'Sulfonamides',  r3: 'Macrolides*'},
        Poultry: {r1: 'Tetracyclines', r2: 'Macrolides*',  r3: 'Beta-lactams*'},
        Beef: {r1: 'Tetracyclines', r2: 'Macrolides*',  r3: 'Beta-lactams*'},
        Aquaproducts: {r1: 'Quinolones', r2: 'Beta-lactams',  r3: 'Tetracyclines'},
        Eggs: {r1: 'Quinolones', r2: 'Tetracyclines',  r3: 'Sulfonamides'},
        Milk: {r1: 'Beta-lactams', r2: 'Tetracyclines',  r3: 'Quinolones'},
        nothing:{a:''}
      },
      estimates_cn: {
        猪肉: {r1: '四环素', r2: '磺胺',  r3: '大环内酯*'},
        禽肉: {r1: '四环素', r2: '大环内酯*',  r3: '内酰胺*'},
        鲜蛋: {r1: '喹诺酮', r2: '四环素',  r3: '磺胺'},
        牛奶: {r1: '内酰胺', r2: '四环素',  r3: '喹诺酮'},
        牛肉: {r1: '四环素', r2: '大环内酯*',  r3: '内酰胺*'},
        水产: {r1: '喹诺酮', r2: '内酰胺',  r3: '四环素'},
        nothing:{a:''}
      },
      estimates: '',
      testHelp:false,
      notYetAvailable: ' ',
      notYetAvailable_cn: ' '
    },

    bindPickerChange: function(e) {
      var target = e.currentTarget.id
      var quantity = e.detail.value
      var changed = {};
      for (var i = 0; i < this.data.items.length; i++) {
        if (this.data.items[i].productName === target) {
          changed['items[' + i + '].quantity'] = quantity
          changed['items[' + i + '].price'] = quantity * this.data.items[i].productCost
          changed['items[' + i + '].showprice'] =  quantity * this.data.items[i].productCost
          if (quantity > 0){
            changed['items[' + i + '].checked'] = true
            changed['items[' + i + '].nonBundlePicked'] = true
          }
          else if (quantity == 0){
              changed['items[' + i + '].checked'] = false
              changed['items[' + i + '].nonBundlePicked'] = false
          }
        }
      }
      this.setData(changed)   
      app.globalData.orderlist = this.data.items
    },

    checkboxChange: function(e) {
      var selected = e.detail.value
      console.log('selec', selected)
      var changed = {};
      for (var i = 0; i < this.data.items.length; i++) {
        if (this.data.items[i].hidden === false && (!('bundleItem' in this.data.items[i]) || this.data.items[i].bundleItem == false)){ // to solve the issue of removing stuff that is not on this particular page but clicked on a different page and therefore present in the orderlist
          changed['items[' + i + '].checked'] = false
        }
        for (var selected_id of selected){
          if (this.data.items[i]._id === selected_id) {
            console.log('found', selected_id)
            changed['items[' + i + '].checked'] = true
            changed['items[' + i + '].nonBundlePicked'] = true
            if (this.data.items[i].quantity == 0){
              changed['items[' + i + '].quantity'] = 2
              changed['items[' + i + '].price'] = 2 * this.data.items[i].productCost
              changed['items[' + i + '].showprice'] = 2 * this.data.items[i].productCost
            }
          }
        }
      }
      this.setData(changed)
      console.log('items', this.data.items)
      console.log('changed', changed)
      for (var i = 0; i < this.data.items.length; i++) {
        if (this.data.items[i].checked === false) {
          changed['items[' + i + '].quantity'] = 0
          changed['items[' + i + '].price'] = 0
          changed['items[' + i + '].showprice'] = 0
          changed['items[' + i + '].nonBundlePicked'] = false
        }
      }
  
       console.log('changed', changed)
      this.setData(changed)
      console.log('items', this.data.items)
      app.globalData.orderlist = this.data.items
    },

    toBasket: function(e){
        wx.switchTab({
          url: '/pages/basket/basket',
        })
   },

 goBack:function(){
   wx.switchTab({
     url:'/pages/index/index',
   }).then(res=>{
    wx.pageScrollTo({
      scrollTop: 800,
      duration: 300
    })
  })
}, 

  toTestDescription:function(e){
    console.log(e, 'idtest')
    wx.setStorage({
      key:"testKitPage",
      data: e.currentTarget.id
    }).then(res=>{
      wx.redirectTo({
        url: '/pages/basket/orderTest/testDescription/testDescription?source=orderTest'
      })
    })
 },

 toTestDescriptionDetail:function(e){
   var identifier = e.currentTarget.id
   console.log('e clicked', e, identifier)
   this.setData({
     expanded:identifier
   })
 },

 closePopup: function(){
  this.setData({
    expanded:'null'
  })

 },
 

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {
    this.setData({
      lang: app.globalData.languagePreference
     })
     if (this.data.lang == 'CN'){
      wx.setNavigationBarTitle({
        title: '购买检测'
      })
    }
    else if (this.data.lang =='EN'){
      wx.setNavigationBarTitle({
        title: 'Order tests'
      })
    }
     
    this.setData({
      items : app.globalData.orderlist,
      sampleType : app.globalData.type
    })
    var items = this.data.items
    this.data.items.forEach(function(c){
      c.hidden_search = false
    })

    var listProducts =  ''
    var firstProduct = ''
    console.log('st', this.data.sampleType, this.data.products_cn , this.data.products)
    if (this.data.lang == 'CN'){
      listProducts =  this.data.products_cn[this.data.sampleType]
      firstProduct = listProducts[0]
      this.setData({
        estimates : this.data.estimates_cn  // set estimates to Chinese version
      })
    }
    if (this.data.lang == 'EN'){
      listProducts =  this.data.products[this.data.sampleType]
      firstProduct = listProducts[0]
      this.setData({
        estimates : this.data.estimates_en  // set estimates to Chinese version
      })
    }
    
    this.setData({
      items : items,
      listProducts: listProducts,
      barPlot : this.data.estimates[firstProduct],
      thisProduct : firstProduct
    })
    var bpObj =  this.data.barPlot
    var bpVal = Object.values(bpObj).toString()
    if (bpVal.match(/\*/) ){
      console.log('string', this.data.barPlot.toString())
      this.setData({
        notYetAvailable: '* not yet available',
        notYetAvailable_cn: '* 暂无该检测'
      })
    }
    else{
      this.setData({
        notYetAvailable: ' ',
        notYetAvailable_cn: ' '
      })
    }
    //
    console.log('its', this.data.lang)
  },

  removeThis: function(e){
    var removeId = e.currentTarget.id
    var items =  this.data.items
   items.forEach(function(c){
      if (c._id == removeId){
        c.quantity = 0
        c.price = 0
        c.checked = false
      }
    })
    this.setData({
      items : items
    })
  },

 onPullDownRefresh: function () {
   var that = this
 //  var type = app.globalData.type
    let openid = wx.getStorageSync("bundles");
    console.log("incoming id：" + openid);
    if (openid == '') {
      console.log('empty')
      app.getLogin().then(res => {
        that.onLoad()
    })
  }
}, 
createTabBar:function(e){
  var index = e.detail.value
  var product = this.data.listProducts[index]
  var estimates= this.data.estimates
  var barplot = estimates[product]
  
  this.setData({
    barPlot: barplot,
    thisProduct: product
  })
  var bpObj =  this.data.barPlot
  var bpVal = Object.values(bpObj).toString()
  if (bpVal.match(/\*/) ){
    this.setData({
      notYetAvailable: '* not yet available',
      notYetAvailable_cn: '* 暂无该检测'
    })
  }
  else{
    this.setData({
      notYetAvailable: ' ',
      notYetAvailable_cn: ' '
    })
  }
  //
},

testHelp:function(){
  var update = ''
  if (this.data.testHelp == false){
    update = true
  }
  else{
    update = false
  }
  this.setData({
    testHelp: update
  })
},
  /**
   * Lifecycle function--Called when page unload
   */

})