
// pages/3_2_protocol/protocol.js
const app = getApp()
const db = wx.cloud.database({
  env: app.globalData.env
    })
Page({

  /**
   * Page initial data
   */
  data: {
    matrices:new Array(),
    matrices_abb: {meat: ['meat', '肉类'], aqua: ['aquaproducts', '水产'], dairyeggs: ['dairy and eggs', '蛋奶' ], fruitsvegs:['fruits and vegetables', '蔬果']},
    submatrices_array : [''],
    submatrices: [
      {meat: ['pork', 'poultry', 'beef', 'lamb', 'other']},
      {aqua: [ 'fish', 'shrimp', 'crab', 'lobster', 'shellfish', 'other']},
      {dairyeggs: ['milk', 'fresh eggs', 'other']},
      {fruitsvegs: ['fruit', 'vegetables' , 'other']},
      {肉类: ['猪肉', '禽肉', '牛肉', '羊肉', '其它']},
      {水产: [ '鱼', '虾', '螃蟹', '龙虾', '贝类', '其它']},
      {蛋奶: ['奶', '鲜蛋', '其它']},
      {蔬果: ['水果', '蔬菜' , '其它']},
    ],
    matrix: '',
    submatrix : '',
    organ: '',
    value: [0,0],
    foodDetails: '',
    brand: '',
    seller:'',
    category: '',
    subcategory: '',
    address: '',
    location: '',
    locationAddress: '地址信息',
    location_picked: false,
    optionalInfo: '',
    submitting: false,
    lang:'CN'
  },  
 
  OptionalInfoAndSubmit: function(e){
    var that = this
    var foodDetails = (e.detail.value.foodDetails != '') ? e.detail.value.foodDetails : ''
    var seller = (e.detail.value.seller != '') ? e.detail.value.seller : ''
    var brand = (e.detail.value.brand != '') ? e.detail.value.brand : ''
    
    var content = {
      brand: brand, seller:seller, foodDetails:foodDetails
    } 
    this.setData({
      optionalInfo: content,
      submitting: true
    })

    //set the variables for the next page
    app.globalData.foodDetails = foodDetails
    app.globalData.brand = brand
    app.globalData.seller = seller
    app.globalData.testmatrix = that.data.matrix
    app.globalData.testSubmatrix = that.data.submatrix
  },

  continueSubmit:function(){
    this.setData({
      submitting:false
    })
    wx.navigateTo({
    url: '/pages/testing/assay/assay',
    })
  },

  cancelSubmit:function(){
    this.setData({
      submitting:false
    })
  },


  bindChange: function(e) {
    var val = new Array(0,0)
    console.log('e', e)
    if (e !== 0){
      val = e.detail.value
    }
    var original = this.data.matrices
    var matrix = this.data.matrices[val[0]]
    var matrixnumber = 0
    if (matrix == 'meat') {matrixnumber =  0              //ENGLISH submatrices
    } else if (matrix == 'aquaproducts') { matrixnumber = 1 
    } else if (matrix == 'dairy and eggs') { matrixnumber = 2
    } else if (matrix == 'fruits and vegetables') { matrixnumber = 3
    } else if (matrix == '肉类') { matrixnumber = 4            //CHINESE submatrices 
    } else if (matrix == '水产') { matrixnumber = 5
    } else if (matrix == '蛋奶') { matrixnumber = 6
    } else if (matrix == '蔬果') { matrixnumber = 7
    }

   //below not very clean, improve it later
   val =[val[0], val[1]]
   if (val[0] != this.data.value[0]){  // reset first value as the existing indices may not exist
      val = [val[0],0]
    }
    var s_array = this.data.submatrices[matrixnumber]
    s_array =  Object.values(s_array)[0]
    console.log('sarry', matrix, s_array, val)

    this.setData({
      matrix: this.data.matrices[val[0]],
      submatrix: s_array[val[1]],
      submatrices_array : s_array,
      value : val,
      matrices : original
    })
  }, 

  createResults: function(){
    wx.navigateTo({
      url: '/pages/testing/assay/assay',
    })
  },
 
  /**
   * Lifecycle function--Called when page load
   */
  onLoad_test: function (options) {
    this.setData({
      lang: app.globalData.languagePreference
     })
    //get the list of possible matrices
    var mList = app.globalData.thistest.foodGroups
    var milkOnly = app.globalData.thistest.measureClass.milkOnly
    var changed = {}
     if (milkOnly == true){
      changed['submatrices[' + 2 + ']'] = {dairyeggs: ['milk']}
      changed['submatrices[' + 6 + ']'] = {蛋奶: ['奶']}
     }
     this.setData(changed)   

    console.log('fg', mList)
    var newList = new Array()

    for (var i = 0; i < mList.length; i++){
      var c = mList[i]
      console.log('c', c)
      c = c.replace(/&/, '')
      if (this.data.lang == 'EN'){
        newList.push (this.data.matrices_abb[c][0])
        wx.setNavigationBarTitle({
          title: 'Food Description'
        })
      }
      if (this.data.lang == 'CN'){
        newList.push (this.data.matrices_abb[c][1])
        wx.setNavigationBarTitle({
          title: '食品信息'
        })
      }
    }
    console.log('newLis', newList)
    var category =''
    var subcategory =''
    if (this.data.lang =='EN'){
       category = app.globalData.thistest.category
       subcategory = app.globalData.thistest.subcategory
    }
    if (this.data.lang =='CN'){
       category = app.globalData.thistest.category_cn
       subcategory = app.globalData.thistest.subcategory_cn
    }
    if (category == subcategory){
      category = ' '
    }
    this.setData({
      matrices : newList,
      subcategory: subcategory,
    })
    if (category !== ' '){
      this.setData({
        matrices : newList,
        category: ['(' , category , ')'].join('')
      })
    }
    this.bindChange(0)
    //this.removeLocation()
    
    // then put the result into this.data.matrices. Then we can make a selection
    // store the selection as in app.Globaldata too
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
    this.onLoad_test()
     this.setData({
       value:[0, 0],
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

  getLocation: function(){
    return new Promise ((resolve, reject) => {
      var that = this
      console.log("pressed")
       wx.chooseLocation({
        success (res) {
          console.log('chosen', res)
          var location = db.Geo.Point(res.longitude, res.latitude)
          var address = res.address
          that.setData({
            address: address,
            location:location,
            locationAddress:address,
            location_picked:true
          })
          app.globalData.sampleLocation = that.data.location
          app.globalData.sampleAddress = that.data.address
          console.log('1', app.globalData.sampleAddress, app.globalData.sampleLocation)
         console.log('3',that.data.address, that.data.locationAddress, that.data.location, that.data.location_picked)
         resolve()
        }
      })
    })
    console.log('2')
  },

  removeLocation:function(){
    //remove the location
    var location = 'unknown'
    var address = ''
    var locationAddress = ''
    if (this.data.lang =='EN'){
      address = 'unknown'
      locationAddress = 'Location' 
    }
    else if (this.data.lang == 'CN'){
      address = '未知'
      locationAddress = '地址信息'
    }
    this.setData({
      address: address,
      location: location,
      locationAddress: locationAddress,
      location_picked: false
    })
    app.globalData.sampleLocation = this.data.location
    app.globalData.sampleAddress = this.data.address
  }
})