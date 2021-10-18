
const app = getApp()
const startEndMove = new Array([0,0])
const buttonColor= '#92c06d9c'
const buttoncolorClicked = '#EDEBE1'
const buttonMeat = '#6a180aaf'
const buttonFV = '#92c06d'
const buttonDE = '#c1b16c' 
const buttonAqua = '#1CADB6'
 
Page({
  data:{
    timeStyles:{
      lastWeek:['background-color:',buttonColor].join(''),
      lastMonth:['background-color:',buttonColor].join(''),
      all:['background-color:',buttoncolorClicked].join(''),
    },
    clickedStyles: {
      all: ['background-color:',buttonColor].join(''),
      meat: ['background-color:',buttonMeat].join(''),
      aqua: ['background-color:',buttonAqua].join(''),
      dairyeggs: ['background-color:',buttonDE].join(''),
      fruitsvegs: ['background-color:',buttonFV].join(''),
    },
    d1 : 0,
    maxdate: 31,
    today : '',
    prevmonth: '',
    nextmonth: '',
    caledarMonth: '',
    calendarYear: '',
    calendarData: '',
    link : new Array(),
    hereAndNow: '',
    dayMap : '',
    avatarUrl: '/images/user-unlogin.png',
    false: false, // for wxml reasons
    true: true,  // for wxml reasons
    subcanvases: [],
    userInfo: {},
    logged: false,
    nickname : 'anonymous',
    takeSession: false,
    requestResult: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    // most of these numbers should be pulled out of the database
    longitude: '' , // shoudl be starting with current location
    latitude: '', // shoudl be starting with current location
    markers: '',
    positiveIcon:'',
    negativeIcon:'',
    northeast: '',
    southwest:'',
    overview: 'all', // can also be meat and fish, dairy and eggs, fruit and veg
    minyear: 1999, // shoudl come from the app.js overview (first submission)
    minmonth: 1,   // idem
    begindate_obj : '',
    enddate_obj : '',
    beginvalue: 0,
    endvalue:'',
    chosenMonth : 0, 
    screenwidth : 0, // make canvas for screenwidth of 375 px, adjust canvas pareseInt (x / 375 * screenwidth)
    individualCategory : 'all', // to keep track of the tabs - change when a new tab is picked!
   // backgroundPicked : 'grey'
   inputValue:'',
   switchPositives: false, 
   Purchases : '',
   switchMap: false,
   mapscale: 12,
   buttons: 
    {meat:'cloud://anthill-test-a8ula.616e-anthill-test-a8ula-1302839884/appImages/meat.png',
    aqua:'cloud://anthill-test-a8ula.616e-anthill-test-a8ula-1302839884/appImages/aqua.png',
    dairyeggs:'cloud://anthill-test-a8ula.616e-anthill-test-a8ula-1302839884/appImages/dairyeggs.png',
    fruitsvegs:'cloud://anthill-test-a8ula.616e-anthill-test-a8ula-1302839884/appImages/fruitsvegs.png'},
    lang: 'CN',
    BacktranslatedMatrices_en:{
      'meat': 'meat',
      'aqua': 'aquaproducts',
      'fruitsvegs': 'fruits and vegetables',
      'dairyeggs': 'dairy and eggs',
    },
    BacktranslatedMatrices_cn:{
      'meat': '肉类',
      'aqua': '水产',
      'fruitsvegs': '蔬果',
      'dairyeggs': '蛋奶',
    }
  },


  //***************************************
   // we start with the functions called from the wxml page 
   
  openMe : function(){ // check data from user

  },
    
  checkFriends: function(){ // check data from friends

  },

  openNearby(){ // check data from people nearby

  },

  setShowHideTrue: async function(changed){
    return new Promise ((resolve, reject) => {
      for (var i = 0; i < changed.length; i++){
        for (var j = 0 ; j< changed[i].tests.length; j++){
          changed[i].tests[j] = Object.defineProperty(changed[i].tests[j],'show_hide',{
            value: "show",
            writable:true
          })
          console.log('setting true', changed[i].tests[j].show_hide)
        }
      }
      resolve(changed)
    })
  },

  allData: function(){
    const changed = Object.assign([{}], this.data.Purchases)
    this.setShowHideTrue(changed).then(res=>{
      res = changed
      this.setData({
        individualCategory : 'all',
        Purchases: changed
      })
      this.positivesOnly()
    })
  },

  meatOnly: function(){
    const changed = Object.assign([{}], this.data.Purchases)
    this.setShowHideTrue(changed).then(res=>{
    res = changed
    for (var i = 0; i < changed.length; i++){
      for (var j = 0 ; j< changed[i].tests.length; j++){
        if (changed[i].tests[j].matrix != 'meat' && changed[i].tests[j].matrix != '肉类'){
          changed[i].tests[j] = Object.defineProperty(changed[i].tests[j],'show_hide',{
            value: "hide",
            writable:true
          })
          console.log( 'inloop', changed[i].tests[j])
        }
      }
    }
    console.log('changed',changed)
    this.setData({
      individualCategory: 'meat',
      Purchases: changed
    })
    this.positivesOnly()
    })
  },

  aquaOnly: function(){
    const changed = Object.assign([{}], this.data.Purchases)
    this.setShowHideTrue(changed).then(res=>{
    res = changed
    for (var i = 0; i < changed.length; i++){
      for (var j = 0 ; j< changed[i].tests.length; j++){
        if (changed[i].tests[j].matrix != 'aquaproducts' && changed[i].tests[j].matrix != '水产'){
          changed[i].tests[j] = Object.defineProperty(changed[i].tests[j],'show_hide',{
            value: "hide",
            writable:true
          })
          console.log( 'inloop', changed[i].tests[j])
          }
        }
      }
      this.setData({
        individualCategory: 'aqua',
        Purchases: changed
      })
      this.positivesOnly()
    })
  },

  dairyOnly: function(){
    const changed = Object.assign([{}], this.data.Purchases)
    this.setShowHideTrue(changed).then(res=>{
      res = changed
      for (var i = 0; i < changed.length; i++){
       for (var j = 0 ; j< changed[i].tests.length; j++){
          if (changed[i].tests[j].matrix != 'dairy and eggs' && changed[i].tests[j].matrix != '蛋奶'){
            changed[i].tests[j] = Object.defineProperty(changed[i].tests[j],'show_hide',{
              value: "hide",
              writable:true
            })
            console.log( 'inloop', changed[i].tests[j])
          }
        }
      }
      this.setData({
        individualCategory: 'dairyeggs',
        Purchases: changed
      })
      this.positivesOnly()
    })
  },


  fVOnly: function(){
    const changed = Object.assign([{}], this.data.Purchases)
    this.setShowHideTrue(changed).then(res=>{
      res = changed
      for (var i = 0; i < changed.length; i++){
        for (var j = 0 ; j< changed[i].tests.length; j++){
          if (changed[i].tests[j].matrix != 'fruits and vegetables' && changed[i].tests[j].matrix != '蔬果'){
            changed[i].tests[j] = Object.defineProperty(changed[i].tests[j],'show_hide',{
              value: "hide",
              writable:true
            })
          }
          console.log( 'inloop', changed[i].tests[j])
        }
      }
      this.setData({
        individualCategory: 'fruitsvegs',
        Purchases: changed
      })
      this.positivesOnly()
    })
  },


  switchPositives:function(e){
    // set data to the value
      this.setData({
        switchPositives : e.detail.value
      })
      if (this.data.individualCategory =='all'){
        this.allData()
      }
      else if (this.data.individualCategory =='meat'){
        this.meatOnly()
      }
      else if (this.data.individualCategory =='aqua'){
        this.aquaOnly()
      }
      else if (this.data.individualCategory =='dairyeggs'){
        this.dairyOnly()
      }
      else if (this.data.individualCategory =='fruitsvegs'){
        this.fVOnly()
      }
    },

  // end of page functions
  //***************************************


  //***************************************
  // now we declare analysis functions

// category area
// now the indidual categories
individualCategories: async function(specific){
  //first set the button
  console.log(specific,'s')
  var bgCol = 
    {all: ['background-color:',buttonColor].join(''),
    meat: ['background-color:',buttonMeat].join(''),
    aqua: ['background-color:',buttonAqua].join(''),
    dairyeggs: ['background-color:',buttonDE].join(''),
    fruitsvegs: ['background-color:',buttonFV].join('')
  }
  for (var key of Object.keys(bgCol)) {
    if (key == specific){
      bgCol[key] = ['background-color:',buttoncolorClicked].join('')
    }
 }
  this.setData({
    clickedStyles: bgCol
  })


  // first get the variables
  var matrixMap = await this.fillMatrixMap(specific).then(res=>{
    matrixMap = res
  //create canvas for score
  var allscores = []
  var totals = 0
  var positives = 0
  allscores.push(this.getScore(matrixMap))
  totals += this.getTotal(matrixMap)
  positives += this.getPositives(matrixMap)
  var endscore = 0;
 
  var total_allscores = 0
  var length_allscores = 0
  for (var i = 0; i < allscores.length; i++){
    if (allscores[i] > -1){
      total_allscores += allscores[i]
      length_allscores += 1
    }
  }
  var endscore = total_allscores / length_allscores
  if (length_allscores == 0){
    endscore = 0
  }
  const ctxmain = wx.createCanvasContext('canvas_main')
  this.mainVerdict(ctxmain, endscore, totals, positives)
})
},

  getScore: function(matrixMap){
    if (matrixMap.size > 0 &&  matrixMap.get('all').all > 0){
      var out = 0
      out = matrixMap.get('all').pos / matrixMap.get('all').all
      return(out)
    }
    else {
      return -1
    }

  },
  
  getTotal: function(e){
    if (e.size > 0 && e.get('all').all > 0){
      return e.get('all').all
    }
    else{
      return 0
    }
  },

  getPositives: function(e){
    if (e.size > 0 && e.get('all').all > 0){
      return e.get('all').pos
    }
    else{
      return 0
    }
  },

  // end of analysis functions
  //*************************************

  //***************************************
  // now we declare the graphics functions

  fillMatrixMap: async function(matrix){
    var that = this
    var tempMap = new Map()
    var calendarMap = new Map()
 
    var input = Object.assign([{}],this.data.Purchases)
    for (var i = 0 ; i < input.length; i++){
      var l = input[i]
      var category = l.category
      var tests = l.tests
      for (var j = 0 ; j< tests.length; j++){
        var m = tests[j]
         // then it is time to translate
        var outcome = (m.qualResult_en === 'P') ? 1 : 0
        var location = m.testLocation
        var fileID = m.cloudFileId
        var rv_bool = await this.fetchData(i, j) // use this.data.Purchases as global
      
        if (rv_bool == 0){
          console.log('ij', i, j)
          input[i].tests[j] = Object.defineProperty(input[i].tests[j],'show_hide',{
            value: "hide",
            writable:true
          })
          continue
          console.log(' input[i].tests[j].show_hide 2',  input[i].tests[j].show_hide)
        }
        else if (rv_bool == 1  &&  input[i].tests[j].show_hide != "hide"){  //!= hide because eitehr show or undefined
        //else if (rv_bool == 1 ){  //!= hide because eitehr show or undefined
          input[i].tests[j] = Object.defineProperty(input[i].tests[j],'show_hide',{
            value: "show",
            writable:true
          })
       console.log('input[i].tests[j]', input[i].tests[j])
       }
  
        var b = await this.endLoop(input[i].tests[j], matrix, tempMap, calendarMap, outcome, location, category,fileID)
        tempMap = b[0]
        calendarMap = b[1]
      }
    } 
      this.setData({
       calendarData : calendarMap,
       Purchases: input
      })
      console.log('Purchasedata', that.data.Purchases)
      return(tempMap)
    },
   
    // fucntions in this function
    endLoop:async function (m , matrix, tempMap, calendarMap, outcome, location, category, fileId){
        var that = this 
        return new Promise ((resolveel, reject) => {
        console.log('m', m)
        // then other checks
        if (typeof m.matrix === 'undefined'){
          resolveel([tempMap, calendarMap])
        }
        if (m.qualResult_en === 'U'){
          resolveel([tempMap, calendarMap])
        }
        if (m.show_hide == "hide"){
          resolveel([tempMap, calendarMap])
        }
        var matrix_Backtranslated_en = ''
        var matrix_Backtranslated_cn = ''
        matrix_Backtranslated_en = that.data.BacktranslatedMatrices_en[matrix]
        matrix_Backtranslated_cn = that.data.BacktranslatedMatrices_cn[matrix]
   
        if (m.matrix == matrix_Backtranslated_en || m.matrix == matrix_Backtranslated_cn || (matrix == 'all' && m.matrix != '') ){
          if (! (tempMap.has('all') )) {
            tempMap.set('all', {all: 0, pos: 0});
          }
          if (! (calendarMap.has(m.testDate) )) {
            calendarMap.set(m.testDate, {pos: new Array(), loc:new Array(), ids:new Array()})
          }  
          tempMap.get("all").all++;
          tempMap.get("all").pos += outcome;
          calendarMap.get(m.testDate).pos.push(outcome)
          calendarMap.get(m.testDate).loc.push(location)
          calendarMap.get(m.testDate).ids.push(fileId)

          if (! (tempMap.has(category) )) {
              tempMap.set(category, {all: 0, pos: 0})
          }  
          tempMap.get(category).all++
          tempMap.get(category).pos += outcome
        }
        resolveel([tempMap, calendarMap])
      })
     },
      
  
    //first check if there are positives only
    posOnly: function ( i, j){
      var return_val = 1
      var that = this
      var input = that.data.Purchases
      var mp = input[i].tests[j]
      if (mp.show_hide == "show"){
        if (mp.qualResult_en != 'P' && that.data.switchPositives == true){
            return_val = 0
          }
       }
    else if(mp.show_hide == "hide"){
          return_val = 0
  //        if (mp.qualResult_en != 'P' && that.data.switchPositives == false){
  //          return_val = 0  
          }
    /*      else if(mp.show_hide == "hide"){
            if (mp.qualResult_en != 'P' && that.data.switchPositives == true){
            return_val = 0
            }   
        
          }
               */  
    //    }
       return return_val
    },

    //next if date is not bewteen selected dates 
    pickDate: async function (i, j, rv){
      var input = this.data.Purchases
      console.log('inputtest', input, i, j)
      var mp = input[i].tests[j]
      if (new Date(mp.testDate) < this.data.begindate_obj || new Date(mp.testDate) > this.data.enddate_obj){
          rv = 0
        }
        else {
          rv = 1
        }
        return rv
    },


    getScores:async function (i, j, rv){
      var input = this.data.Purchases
      var mp = input[i].tests[j]
      if (this.data.switchMap == false){
          return rv
        }
        else{
          var mpLong = mp.testLocation.coordinates[0]
          var mpLat = mp.testLocation.coordinates[1]
          var max_long = this.data.northeast['longitude']
          var min_long = this.data.southwest['longitude']
          var max_lat = this.data.northeast['latitude']
          var min_lat = this.data.southwest['latitude']
        /*                  N
        *    min_long, min_lat --------  max_long, min_lat  
        *       |                             |
        *       |                             |
        *    min_long, max_lat ----------max_long, max_lat   
        *                   S
        *           Holds true all over the planet?
        */      
          // now check for every category if they fall within the square
          // sample_long >= min_long && sample_long <= max_long 
          // sample_lat >= min_lat && sample_lat <= max_lat
          // but in the database this woudl be a select statment with these coordinates as boundaries
          if (mpLong >= min_long && mpLong <= max_long && mpLat >= min_lat && mpLat <= max_lat){ // point falls on the map
            rv = 1
          }
          else{
           rv = 0
          }
          console.log('mp-loc', mp)
          console.log('coords', mpLong, min_long, max_long, mpLat, min_lat, max_lat )
          return rv
        }
    },
  

   fetchData: async function ( i, j){
      var rv = 1
      rv = await this.pickDate(i, j, rv)  // correct date
      console.log('rv1', rv)
      if (rv ==0){
        return rv
      }
      rv = await this.getScores(i, j, rv) // on the map
      console.log('rv2', rv)
      if (rv == 0){
        return rv
      }
       rv = await this.posOnly(i, j)  //pos only?
       console.log('rv3', rv)
       if (rv == 0){
         return rv
       }
      return rv
    },
  



mainVerdict: function(ctx, endscore, totals, positives){
  var totalTests = 'Total tests'
  var positiveTests = 'Positives'
  if (this.data.lang == 'CN'){
    totalTests = '全部'
    positiveTests = '检出'
  }

  // the total tests
  var percentageNegatives = 1 - endscore
  console.log('es', endscore, percentageNegatives)
  var swf = this.data.screenwidth / 375 //screenwidth factor
  ctx.translate((112.5*swf), (100*swf)) // set center to 0
  ctx.setTextAlign('center')
  ctx.setTextBaseline('middle')
 
  ctx.beginPath() // empty circle
  ctx.moveTo(0,0)
  const grdsqr = ctx.createLinearGradient(swf * -50, swf * -50, swf * 100 , swf * -50) // set greatdient for positives
  grdsqr.addColorStop(0, 'white')
  grdsqr.addColorStop(0.75, '#EBEBE8')
  ctx.setFillStyle(grdsqr)

 ctx.rotate(270 * Math.PI / 180)
  ctx.rect(swf * -50, swf * -50, swf * 100, swf * 100)
  ctx.fill()
  ctx.rotate(90 * Math.PI / 180)


  ctx.beginPath()
  ctx.setFillStyle('white')
  ctx.setLineWidth(swf * 1)


  ctx.beginPath() // add the total tests
  ctx.setFillStyle('black')
  ctx.setFontSize(swf * 15)
  ctx.fillText(totalTests, 0, (swf*65))
  ctx.setFontSize(swf * 40)
  ctx.fillText( totals , 0, 0)
  ctx.fill()
  ctx.translate((-112.5*swf), (-100*swf)) // set center to 0

  // the positive tests
  const grd = ctx.createLinearGradient(swf * -55, swf * -50, swf * 80 , swf * -50) // set greatdient for positives
  grd.addColorStop(0, '#EBEBE8')
  grd.addColorStop(percentageNegatives, 'DarkRed')



// Fill with gradient
  ctx.setLineWidth(swf * 1)
  ctx.beginPath()
  ctx.setStrokeStyle('black')
  ctx.translate((262.5*swf), (100*swf))  // set center to 0

  ctx.moveTo(0,0)
  ctx.rotate(270 * Math.PI / 180)
  ctx.beginPath()
  ctx.setLineWidth(swf * 2)
  ctx.setFillStyle(grd)
  ctx.arc(0, 0, (swf*55), 0, 2 * Math.PI)
  ctx.fill()
  //ctx.stroke()
 
  ctx.beginPath()
  ctx.setFillStyle('white')
  ctx.arc(0, 0, (swf*48), 0, 2 * Math.PI)
  ctx.closePath()
  //ctx.stroke()
  ctx.fill()
  ctx.rotate(90 * Math.PI / 180)

  ctx.beginPath()
  ctx.setFillStyle('black')
  ctx.setFontSize(swf * 15)
  ctx.fillText(positiveTests, 0, (swf*65))
  ctx.setFontSize(swf * 40)
  ctx.fillText(positives , 0, 0)
  ctx.fill()
  ctx.translate((-262.5*swf), (-100*swf)) 

ctx.draw()

},

  // end of graphics funcitons
  //***************************************


  onLoad: function () {
    this.setData({
      today: new Date(),
      hereAndNow: new Date(),
      begindate_obj : new Date(0),
      enddate_obj : new Date,
      lang: app.globalData.languagePreference
    })
    if (this.data.lang == 'CN'){
      wx.setNavigationBarTitle({
        title: '查看数据'
      })
    }
    else if (this.data.lang =='EN'){
      wx.setNavigationBarTitle({
        title: 'View Data'
      })
    }

    console.log('onLoad')
    // get essentials for this page
    var info = wx.getSystemInfoSync() 
    this.data.screenwidth = info.screenWidth
    var that = this;
    let openid = wx.getStorageSync("bundles");
    console.log("incoming id：" + openid);
    if (openid == '') {
      console.log('empty')
      app.getLogin().then(res => {
        console.log('index  id', res)
        // place the necessary functions here
        that.drawPage() 
     })
    } else {
      that.drawPage() 
    } 

   // Get user information
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
         // Authorized, you can directly call getUserInfo to get the avatar nickname without popping up
          wx.getUserInfo({
            success: res => {
              this.setData({
                avatarUrl: res.userInfo.avatarUrl,
                userInfo: res.userInfo
              })
            }
          })
        }
      }
    })
  },

  getTempLink:  function(input){
    return new Promise ((resolve, reject) => {
      wx.getImageInfo({
        src: input,
        success (res) {
          console.log('res', res.path)
          resolve(res.path)      
        }
      })
    })
  },

  focusMap:function(){
    this.setData({
      latitude: app.globalData.latitude,
      longitude: app.globalData.longitude,
      mapscale:12
  })
},

  drawPage: function() {
    var that = this
    var positiveIcon = ''
    var negativeIcon = ''
    var hasData = false

    async function fetchLink(filename){
      const promise = that.getTempLink(filename)
      const results = await Promise.all([promise])
      return results
    }
    fetchLink('cloud://anthill-test-a8ula.616e-anthill-test-a8ula-1302839884/appImages/negativeBallon.png').then(res=>{
      negativeIcon = res[0]
    }).then(resNa=>{
      fetchLink('cloud://anthill-test-a8ula.616e-anthill-test-a8ula-1302839884/appImages/positiveBalloon.png').then(res=>{
        positiveIcon = res[0]
      
        if (app.globalData.Purchases.length >0){
          hasData = true
        }

        that.setData({
          latitude: app.globalData.latitude,
          longitude: app.globalData.longitude,
          positiveIcon:positiveIcon,
          negativeIcon:negativeIcon,
          Purchases: app.globalData.Purchases,
          hasData : hasData
        })

        console.log('p-icon', this.data.positiveIcon)
        console.log('n-icon', this.data.negativeIcon)
        that.positivesOnly()
        that.getReg()
      })
    })
  },

 onReady: function () {
 },

