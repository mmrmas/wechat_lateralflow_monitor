const app = getApp()
const db = wx.cloud.database({
  env: app.globalData.env
})

Page({
  data:{
   items:[
     {name: 'meat', name_en:'meat', name_cn:'肉类', imgsrc:'cloud://anthill-2hbtj.616e-anthill-2hbtj-1302839884/appImages/meat.png'},
     {name: 'aqua' , name_en:'aquaproducts', name_cn: '水产', imgsrc:'cloud://anthill-2hbtj.616e-anthill-2hbtj-1302839884/appImages/aqua.png'},
     {name: 'dairyeggs',  name_en:'dairy and eggs', name_cn:'奶蛋', imgsrc:'cloud://anthill-2hbtj.616e-anthill-2hbtj-1302839884/appImages/dairyeggs.png'},
     {name: 'fruitsvegs' , name_en:'fruits and vegetables', name_cn:'蔬果' , imgsrc:'cloud://anthill-2hbtj.616e-anthill-2hbtj-1302839884/appImages/fruitsvegs.png'},
   ],
   lang:'CN',
   scannedId: '',
   images:''
  },

  toTest:function(){
    wx.switchTab({
      url: '/pages/testing/testing',
    })
  },

  toView:function(){
    wx.switchTab({
      url: '/pages/view/view',
    })
  },


  //loading and data flow
  onLoad: function (query) {
    var that = this
    let openid = wx.getStorageSync("bundles"); // if not set then there is no user data
    if (openid == '') {
      app.getLogin().then(res=>{
        that.setData({
          lang: app.globalData.languagePreference
        })
        app.setTabbar()
      })
    }

    if (typeof query.scene != 'undefined'){
      console.log('query', query)
     const scene = decodeURIComponent(query.scene)
        this.setData({
        scannedId: scene
      })
      wx.redirectTo({
        url: ['/pages/basket/promoBundle/promoBundle?bundleKey=',scene].join('')
      })
    }
    else{
      console.log('no query')
    }
  },

onShow:function(){
  var that = this
   this.setData({
    lang: app.globalData.languagePreference
   })
   app.setTabbar()

      // also include prmotions
      const _ = db.command
      db.collection('Promos').where({
        date_until : _.gt(new Date()),
      }).get().then(res => {
       var promotions = res.data
       var images = []
       for (var i = 0; i < promotions.length; i++){
         if (that.data.lang =='EN'){
            images.push({'id': promotions[i].promoId , 'image':  promotions[i].promoImage})
          }
          else if (that.data.lang == 'CN'){
            images.push({'id': promotions[i].promoId , 'image':  promotions[i].promoImage_cn})
          }
        }
       console.log('images', promotions, images)
       that.setData({
         images: images
       })
      })
},

 toProductPage:function(e){
   console.log('sent', e)
  var type = e.target.id
  this.setData({
    sampleType : type,
  })
  app.globalData.type = type
  this.generateList().then(
     wx.navigateTo({
       url: '/pages/basket/orderTest/orderTest',
     })
  )
},

 generateList: async function(){
     // go trough the list of product and find matching types (matrix)
     var sampleType = this.data.sampleType
     var itemObject = app.globalData.orderlist
     itemObject.forEach(function(f){
       var matrices = f.sampleType
       f.hidden = true // set all to hidden first
       matrices.forEach(function(g){
         if (g == sampleType){
           f.hidden = false
         }
       })
     })
 },

 onPullDownRefresh: function () {
  console.log('pulled')
  wx.reLaunch({
    url: '/pages/index/index'
  })

},
toPromo:function(e){
  console.log('e', e)
  var link = e.target.id
  wx.redirectTo({
    url: ['/pages/basket/promoBundle/promoBundle?bundleKey=',link].join('')
  })
}

})
