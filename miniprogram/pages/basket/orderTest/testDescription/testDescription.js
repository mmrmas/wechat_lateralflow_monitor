const app = getApp()

Page({

  /**
   * Page initial data
   */
  data: {
    all_items: '',
    kit: '',
    lang: 'CN',
    sourceKey: '' ,
    sourceValue: ''
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {
    //where does it come from: source or bundleKey?
    if ('bundleKey' in options){
      this.setData({
        sourceKey: 'bundleKey',
        sourceValue: options.bundleKey
      })
      console.log('bk', this.data.sourceValue )
    }
    else if ('source' in options){
      this.setData({
        sourceKey: 'source',
        sourceValue: options.source
      })
    }
    var that = this
    this.setData({
      all_items: app.globalData.orderlist,
      lang: app.globalData.languagePreference
    })
    if (this.data.lang == 'CN'){
      wx.setNavigationBarTitle({
        title: '关于检测'
      })
    }
    else if (this.data.lang =='EN'){
      wx.setNavigationBarTitle({
        title: 'Test description'
      })
    }
    var kitId = '';
    wx.getStorage({
      key: 'testKitPage',
      success (res) {
        kitId = res.data
        that.getKitDescription(kitId)
      }
    })
    console.log('language', this.data.lang)
  },

  getKitDescription:function(id){
    var all_items = this.data.all_items
    console.log('allitems', all_items)
    for (var i = 0; i < all_items.length; i ++){
      if (all_items[i]._id == id){
        console.log('lang',this.data.lang)
        if (this.data.lang == 'EN'){
          all_items[i].foodGroupsShow = new Array()
          for (var j = 0; j < all_items[i].foodGroups.length; j++){
            console.log('item aqua', j , all_items[i].foodGroups[j])
            if (all_items[i].foodGroups[j] == 'meat'){
              all_items[i].foodGroupsShow.push('fresh meat')
              console.log('found aqua', all_items[i].foodGroups[j] ,all_items[i].foodGroups )
            }
            if (all_items[i].foodGroups[j] == 'aqua'){
              all_items[i].foodGroupsShow.push('fresh fish and aquaproducts')
              console.log('found aqua', all_items[i].foodGroups[j] ,all_items[i].foodGroups )
            }
            else if (all_items[i].foodGroups[j] == 'dairyeggs'){
              all_items[i].foodGroupsShow.push('milk and/or fresh eggs')
            }
            else if (all_items[i].foodGroups[j] == 'fruitsvegs'){
              all_items[i].foodGroupsShow.push('fresh fruits and vegetables')
            }
          }
        }
        if (this.data.lang == 'CN'){
          all_items[i].foodGroupsShow_cn = new Array()
          for (var j = 0; j < all_items[i].foodGroups_cn.length; j++){
            console.log('item aqua', j , all_items[i].foodGroups_cn[j],  all_items[i].foodGroupsShow_cn)
            if (all_items[i].foodGroups_cn[j] == '肉类'){
              all_items[i].foodGroupsShow_cn.push('新鲜肉类')
            }
            if (all_items[i].foodGroups_cn[j] == '水产'){
              all_items[i].foodGroupsShow_cn.push('新鲜水产')
            }
            else if (all_items[i].foodGroups_cn[j] == '蛋奶'){
              all_items[i].foodGroupsShow_cn.push('鲜蛋/奶')
            }
            else if (all_items[i].foodGroups_cn[j] == '蔬果'){
              all_items[i].foodGroupsShow_cn.push('新鲜蔬果')
            }
          }
        }
        this.setData({
          kit: all_items[i]
        })
        break
      }
    }
    console.log(this.data.kit)
  },

  previewProtocol:function(e){
    var protocol = this.data.kit.measureClass
    //
    protocol.NoPreview = false
    console.log('protocol', protocol)
    var subcategory = this.data.kit.subcategory
    app.globalData.thistest = {}
    app.globalData.thistest.measureClass = protocol
    if (this.data.lang =='EN'){
      app.globalData.testSubmatrix = 'FOOD SAMPLE'
    }
    else if (this.data.lang == 'CN'){
      app.globalData.testSubmatrix = '食品样本'
    }
    app.globalData.thistest.subcategory = subcategory 
    wx.navigateTo({
      url: '/pages/testing/assay/assay',
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
    var that = this
    if (this.data.sourceKey == 'bundleKey'){
      wx.navigateTo({
        url: ['/pages/basket/promoBundle/promoBundle?bundleKey=', that.data.sourceValue].join('')
      })
    }
    else{
      wx.navigateTo({
        url: '/pages/basket/orderTest/orderTest'
      })
    }
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

  }
})