addMarkers:async function(){
  var that = this
  var input = this.data.calendarData
  var markers=new Array()
  await input.forEach(function(value, key){ 
    for (var i = 0; i < value.ids.length; i++){ // more than one measuerment on one exact timpoint (to-the-second resolution?)
      console.log('defined?', value.loc[0].type )
      if (typeof value.loc[0].type != 'undefined' ){
        var lat = parseFloat(value.loc[i].coordinates[1])
        var lon = parseFloat(value.loc[i].coordinates[0]) 
      
        var fileId = value.ids[i]
        var id = fileId
        var title = ''
        if (that.data.lang == 'EN'){
          title =  (value.pos[i] == 1) ? 'Positive' : 'Not detected'
        }
        if (that.data.lang == 'CN'){
          title =  (value.pos[i] == 1) ? '有检出' : '无检出'
        }
        var zindex =  (value.pos[i] == 1) ? '2' : '1'
        var icon =  (value.pos[i] == 1) ? that.data.positiveIcon : that.data.negativeIcon
        markers.push({id: id, latitude:lat, longitude:lon, title:title, iconPath: icon , width:20, height:40, zIndex:zindex} )
      }
    }
  })
  this.setData({
    markers : markers
  })
},


  /**
   * Lifecycle function--Called when page show
   */
  onShow: function () {
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
    console.log('pulled')
    wx.reLaunch({
      url: '/pages/view/view'
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

  onUnload: function(){
    wx.clearStorage()
  },

  onGetUserInfo: function(e) {
    console.log('userdata', e)
    if (!this.data.logged && e.detail.userInfo) {
      this.setData({
         logged: true,
         avatarUrl: e.detail.userInfo.avatarUrl ,
         userInfo: e.detail.userInfo,
         nickname : e.detail.userInfo.nickName
      })
    }
  },

 

/* Here come the calendar functions
*************************************************************
*/


 setMonth:function(today){  // needs data object of certain date and sets the info for this month
  today = new Date(today)
  var month = new Array();
  if (this.data.lang =='CN'){
    month[0] = "一";
    month[1] = "二";
    month[2] = "三";
    month[3] = "四";
    month[4] = "五";
    month[5] = "六";
    month[6] = "七";
    month[7] = "八";
    month[8] = "九";
    month[9] = "十";
    month[10] = "十一";
    month[11] = "十二";
  }
  if (this.data.lang =='EN'){
    month[0] = "January";
    month[1] = "February";
    month[2] = "March";
    month[3] = "April";
    month[4] = "May";
    month[5] = "June";
    month[6] = "July";
    month[7] = "August";
    month[8] = "September";
    month[9] = "October";
    month[10] = "November";
    month[11] = "December";
  }


  var y = today.getFullYear();
  var mtNr = today.getMonth()
  var mt = month[mtNr];

  // also set the previous month
  var prevmonth = today.getMonth()-1
  var prevyear = today.getFullYear()
  if (prevmonth < 0){
    prevmonth = 11 + prevmonth
    prevyear = prevyear -1
  }
  prevmonth = new Date (prevyear,prevmonth,1)

  //also set the next month
  var nextmonth = today.getMonth()+1
  var nextyear = today.getFullYear()
  if (nextmonth > 11){
    nextmonth = nextmonth - 12
    nextyear = nextyear + 1
  }
  nextmonth = new Date (nextyear,nextmonth,1)

  var day1 = this.getDay(today) // get the first day of the month  
  this.assayDates(y, mtNr)  // set the assay dates (using the same method, could be improved)

  var maxdate = 31 // and set the maxdate
  var monthnumber = today.getMonth() + 1 
  if (monthnumber == 4 || monthnumber == 6 || monthnumber == 9 || monthnumber == 11 ){
    maxdate = 30  
  }
  if (monthnumber == 2 ){
    if (y % 4  === 0){
      maxdate = 29
    }
    else {
      maxdate = 28
    }
  } 

  this.setData({
    d1 : day1  ,  // this is the first sunday
    maxdate: maxdate,
    today: today,
    prevmonth : prevmonth,
    nextmonth: nextmonth,
    calendarYear: y,
    calendarMonth : mt
  })
},

getDay:function(today){
  // do the calculations for this month
  var d = today.getDate();
  var day1 = today.getDay() - (d-1)%7   // for instance 4 - (27%7 ) = -1, a saturday
  day1 = (day1 < 0) ? (6 + day1) : day1-1  // if day1 is negative make it positive
  day1 = day1 * -1 // to shift the 1st sunday to the past
  return day1
},

assayDates: function(y, mtNr){
  // get rid of old data
  this.setData({
    link: new Array(),
    dayMap: new Map()
  })

  //check if we have dates to refer to
  var realdata = this.data.calendarData
  var dayMap = new Map()
  var that = this
  realdata.forEach(function(value, key){
    for (var i = 0; i < value.pos.length; i++){
      key = new Date(key)
      if (key.getFullYear() === y && key.getMonth() === mtNr ){
        var correction = that.getDay(key) * -1
        var day = key.getDate()
        day = day + correction + 1 //frkn 0 based..
        if (! (dayMap.has(day) && dayMap.get(day).outcome > 0 )) { //make sure to retain the positives
          dayMap.set(day, {date: key, outcome: value.pos[i]} )  //key, value = day, date
        }
      }
    }
  })
  this.setData({
    dayMap : dayMap
  })

  var array = []
  var foundPositive = -1
  dayMap.forEach(function(value, key){ 
    console.log('va;ue3' , value, key)
    if (foundPositive != key && dayMap.get(key).outcome == 0){
      array[key]=['background-color:#EBEBE8; opacity:1; border-radius:5%;', 'toSampleSheet', key]
    }
    else if (dayMap.get(key).outcome > 0){
      array[key]=['background-color:darkred; opacity:1; border-radius:50%;', 'toSampleSheet', key]
      foundPositive = key // to make sure that a positive is always presented
    }
  })

  
  // and last add today's date if we are in teh same month
  var hereAndNow = this.data.hereAndNow
  if (hereAndNow.getFullYear() === y && hereAndNow.getMonth() === mtNr ){
    var correction = that.getDay(hereAndNow) * -1
    var day = hereAndNow.getDate()
    day = day + correction + 1 //frkn 0 based..
    if (typeof array[day] !== 'undefined'){
      array[day][0] = [ array[day][0], ' color:black;'].join()
    }
    else{
      array[day] = ['color:black;', '', '']
    }
  }

  that.setData({
    link: array
  })
},

prevmonth: function(){
  var prevMonth = this.data.prevmonth
  this.setData({
    today: prevMonth
  })
  this.setMonth(this.data.today)
  },

nextmonth: function(){
  var nextMonth = this.data.nextmonth
  this.setData({
    today: nextMonth
  })
  this.setMonth(this.data.today)
},

thismonth:function(){
  this.setData({
    today: new Date()
  })
  this.setMonth(this.data.today)
},

toSampleSheet: function(e){
  // id = teh key of daymap --> the value is the date. We can collect that date and print all the details
  var datekey = parseInt(e.target.id) //parseINt as it comes back as sth else from the website
  let dayMap = this.data.dayMap
  var date = dayMap.get(datekey).date

  // now go for all teh infomration on that day: matrix, sub, subsub, seller, market, picture, chemcial, 
  var output = new Array()
  var Purchases = this.data.Purchases
  var counter = 0
  Purchases.forEach(function(b){
    var category = b.category
    var subcategory = b.subcategory
    var category_cn = b.category_cn
    var subcategory_cn = b.subcategory_cn
    var tests = b.tests
    for (var i = 0; i < tests.length; i++){
      var c = tests[i]
      var measuredate = c.testDate
      measuredate = new Date(measuredate)
      if (date.getFullYear() === measuredate.getFullYear() && date.getMonth() === measuredate.getMonth() && date.getDate() == measuredate.getDate() && c.show_hide == "show"){
          counter = counter +1
          output.push({
          date : [date.getFullYear(), ' 年 ' , date.getMonth() + 1, ' 月 ' , date.getDate() , ' 日 ' ].join(''),
          category: category, 
          subcategory: subcategory,
          category_cn: category_cn, 
          subcategory_cn: subcategory_cn,
          matrix: c.matrix,
          submatrix: c.submatrix,
          qualresult_en : c.qualResult_en,
          qualresult_cn : c.qualResult_cn,
          fileID : c.cloudFileId,
          details : c.foodDetails,
          seller : c.seller,
          brand : c.brand,
          address: c.address,
          canvasId : counter
        }) 
      }
    }
  })
  app.globalData.dayview = output  // send to app to obtaoin from dayview later

  wx.navigateTo({
    url: '/pages/view/dayview/dayview',
  })
},

startmove:function(e){
  startEndMove[0] = e.changedTouches[0].pageX
},

endmove:function(e){
  startEndMove[1] = e.changedTouches[0].pageX
  if (Math.abs(startEndMove[0]- startEndMove[1]) > 100 ){
    if (startEndMove[0] > startEndMove[1]){ // add minimal distance
      this.nextmonth()
    }
    if (startEndMove[0] < startEndMove[1]){
      this.prevmonth()
    }
  }
},

purchaseTest:function(){ // still need to translate rpx to px?
  wx.pageScrollTo({
    scrollTop: 1500,
    duration: 300
  })
},

  positivesOnly:async function(){  // historic naming
  await this.individualCategories(this.data.individualCategory)
  this.setMonth(this.data.today)
  this.addMarkers()
},


toIndividualData: function(markerid){ //marekrId can be teh marker id or the word 'posOnly' to get positioves only
 // var lonlat = new Array()
  var fileId = ''
  var allInput = 0
  if (typeof markerid == 'undefined'){
    allInput = 1
  }
  else if (markerid == 'posOnly'){
    allInput = 2
  }
  else{
    fileId = markerid
  }

  // now go for all teh infomration on that day: matrix, sub, subsub, seller, market, picture, chemcial, 
  var output = new Array()
  var Purchases = this.data.Purchases
  var counter = 0
  Purchases.forEach(function(b){
    var category = b.category
    var subcategory = b.subcategory
    var category_cn = b.category_cn
    var subcategory_cn = b.subcategory_cn
    var tests = b.tests
    for (var i = 0; i < tests.length; i++){
      counter = counter + 1
      var c = tests[i]
      //cramp in the individual sheet from the map
      var testLoc = c.testLocation
      console.log('coord', c.cloudFileId, fileId)
        if (fileId == c.cloudFileId || allInput == 1 || (allInput == 2 && c.qualResult_en =='P')){
          var measuredate = c.testDate
          measuredate = new Date(measuredate)
          if (c.show_hide == "show"){
              output.push({
              date : [measuredate.getFullYear(), ' 年 ' , measuredate.getMonth() +1, ' 月 ' , measuredate.getDate() , ' 日 ' ].join(''),
              category: category, 
              subcategory: subcategory,
              category_cn: category_cn, 
              subcategory_cn: subcategory_cn,
              matrix: c.matrix,
              submatrix: c.submatrix,
              subsubmatrix: c.subsubmatrix,
              qualresult_en : c.qualResult_en,
              qualresult_cn : c.qualResult_cn,
              fileID : c.cloudFileId,
              seller : c.seller,
              brand : c.brand,
              details : c.foodDetails,
              address: c.address,
              canvasId: counter
            })
          }
        }
        else{
          continue

      }
    }
  })
  app.globalData.dayview = output  // send to app to obtaoin from dayview later

  wx.navigateTo({
    url: '/pages/view/dayview/dayview',
  })
},

lastCentury: function(){
  var bgCol = this.data.timeStyles
  for (var key of Object.keys(bgCol)) {
    if (key == 'all'){
      bgCol[key] = ['background-color:',buttoncolorClicked].join('')
    }
    else{
      bgCol[key] = ['background-color:',buttonColor].join('')
    }
   }
  var d = new Date(0);
  this.setData({
    begindate_obj : d,
    timeStyles: bgCol
  })
  if (this.data.individualCategory =='all'){
    this.allData()
  }
  else if (this.data.individualCategory =='meat'){
    this.meatOnly()
  }
  else if (this.data.individualCategory =='aqua'){
    this.aquaOnly()
  }
  else if (this.data.individualCategory =='dairyeggs'){
    this.dairyOnly()
  }
  else if (this.data.individualCategory =='fruitsvegs'){
    this.fVOnly()
  }
  },

  lastMonth:function(){
    var bgCol = this.data.timeStyles
    console.log(bgCol)
    for (var key of Object.keys(bgCol)) {
      if (key == 'lastMonth'){
        bgCol[key] = ['background-color:',buttoncolorClicked].join('')
      }
      else{
        bgCol[key] = ['background-color:',buttonColor].join('')
      }
   }
    var d = new Date();
    d.setDate(d.getDate()-31)
    this.setData({
      begindate_obj : d,
      timeStyles: bgCol
    })
    if (this.data.individualCategory =='all'){
      this.allData()
    }
    else if (this.data.individualCategory =='meat'){
      this.meatOnly()
    }
    else if (this.data.individualCategory =='aqua'){
      this.aquaOnly()
    }
    else if (this.data.individualCategory =='dairyeggs'){
      this.dairyOnly()
    }
    else if (this.data.individualCategory =='fruitsvegs'){
      this.fVOnly()
    }
  },

  lastWeek:function(){
    var bgCol = this.data.timeStyles
    for (var key of Object.keys(bgCol)) {
      if (key == 'lastWeek'){
        bgCol[key] = ['background-color:',buttoncolorClicked].join('')
      }
      else{
        bgCol[key] = ['background-color:',buttonColor].join('')
      }
   }
    var d = new Date();
    d.setDate(d.getDate()-7)
    this.setData({
      begindate_obj : d,
      timeStyles: bgCol
    })
    if (this.data.individualCategory =='all'){
      this.allData()
    }
    else if (this.data.individualCategory =='meat'){
      this.meatOnly()
    }
    else if (this.data.individualCategory =='aqua'){
      this.aquaOnly()
    }
    else if (this.data.individualCategory =='dairyeggs'){
      this.dairyOnly()
    }
    else if (this.data.individualCategory =='fruitsvegs'){
      this.fVOnly()
    }
  },


  switchMap:function(e){
    // set data to the value
      this.setData({
        switchMap : e.detail.value
      })
      if (this.data.individualCategory =='all'){
        this.allData()
      }
      else if (this.data.individualCategory =='meat'){
        this.meatOnly()
      }
      else if (this.data.individualCategory =='aqua'){
        this.aquaOnly()
      }
      else if (this.data.individualCategory =='dairyeggs'){
        this.dairyOnly()
      }
      else if (this.data.individualCategory =='fruitsvegs'){
        this.fVOnly()
      }
    },

  getReg: function(){
    var that = this
    return new Promise ((resolve, reject) => {
      var mct = wx.createMapContext('myMap')
      mct.getRegion({
        success(res){ 
          const neast = res.northeast
          const swest = res.southwest
          console.log(neast)
          that.setData({
            northeast : neast,
            southwest : swest
          })
          if (that.data.switchMap == true){
            if (that.data.individualCategory =='all'){
              that.allData()
            }
            else if (that.data.individualCategory =='meat'){
              that.meatOnly()
            }
            else if (that.data.individualCategory =='aqua'){
              that.aquaOnly()
            }
            else if (that.data.individualCategory =='dairyeggs'){
              that.dairyOnly()
            }
            else if (that.data.individualCategory =='fruitsvegs'){
              that.fVOnly()
            }
          }
          resolve()
        }
      })
    })
  },

  markerToSampleSheet:function(e){
    console.log('markertap', e)
    this.toIndividualData(e.detail.markerId)
  },

  getCanvasReport:function(e){
    var screenwidth = this.data.screenwidth
    var xpos = e.detail.x
    var relPos =  xpos / screenwidth
    console.log(e.touches[0].x, screenwidth)
    if (relPos> 0.5){
      this.toIndividualData('posOnly')
    }
    else if (relPos <= 0.5){
      this.toIndividualData()
    }
  }

})