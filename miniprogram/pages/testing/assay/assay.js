const English = { resetTimers: 'Reset all timers', submitted: 'submitted already' , noPicture: 'no picture', uploadPic: 'Pls upload a picture' , confirm: 'Please confirm', youIndicated: 'You have indicated that the test result is ', uploaded: 'Uploaded!' , jobWellDone: 'Job well done!', ready: 'Ready', ml: ' ml'}

const Chinese = {resetTimers: '重置所有计时', submitted: '已提交',  noPicture: '无图片', uploadPic: '请上传检测结果图' , confirm: '请确认', youIndicated: '你的检测结果是：',  uploaded: '已上传！' , jobWellDone: '干得漂亮！' , ready: '完成', ml: '毫升'}


const app = getApp()
const db = wx.cloud.database({
  env: app.globalData.env
    })

Page({

  /**
   * Page initial data
   */ 
  data: {
    matrix:'',
    submatrix: '',
    subcategory:'',
    subcategory_cn:'',
    class : {},
    swf : 1, 
    qualitative: '', 
    qualitative_en: '',
    qualitative_cn: '', 
    quantitative: '',
    beginTouch : 0, // follow the steps during the protocol, begin touch
    endTouch : 0, // follow the steps during the protocol, end touch
    timer : '', // timers 
    screenwidth : 375,  // iphone 6
    pressPestTimer : 0, // add to pesticide assay
    startASTimer : 0, // add to strip timer started?
    startAVTimer : 0, // add to vial timer started?
    startMBTimer : 0, // mix buffer started??
    startLSTimer_1 : 0,
    startLSTimer_2 : 0,
    addPestTimer : 0,
    IncubatePestTimer : 0,
    blockNames : ['tissueCut', 'mixBuffer', 'letStand_1','letStand_2', 'practice', 'addToStrip', 'pestControl', 'pestSample', 'incubatePest', 'foldPest', 'pressPest', 'readStrip', 'readPest', 'warning', 'vialToVial'] ,
    tissueCut : 0,
    mixBuffer: 0,
    letStand_1: 0, 
    letStand_2: 0, 
    practice : 0, 
    addToStrip : 0, 
    pestControl : 0,
    pestSample : 0,
    incubatePest : 0, 
    foldPest : 0,
    pressPest : 0,
    readStrip : 0, 
    readPest : 0,
    picturelink : false, 
    submitted : 0,
    sample_i : 100,
    control_j : 100,
    warning : 0,
    dehydeCup: 0,
    vialToVial : 0,
    lang:'CN', 
    language: '' //the translation object
  },
 
  reset_timers: function(){
    var that = this
    wx.showModal({
      title: that.data.language.resetTimers,
      success (res) {
        if (res.confirm) {
          console.log('"OK" is tapped')
          console.log('pressed reset')
          clearInterval(that.data.timer)
          that.setData({
            pressPestTimer: 0,
            startASTimer : 0, 
            startMBTimer : 0,
            startLSTimer_1 : 0,
            startLSTimer_2 : 0,
            IncubatePestTimer : 0,
            pressPestTimer : 0,
          })
          that.drawGraphs()
        } else if (res.cancel) {
          console.log('"Cancel" is tapped')
          return false
        }
      }
    })
  },
  

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {
    var language = ''
    this.setData({
      lang: app.globalData.languagePreference
     })
    // here we need to collect all the relavant info
    if (this.data.lang == 'CN'){
      language = Chinese
      wx.setNavigationBarTitle({
        title: '开始检测'
      })
    }
    else if (this.data.lang =='EN'){
      language = English
      wx.setNavigationBarTitle({
        title: 'Start Testing'
      })
    }
    this.setData({
      language: language
     })

    var info = wx.getSystemInfoSync() 
    this.data.screenwidth = info.screenWidth
    if (typeof app.globalData.thistest.measureClass.NoPreview =='undefined'){
      app.globalData.thistest.measureClass.NoPreview = true
    }
    this.setData({
     class : app.globalData.thistest.measureClass,
     matrix:  app.globalData.testmatrix,
     submatrix: app.globalData.testSubmatrix,
     subcategory: app.globalData.thistest.subcategory,
     subcategory_cn: app.globalData.thistest.subcategory_cn
})
    //var test = wx.getLaunchOptionsSync() // not usefull w/o QR
    //console.log(test)
    if (app.globalData.testmatrix == 'meat' ||  app.globalData.testmatrix == 'aqua'  || app.globalData.testmatrix == '肉类' ||  app.globalData.testmatrix == '水产'){
        app.globalData.thistest.measureClass.tissueCut = true
    }
    else{
      app.globalData.thistest.measureClass.tissueCut = false
    }
    
    console.log('class', this.data.class)

    
    var that = this
    //first determine how many blocks we need
    // tissueCut, practice, readStrip and readPest are bool (0/1)
    // get the readPest etc to the back later
    this.data.blockNames.forEach(function(c){
        if (that.data.class[c] > 0 ) {
          that.data[c] = true
        }
      })
      this.setData({  // first prepare wxml
        tissueCut : this.data.tissueCut,
        mixBuffer: this.data.mixBuffer,
        letStand_1: this.data.letStand_1, 
        vialToVial : this.data.vialToVial,
        letStand_2: this.data.letStand_2, 
        practice : this.data.practice,
        addToStrip : this.data.addToStrip,
        pestControl : this.data.pestControl,
        pestSample : this.data.pestSample,
        incubatePest : this.data.incubatePest,
        foldPest: this.data.foldPest,
        pressPest : this.data.pressPest,
        readStrip : this.data.readStrip,
        readPest : this.data.readPest,
        warning : this.data.warning, 
        NoPreview : this.data.NoPreview
      })
      console.log('warning', this.data.warning)
      this.drawGraphs()
    },

    drawGraphs: function(){
       // now draw it
       var that = this
    var swf = this.data.screenwidth / 375 //screenwidth factor
    this.setData({
      swf : swf
    })
      this.data.blockNames.forEach(function(c){
        if (that.data.class[c] > 0 && c != 'warning') {
          console.log('bool', c,that.data[c])
          var timeOrbool = that.data.class[c] 
          console.log('draw', `${c}`)
          that[`draw${c}`](timeOrbool) 
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

  takePicture(){
    var that = this
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['camera'],
      success (res) {
        // tempFilePath can be used as the src property of the img tag to display images.
        const picturelink = res.tempFilePaths.shift()
        wx.compressImage({
          src: picturelink, // Path to the image
          quality: 10, // Compression quality
          success(res){
            console.log('pict', res, res.tempFilePath)
            that.setData({
              picturelink :  res.tempFilePath
            })
            console.log('pl', that.data.picturelink)
          }
        })
      }
    })
  },

  uploadData: function(){
    var that = this
    if (this.data.submitted == 1){
      wx.showToast({
        title: that.data.language.submitted,
        time: 2000
      })
      wx.switchTab({
        url: '/pages/index/index',
        success(res){
          wx.clearStorage() 
        }
      })
      return false
    }
    if (this.data.picturelink == false){
      wx.showModal({
        title: that.data.language.noPicture,
        content: that.data.language.uploadPic,
        showCancel: false,
        success (res) {
          if (res.confirm) {
            return false
          }
        }
      })
    }
    else{
      this.continueSubmit()
    }
  },

  continueSubmit:function(){
    console.log('uploading')
    var that = this

    // test if we have everything
    var uploadObject = app.globalData.thistest
    var thisId = uploadObject._id
    var outQual = this.data.qualitative
    var outQual_en = this.data.qualitative_en
    var outQual_cn = this.data.qualitative_cn
    var qualPest_sample = this.data.sample_i
    var qualPest_control = this.data.control_j
    var outQuant = this.data.quantitative
    var matrix = app.globalData.testmatrix
    var submatrix = app.globalData.testSubmatrix
    var imglink = this.data.picturelink
    var location = app.globalData.sampleLocation
    var address = app.globalData.sampleAddress
    var foodDetails = app.globalData.foodDetails
    var brand = app.globalData.brand
    var seller = app.globalData.seller
    console.log(seller, 'seller')
  
    wx.showModal({
      title: that.data.language.confirm,
      content: [that.data.language.youIndicated, outQual].join(''),
      success (res) {
        if (res.confirm) {
          console.log('"OK" is tapped')
          finalizeUpload()
        } else if (res.cancel) {
          console.log('"Cancel" is tapped')
          return false
        }
      }
    })
    
    function finalizeUpload(){
      //get the picture?
      const now = new Date() 
      const secondsSinceEpoch = Math.round(now.getTime() / 1000)
      var cloudID = [secondsSinceEpoch,app.globalData.openid].join('_')
      //upload the image to teh server and get the link
      wx.cloud.uploadFile({
        cloudPath: ['uploaded_results/', cloudID, '.png'].join(''),
        filePath: imglink, // File path
      }).then(res => {
        // get resource ID
        console.log(res)
        cloudID = res.fileID
        upload()
      }).catch(error => {
        console.error(error)
      })
    

    function upload(){
      const _ = db.command
      var openid = app.globalData.openid
      //mmodify the uploadObject with the data (no picture now)
      uploadObject.tests_remaining -= 1
      uploadObject.tests_done += 1
      
      var testsObj = {
        qualResult_en: outQual_en,
        qualResult_cn: outQual_cn,
        qualResult: outQual,
        qualPest_sample: qualPest_sample,
        qualPest_control: qualPest_control,
        quantResult: outQuant,
        testDate: new Date().toUTCString(),
        testLocation : location,
        matrix: matrix,
        submatrix: submatrix,
        cloudFileId: cloudID,
        foodDetails: foodDetails,
        brand: brand,
        seller: seller,
        address: address
      }
      uploadObject.tests.push(testsObj)

      //now enter into the database
      db.collection('Purchases').doc(thisId).update({
        //Pass the data to be locally updated in "data"
        data: {
          // Indicates to set the done field as true
        tests : uploadObject.tests,
        tests_done: uploadObject.tests_done,
        tests_remaining: uploadObject.tests_remaining
        }
      }).then(
        db.collection('Users').where({
          _openid : openid
        }).update({
          data: {
            credits_collected: _.inc(1)
          }
      })
      ).then(
        that.setData({
          submitted : 1
        }),
        wx.showModal({
          title: that.data.language.uploaded,
          content:  that.data.language.jobWellDone,
          showCancel: false,
          success (res) {
            if (res.confirm) {
              wx.reLaunch({
                url: '/pages/index/index',
              })
            }
          }
        })
      )
      .catch(console.error)
    }
  }
  },


   // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  //This is the tissue cut block
  // The picture is drawn via the functions d

  drawtissueCut: function(time){
    var swf = this.data.swf
    const ctx = wx.createCanvasContext('tissueCut')
    ctx.translate(swf * 50, 0 ) //knive
    ctx.beginPath()
    ctx.moveTo(swf * 100, swf * 50)
    ctx.bezierCurveTo(swf *100, swf *70, swf *180, swf *60, swf *200, swf *50)
    ctx.setLineDash([swf * 1, swf * 1]);
    ctx.setFillStyle('silver')
    ctx.setStrokeStyle('grey')
    ctx.fill()
    ctx.stroke()
   
    ctx.beginPath() //knive holder
    ctx.setLineJoin('round')
    ctx.setFillStyle('grey')
    ctx.rect(swf *50, swf *49, swf *50, swf *8)
    ctx.fill()

    ctx.setLineDash(0);
    ctx.beginPath() //plank
    ctx.setFillStyle('LightSkyBlue')
    ctx.setStrokeStyle('LightSkyBlue')
    ctx.moveTo(swf * 80, swf*80)
    ctx.lineTo(swf *220, swf *80)
    ctx.lineTo(swf *230, swf *100)
    ctx.lineTo(swf *70, swf *100)
    ctx.closePath()
    ctx.fill()
    ctx.beginPath() //plank
    ctx.moveTo(swf *70, swf *110)
    ctx.lineTo(swf *230, swf *110)
    ctx.moveTo(swf * 70, swf *100)
    ctx.lineTo(swf *70, swf *110)
    ctx.moveTo(swf * 230, swf *100)
    ctx.lineTo(swf *230, swf *110)
    ctx.stroke()


    ctx.beginPath() //meat
    ctx.setLineDash();
    ctx.setStrokeStyle('red')
    const grd = ctx.createCircularGradient(swf*140, swf*85, swf * 5)
    grd.addColorStop(0, 'red')
    grd.addColorStop(1, 'white')
    ctx.setFillStyle(grd)
    ctx.arc(swf * 140, swf*85, swf * 5, 0, 2 * Math.PI)
    ctx.stroke()
    ctx.fill()
    ctx.draw()
  },
  //
 // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++



  // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  //This is the mix buffer block
  // The picture is drawn via the functions drawmix and drawtimer and mixbuffercanvas
  // If the canvas is pressed long time, the startMBTimer increases by 1; if
  // this happens for the first time, we activate the timer
  // variables are time (t1), swf (swf /375), the timer, the startMBTimer, 
  //
  startMBTimer : function(e){
    if ((e.target.id == 'mixBuffer' || e.currentTarget.id == 'pressMBButton') && this.data.startMBTimer == 0 && this.data.timer == ''){
      console.log(this.data.startMBTimer)
      var timer = this.data.startMBTimer + 1
      this.setData({
        startMBTimer : timer
      })
      this.drawmixBuffer(this.data.class.mixBuffer, this.data.screenwidth / 375)
    }
  },


  drawmixBuffer: function(time){
    var swf = this.data.swf
    console.log('drawmix')
    clearInterval(this.data.timer)
    this.data.timer = ''
    var that = this
    const ctx = wx.createCanvasContext('mixBuffer')
    console.log('mbcavas', ctx)
    var step = 0
    if (this.data.startMBTimer > 0){
      this.data.timer = setInterval(drawTimer,1000,time)
    }
    else if (this.data.startMBTimer == 0){
      drawTimer(time)
      console.log('mbcavas1', ctx)
    }
    
  function drawTimer(ft){
      that.mixbuffercanvas(ctx, swf, step)
      ctx.translate(swf * 300, swf * 60 ) 
      ctx.beginPath() 
      ctx.setLineDash()  // no dash

      ctx.moveTo(0,0)
      ctx.lineTo(swf * 40,0)
      ctx.setStrokeStyle('red')
      ctx.arc(0, 0, swf * 40, 0, ((2/ft) * step) * Math.PI)
      ctx.closePath()
      ctx.stroke()
      ctx.fill()

      ctx.beginPath()
      ctx.moveTo(0,0)
      ctx.lineTo(10,0)
      ctx.arc(0, 0, swf * 35, 0, 2 * Math.PI)
      ctx.setStrokeStyle('white')
      ctx.setFillStyle('white')
      ctx.closePath()
      ctx.stroke()
      ctx.fill()
    
      ctx.beginPath()
      ctx.setTextAlign('center')
      ctx.setTextBaseline('middle')
      ctx.setFillStyle('red')
      ctx.setFontSize(swf * 40)
      var stepPrint = (ft - step)
      if (that.data.timer == '') {
        ctx.setFontSize(swf * 20)
        stepPrint = ft
      }
      if (step <= (ft - 1) ){
      ctx.fillText(stepPrint, 0, 0)
      }
      else if (step > (ft - 1)){
        ctx.setFillStyle('red')
        ctx.setFontSize(swf * 20)
        ctx.fillText(that.data.language.ready, 0, 0) 
        clearInterval(that.data.timer)
        that.data.timer = ''
        //that.sendmessage('Your mixbuffer step is ready, please prepare for the next step')
        console.log(that.data.timer)
      }
      console.log('mbcavas3', ctx)
      ctx.draw()
      step = step + 1
    }
  },

  mixbuffercanvas:function(ctx, swf, step){
    var that = this
    if (step ==0){
      ctx.translate(swf * 100, swf * 40) // fill
      this.vialContent(ctx, swf)
      this.vialCanvas(ctx, swf)
      ctx.beginPath()
      ctx.moveTo(swf * 15, swf * 34)
      ctx.quadraticCurveTo(swf * 24, swf * 34, swf * 30, swf * 30)
      ctx.lineTo(swf * 40, swf * 30)
      ctx.setFontSize(swf * 18)
      ctx.setTextAlign('left')
      ctx.setTextBaseline('bottom')
      ctx.fillText( ['1.5', that.data.language.ml].join(''), swf * 42, swf * 30)
      ctx.stroke()
      this.arrowcanvas(ctx, swf)
      // add sample
      ctx.translate(swf * -20, 0)
      ctx.beginPath() 
      ctx.setLineDash()
      ctx.setStrokeStyle('red')
      const grd = ctx.createCircularGradient(0, 0, swf * 5)
      grd.addColorStop(0, 'red')
      grd.addColorStop(1, 'white')
      ctx.setFillStyle(grd)
      ctx.arc(0, 0, swf * 5, 0, 2 * Math.PI)
      ctx.stroke()
      ctx.fill()
      ctx.translate(swf * 20, 0)
     
      
      ctx.translate(swf * -100, swf * -40)
    }
    else {
      ctx.translate(swf * 100, swf * 40) //close and shake
      ctx.rotate((320 * (step % 2) + 20) % 360 * Math.PI / 180) 
      this.vialContent(ctx, swf)                                 
      this.vialCanvas(ctx, swf)
      this.vialLid(ctx,swf)
      ctx.rotate((40 * (step % 2) + 340) % 360  * Math.PI / 180)
      ctx.translate(swf * -100, swf * -40) 
    }

    ctx.setFillStyle('red')
  },
    

    
  // End of Mixbuffer block
  // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++



   // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  //This is the let stand block 1
  // The picture is drawn via the functions d
  //





 // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  startLSTimer_1 : function(e){
    if ((e.target.id == 'letStand_1' || e.currentTarget.id == 'pressLSButton_1') && this.data.startLSTimer_1 == 0 && this.data.timer == ''){
      console.log(this.data.startLSTimer_1)
      var timer = this.data.startLSTimer_1 + 1
      this.setData({
        startLSTimer_1 : timer
      })
      this.drawletStand_1(this.data.class.letStand_1, this.data.screenwidth / 375)
    }
  },

  drawletStand_1: function(time){
    var swf = this.data.swf
    clearInterval(this.data.timer)
    this.data.timer = ''
    var that = this
    const ctx = wx.createCanvasContext('letStand_1')
    var step = 0
    if (this.data.startLSTimer_1 > 0){
      this.data.timer = setInterval(drawTimer,1000,time)
    }
    else if (this.data.startLSTimer_1 == 0){
      drawTimer(time)
    }
    
  function drawTimer(ft){
      that.letStand_1canvas(ctx, swf)
      ctx.translate(swf * 300, swf * 60 ) 
      ctx.beginPath() 
      ctx.setLineDash()  // no dash

      ctx.moveTo(0,0)
      ctx.lineTo(swf * 40,0)
      ctx.setStrokeStyle('red')
      ctx.arc(0, 0, swf * 40, 0, ((2/ft) * step) * Math.PI)
      ctx.closePath()
      ctx.stroke()
      ctx.fill()

      ctx.beginPath()
      ctx.moveTo(0,0)
      ctx.lineTo(10,0)
      ctx.arc(0, 0, swf * 35, 0, 2 * Math.PI)
      ctx.setStrokeStyle('white')
      ctx.setFillStyle('white')
      ctx.closePath()
      ctx.stroke()
      ctx.fill()
    
      ctx.beginPath()
      ctx.setTextAlign('center')
      ctx.setTextBaseline('middle')
      ctx.setFillStyle('red')
      ctx.setFontSize(swf * 40)
      var stepPrint = (ft - step)
      if (that.data.timer == '') {
        ctx.setFontSize(swf * 20)
        stepPrint = ft 
      }
      if (step <= (ft - 1) ){
      ctx.fillText(stepPrint, 0, 0)
      }
      else if (step > (ft - 1)){
        ctx.setFillStyle('red')
        ctx.setFontSize(swf * 20)
        ctx.fillText(that.data.language.ready, 0, 0)
        clearInterval(that.data.timer)
        that.data.timer = ''
        console.log(that.data.timer)
      }
      ctx.draw()
      step = step + 1
    }
  },

  letStand_1canvas: function(ctx, swf){
    ctx.translate(swf * 100, swf * 40)
    this.vialContent(ctx,swf)
    this.vialCanvas(ctx, swf)
    this.vialLid(ctx,swf)
    ctx.translate(swf * -100, swf * -40)
    ctx.setFillStyle('red')
  },

  vialCanvas:function(ctx, swf){
    ctx.beginPath()
    ctx.setLineCap('round')
    ctx.setLineWidth(swf * 1)
    ctx.setStrokeStyle('grey')
    ctx.moveTo(0,0) 
    ctx.lineTo(0, swf * 80)
    ctx.bezierCurveTo(0, swf * 90, swf*30, swf* 90, swf * 30, swf * 80)
    ctx.lineTo(swf * 30, 0)
    ctx.stroke()
    
  },

  shortVialCanvas:function(ctx, swf){
    ctx.beginPath()
    ctx.setLineCap('round')
    ctx.setLineWidth(swf * 1)
    ctx.setStrokeStyle('grey')
    ctx.moveTo(0,swf * 40) 
    ctx.lineTo(0, swf * 80)
    ctx.bezierCurveTo(0, swf * 90, swf*30, swf* 90, swf * 30, swf * 80)
    ctx.lineTo(swf * 30, swf * 40)
    ctx.stroke()
    
  },


     // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  //This is the let stand block 1
  // The picture is drawn via the functions d
  //


cupCanvas:function(ctx, swf){

  ctx.setLineWidth(swf * 1)

  // also fill it
  ctx.beginPath()
  ctx.setFillStyle('LightBlue')
  ctx.moveTo(swf * 10, 0)
  ctx.lineTo(swf * 50, 0)
  ctx.quadraticCurveTo(swf * 70, swf * -20, swf * 68 , swf * -35)
  ctx.lineTo(swf * -9, swf * -35)
  ctx.quadraticCurveTo(swf * -10, swf * -20, swf * 10, 0 )
  ctx.fill()

  ctx.beginPath()
  ctx.setLineJoin('round')
  ctx.moveTo(swf * 10, 0)
  ctx.lineTo(swf * 50, 0)
  ctx.bezierCurveTo(swf * 70, swf * -20, swf * 75 , swf * -50, swf * 70, swf * -60)
  ctx.moveTo(swf * -10, swf * -60)
  ctx.bezierCurveTo( swf * -15 , swf * -50, swf * -10, swf * -20, swf * 10, 0 )
  ctx.stroke()



  ctx.setFillStyle("Ivory")
  ctx.beginPath()
  ctx.moveTo(swf * -10, swf * -60)
  ctx.bezierCurveTo(swf * 10, swf * -50, swf * 50, swf * -50, swf * 70, swf * -60)
  ctx.bezierCurveTo(swf * 50, swf * -70, swf * 10, swf * -70, swf * -10, swf * -60)
  ctx.stroke()

},

addTap: function(ctx, swf){
  ctx.scale(0.7, 0.7)
  ctx.beginPath()
  ctx.setFillStyle('LightBlue')
  ctx.moveTo(swf * 40, swf * -35)
  ctx.lineTo(swf * 35, swf * 10)
  ctx.bezierCurveTo(swf * 35, swf * 20, swf * 48, swf * 20, swf * 43, swf * 10)
  ctx.bezierCurveTo(swf * 44, swf * 20, swf * 57, swf * 20, swf * 52, swf * 10)
  ctx.bezierCurveTo(swf * 52, swf * 20, swf * 65, swf * 20, swf * 60, swf * 10)
  ctx.bezierCurveTo(swf * 60, swf * 20, swf * 73, swf * 20, swf * 68, swf * 10)
  ctx.lineTo(swf*60, swf * -35)
  ctx.fill()
  ctx.stroke()
 

 
  ctx.beginPath()
  ctx.setFillStyle('gainsboro')
  ctx.moveTo(0, swf * -100)
  ctx.lineTo(swf * 50, swf * -100)
  ctx.quadraticCurveTo(swf * 60, swf * -100, swf * 60, swf * -90)
  ctx.lineTo(swf * 60, swf * -50)
  ctx.lineTo(swf * 65 , swf * -50)
  ctx.lineTo(swf * 65, -30)
  ctx.lineTo(swf * 35, -30)
  ctx.lineTo(swf * 35, swf * -50)
  ctx.lineTo(swf * 40, swf * -50)
  ctx.lineTo(swf * 40, swf * -70)
  ctx.quadraticCurveTo(swf * 40, swf * -80, swf * 30, swf * -80)
  ctx.lineTo(0, swf * -80)
  ctx.fill()
  ctx.stroke()
  ctx.scale(1/0.7, 1/0.7)
},
 
longarrow:function(ctx,swf){
  ctx.beginPath()
  ctx.setFillStyle('black')
  ctx.setStrokeStyle('black')
 
  ctx.moveTo(0,0)
  ctx.bezierCurveTo(swf *15, swf *-50, swf * 85, swf * -50 , swf * 100, 0)
  ctx.stroke()
  
  ctx.beginPath()
  ctx.moveTo(swf * 100, swf * 10)
  ctx.lineTo(swf * 105, 0)
  ctx.lineTo(swf * 95, 0)
  ctx.closePath()
  ctx.fill()
},


 // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
 startLSTimer_2 : function(e){
  if ((e.target.id == 'letStand_2' || e.currentTarget.id == 'pressLSButton_2') && this.data.startLSTimer_2 == 0 && this.data.timer == ''){
    console.log(this.data.startLSTimer_2)
    var timer = this.data.startLSTimer_2 + 1
    this.setData({
      startLSTimer_2 : timer
    })
    this.drawletStand_2(this.data.class.letStand_2, this.data.screenwidth / 375)
  }
},

drawletStand_2: function(time){
  var swf = this.data.swf
  clearInterval(this.data.timer)
  this.data.timer = ''
  var that = this
  const ctx = wx.createCanvasContext('letStand_2')
  var step = 0
  if (this.data.startLSTimer_2 > 0){
    this.data.timer = setInterval(drawTimer,1000,time)
  }
  else if (this.data.startLSTimer_2 == 0){
    drawTimer(time)
  }
  
function drawTimer(ft){
    that.letStand_2canvas(ctx, swf)
    ctx.translate(swf * 300, swf * 60 ) 
    ctx.beginPath() 
    ctx.setLineDash()  // no dash

    ctx.moveTo(0,0)
    ctx.lineTo(swf * 40,0)
    ctx.setStrokeStyle('red')
    ctx.arc(0, 0, swf * 40, 0, ((2/ft) * step) * Math.PI)
    ctx.closePath()
    ctx.stroke()
    ctx.fill()

    ctx.beginPath()
    ctx.moveTo(0,0)
    ctx.lineTo(10,0)
    ctx.arc(0, 0, swf * 35, 0, 2 * Math.PI)
    ctx.setStrokeStyle('white')
    ctx.setFillStyle('white')
    ctx.closePath()
    ctx.stroke()
    ctx.fill()
  
    ctx.beginPath()
    ctx.setTextAlign('center')
    ctx.setTextBaseline('middle')
    ctx.setFillStyle('red')
    ctx.setFontSize(swf * 40)
    var stepPrint = (ft - step)
    if (that.data.timer == '') {
      ctx.setFontSize(swf * 20)
      stepPrint = ft 
    }
    if (step <= (ft - 1) ){
    ctx.fillText(stepPrint, 0, 0)
    }
    else if (step > (ft - 1)){
      ctx.setFillStyle('red')
      ctx.setFontSize(swf * 20)
      ctx.fillText(that.data.language.ready, 0, 0)
      clearInterval(that.data.timer)
      that.data.timer = ''
      console.log(that.data.timer)
    }
    ctx.draw()
    step = step + 1
  }
},

letStand_2canvas: function(ctx, swf){
  ctx.translate(swf * 100, swf * 40)
  this.shortVialContent(ctx,swf)
  this.shortVialCanvas(ctx, swf)
  ctx.translate(swf * 5, swf * 0)
  this.mixSamplePipet(ctx,swf)
  ctx.translate(swf * -5, swf * 0)
  ctx.translate(swf * -100, swf * -40)
  ctx.setFillStyle('red')
},

vialCanvas:function(ctx, swf){
  ctx.beginPath()
  ctx.setLineCap('round')
  ctx.setLineWidth(swf * 1)
  ctx.setStrokeStyle('grey')
  ctx.moveTo(0,0) 
  ctx.lineTo(0, swf * 80)
  ctx.bezierCurveTo(0, swf * 90, swf*30, swf* 90, swf * 30, swf * 80)
  ctx.lineTo(swf * 30, 0)
  ctx.stroke()
  
},


  vialContent(ctx, swf, color){
    ctx.beginPath()
    ctx.setLineCap('round')
    ctx.setLineWidth(swf * 1)
    if (typeof color == 'undefined'){
      ctx.setFillStyle('LightBlue')
    }
    else{
      ctx.setFillStyle(color)
    }
    ctx.moveTo(0,swf*30) 
    ctx.lineTo(0, swf * 80)
    ctx.bezierCurveTo(0, swf * 90, swf*30, swf* 90, swf * 30, swf * 80)
    ctx.lineTo(swf * 30, swf *30)
    ctx.bezierCurveTo(swf * 30, swf * 35, 0, swf* 35, 0 , swf * 30)
    ctx.fill()
    ctx.setFillStyle('black')
  },

  
  shortVialContent(ctx, swf){
    ctx.beginPath()
    ctx.setLineCap('round')
    ctx.setLineWidth(swf * 1)
    ctx.setFillStyle('#FF0071')
    ctx.moveTo(0,swf*50) 
    ctx.lineTo(0, swf * 80)
    ctx.bezierCurveTo(0, swf * 90, swf*30, swf* 90, swf * 30, swf * 80)
    ctx.lineTo(swf * 30, swf *50)
    ctx.bezierCurveTo(swf * 30, swf * 55, 0, swf* 55, 0 , swf * 50)
    ctx.fill()
    ctx.setFillStyle('black')
  },


  vialLid:function(ctx, swf){
    ctx.beginPath()
    ctx.setLineCap('round')
    ctx.setLineWidth(swf * 1)
    ctx.setLineJoin('round')
    ctx.rect(swf * -3, swf * -5, swf * 36, swf * 5)
    ctx.stroke()
  },


    arrowcanvas: function(ctx, swf){
      ctx.beginPath()
      ctx.setStrokeStyle('black')  
      ctx.moveTo(swf * -20 , swf * -10)
      ctx.bezierCurveTo(swf * -20 , swf * -30, 15, swf * -30, swf * 15, swf * -10)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(swf * 15, swf * 0)
      ctx.lineTo(swf * 20, swf * -10)
      ctx.lineTo(swf * 10, swf * -10)
      ctx.lineTo(swf * 15, swf * 0)
      ctx.closePath()
      ctx.fill()
      ctx.stroke()
    },

  

// end of the let stand block


  // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  //This is the immunochromatography Add to vial block
  // The picture is drawn via the functions drawvial and drawtimer and vialcanvas
  // If the canvas is pressed long time, the startAVTimer increases by 1; if
  // this happens for the first time, we activate the timer
  // variables are time (t2), swf (swf /375), the timer, the startAVTimer, 
  //


  drawvialToVial: function(time){
    var that = this
    const ctx = wx.createCanvasContext('vialToVial')
    var swf = this.data.swf
      ctx.beginPath()
      ctx.translate(swf * 120, swf * 50)
      this.vialContent(ctx,swf)
      this.vialCanvas(ctx,swf)
      ctx.beginPath()
      ctx.moveTo(swf * 15, swf * 34)
      ctx.quadraticCurveTo(swf * 24, swf * 34, swf * 30, swf * 30)
      ctx.lineTo(swf * 40, swf * 30)
      ctx.setFontSize(swf * 18)
      ctx.setTextAlign('left')
      ctx.setTextBaseline('bottom')
      ctx.fillText(['1.0', that.data.language.ml].join(''), swf * 42, swf * 30)
      ctx.stroke()
      ctx.translate(swf * -120, swf * -50)

      ctx.translate(swf * 235, swf * 50)
      this.shortVialCanvas(ctx,swf)
      ctx.translate(swf * -235, swf * -50) 
     
      ctx.translate(swf * 145, swf * 50)
      this.longarrow(ctx,swf)
      ctx.translate(swf * -145, swf * -50)

          // add pipette
     ctx.translate(swf * 228, swf * 28)
     this.addSamplePipet(ctx,swf)
     ctx.translate(swf * -228, swf * -28)

      ctx.translate(swf * 0, swf * 30)
      ctx.translate(swf * -100, swf * -40)
      ctx.draw()
  },
  

  

  // End of add to vial block
  // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

  dropBuffer:function(ctx,swf){
    ctx.translate(swf * -20,swf * -80)
     ctx.scale(0.9,0.9)
    ctx.setLineWidth(swf * 1)
    ctx.setFillStyle('rgb(0,193,0)')
    ctx.beginPath()
    ctx.moveTo(0,0)
    ctx.lineTo(0,swf * 45)
    ctx.quadraticCurveTo(0, swf * 50, swf * 5, swf * 50)
    ctx.lineTo(swf * 20, swf * 50)
    ctx.lineTo(swf * 20, swf * 70)
    ctx.lineTo(swf * 30, swf * 70)
    ctx.lineTo(swf * 32, swf* 80)
    ctx.lineTo(swf * 38, swf * 80)
    ctx.lineTo(swf * 40, swf * 70)
    ctx.lineTo(swf * 50, swf * 70)
    ctx.lineTo(swf * 50, swf * 50)
    ctx.lineTo(swf * 65, swf * 50)
    ctx.quadraticCurveTo(swf * 70, swf * 50, swf * 70, swf * 45)
    ctx.lineTo(swf * 70, 0)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
  
    // and add droplets
    ctx.beginPath()
    ctx.setFillStyle("LightBlue")
    ctx.translate(swf * 35, swf * 80)
    ctx.scale(0.7, 0.7)
    ctx.moveTo(0,0)
    ctx.bezierCurveTo(0, swf * 5, swf * -10, swf * 15, 0, swf * 20)
    ctx.bezierCurveTo(swf * 10, swf * 15, 0, swf * 5, 0, 0)
    ctx.stroke()
    ctx.fill()

    ctx.translate(0, swf * 15)
    ctx.beginPath()
    ctx.moveTo(0,0)
    ctx.bezierCurveTo(0, swf * 5, swf * -10, swf * 15, 0, swf * 20)
    ctx.bezierCurveTo(swf * 10, swf * 15, 0, swf * 5, 0, 0)
    ctx.stroke()
    ctx.fill()
    ctx.translate(0, swf * -15)


    ctx.scale(1/0.7, 1/0.7)
    ctx.translate(swf * -35, swf * -80)
    ctx.translate(swf * 20,swf * 80)
    ctx.scale(1/0.9, 1/0.9)

  },

  // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  //This is the practice add to Strip block
  // The picture is drawn via the functions drawPractice
  // If the canvas is pressed long time, the startASTimer increases by 1; if
  // variables are  swf (swf /375)
  //
  
  drawpractice: function(time){
    var swf = this.data.swf
    clearInterval(this.data.timer)
    const ctx = wx.createCanvasContext('practice')
    ctx.translate(swf * 150, 0)
  
    //draw droplets 
    ctx.setFillStyle("LightBlue")
    
    ctx.translate( swf * 30,swf * 80)
    ctx.translate( 0, swf * -60)
    ctx.rotate(-40 * Math.PI / 180)
  
    ctx.beginPath()
    ctx.moveTo( swf * -60, swf * 7.5)
    ctx.bezierCurveTo(swf * -50, 0, swf * -30, swf * 0, swf * -40, swf * 25)
    ctx.lineTo(swf * 9, swf * 82)
    ctx.quadraticCurveTo(swf * 4, swf *80 , swf * 5, swf * 85)
    ctx.moveTo(swf * 9, swf * 82)
    ctx.quadraticCurveTo(swf * 10, swf * 85 , swf * 5, swf * 85)
    ctx.lineTo(swf * -45, swf * 30)
    ctx.bezierCurveTo(swf * -55, swf * 40, swf * -80, 25, swf * -60, swf * 7.5)
    ctx.fill()
    ctx.stroke()
  
    ctx.rotate(40 * Math.PI / 180)
    ctx.translate( 0, swf * 60)


       // Draw quadratic curve
   ctx.translate( swf * 50, swf * -80)
   ctx.beginPath()
   ctx.setLineWidth(swf * 0.5)
   ctx.moveTo(swf * 9, swf * 90)
   ctx.bezierCurveTo(swf * 2, swf * 100, swf * 16, swf * 100, swf *9, swf *90)
   ctx.stroke()
   ctx.translate( swf*8,swf*8)
   ctx.moveTo(swf * 9, swf * 90)
   ctx.bezierCurveTo(swf * 2, swf * 100, swf * 16, swf * 100, swf *9, swf *90)
   ctx.setStrokeStyle('black')
   ctx.stroke()
   ctx.translate( swf*-8,swf*8)
   ctx.moveTo(swf * 9, swf * 90)
   ctx.bezierCurveTo(swf * 2, swf * 100, swf * 16, swf * 100, swf *9, swf *90)
   ctx.setStrokeStyle('black')
   ctx.stroke()
   ctx.translate( swf*8,swf*-8)
   ctx.translate(swf * -8,swf * -8)
   ctx.translate( swf * -50, swf * 80)
   ctx.translate( swf * -30,swf * -80)
   ctx.translate(swf * -150, 0)
   

  ctx.setFillStyle('white')
  ctx.setLineWidth(swf * 1)
  ctx.draw()
  },
  
  // End of practice addToStrip block 
 // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++




  // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  //This is the immunochromatography Add to Strip block
  // The picture is drawn via the functions drawstrip and drawtimer and stripcanvas
  // If the canvas is pressed long time, the startASTimer increases by 1; if
  // this happens for the first time, we activate the timer
  // variables are time (t3), swf (swf /375), the timer, the ASTimer, 
  //
  startASTimer : function(e){
    if ((e.target.id == 'addToStrip' || e.currentTarget.id == 'pressASButton') && this.data.startASTimer == 0  && this.data.timer == ''){
      console.log('timer', this.data.startASTimer)
      var timer = this.data.startASTimer + 1
      this.setData({
        startASTimer : timer
      })
      this.drawaddToStrip(this.data.class.addToStrip, this.data.screenwidth / 375)
      console.log('timer', this.data.startASTimer)
    }
  },

  drawaddToStrip: function(time){
    var swf = this.data.swf
    clearInterval(this.data.timer)
    this.data.timer = ''
    var that = this
    const ctx = wx.createCanvasContext('addToStrip')
    var step = 0
    if (this.data.startASTimer > 0){
      this.data.timer = setInterval(drawTimer,1000,time)
    }
    else if (this.data.startASTimer == 0){
      drawTimer(time)
    }
    
  function drawTimer(ft){
      that.stripCanvas(ctx, swf)
      ctx.translate(swf * 300, swf * 60 ) 
      ctx.beginPath() 
      ctx.setLineDash()  // no dash

      ctx.moveTo(0,0)
      ctx.lineTo(swf * 40,0)
      ctx.setStrokeStyle('red')
      ctx.arc(0, 0, swf * 40, 0, ((2/ft) * step) * Math.PI)
      ctx.closePath()
      ctx.stroke()
      ctx.fill()

      ctx.beginPath()
      ctx.moveTo(0,0)
      ctx.lineTo(10,0)
      ctx.arc(0, 0, swf * 35, 0, 2 * Math.PI)
      ctx.setStrokeStyle('white')
      ctx.setFillStyle('white')
      ctx.closePath()
      ctx.stroke()
      ctx.fill()
    
      ctx.beginPath()
      ctx.setTextAlign('center')
      ctx.setTextBaseline('middle')
      ctx.setFillStyle('red')
      ctx.setFontSize(swf * 40)
      var stepPrint = (ft - step)
      if (that.data.timer == '') {
        ctx.setFontSize(swf * 20)
        stepPrint = ft
      }
      if (step <= (ft - 1) ){
      ctx.fillText(stepPrint, 0, 0)
      }
      else if (step > (ft - 1)){
        ctx.setFillStyle('red')
        ctx.setFontSize(swf * 20)
        ctx.fillText(that.data.language.ready, 0, 0)
        clearInterval(that.data.timer)
        that.data.timer = ''
      }
      ctx.draw()
      step = step + 1
    }
  },

  stripCanvas:function(ctx, swf){
    ctx.translate(swf * 80, 10)
    var corner1 = swf * 20 
    var corner2 = corner1 +  swf * 40
    var midcircle =  corner1 + swf * 20
    ctx.setFillStyle('lightgrey')
    ctx.fillRect(corner1 - swf * 5, swf * 5, swf * 50, swf * 120)
    ctx.fill()

    ctx.setFillStyle('black')
    ctx.setFontSize(swf * 20) 
    ctx.setLineWidth(swf * 1)
    ctx.beginPath()
    ctx.rect(corner1, swf *10, swf * 40, swf * 80)
    ctx.setFillStyle('white')
    ctx.fill()

    ctx.beginPath()
    ctx.setLineJoin('round')
    ctx.moveTo(corner1, swf *10)
    ctx.lineTo(corner2, swf * 10)
    ctx.lineTo(corner2, swf * 90)
    ctx.lineTo(corner1, swf * 90)
    ctx.closePath()
    ctx.stroke()

    ctx.setLineWidth(swf * 1)
    ctx.beginPath()
    ctx.arc( midcircle, swf *110, swf *6, 0, 2 * Math.PI)
    ctx.setFillStyle('white')
    ctx.fill()
    ctx.stroke()
    ctx.translate( swf * 20,swf * 60)
    this.addSamplePipet(ctx,swf)
    ctx.translate( swf * -20,swf * -60)
    ctx.translate(swf * -80, -10)

  ctx.setFillStyle('white')
  ctx.setLineWidth(swf * 1)
  ctx.setFillStyle('red')
  },

  
  // End of addToStrip block 
 // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++


// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  //This is the colorimetri pestcontrol

  //
  drawpestControl: function(time){
    var swf = this.data.swf
    const ctx = wx.createCanvasContext('pestControl')
    

          // and then draw the part of the chip where we deposit the fluid
     //part 1
     ctx.translate(swf*-125, 0)
     ctx.translate(swf * 250, swf * 10)
     this.drawPestbox(ctx, swf)
     ctx.translate(swf * -250, swf * -10)

    // drop top right
    ctx.translate(swf * 322, swf * 60)
    ctx.beginPath()
    ctx.setFillStyle('LightBlue')
    ctx.moveTo(0 , swf * 0)
    ctx.bezierCurveTo(swf * -20, swf * 0 , swf * -10, swf * -15 , swf * 0, swf * -21)
    ctx.bezierCurveTo(swf * 10, swf * -15 , swf * 20, swf * 0 , swf * 0, swf * 0)
    ctx.fill()
    ctx.stroke()
    ctx.translate(swf * -322, swf * -60)

     // add pipette
     ctx.translate(swf * 307, swf * 0)
     ctx.setLineWidth(swf * 0.5)
     ctx.translate(swf * 25, swf *92)
     ctx.rotate(180 * Math.PI / 180)
     this.dropBuffer(ctx,swf)
     ctx.rotate(180 * Math.PI / 180)
     ctx.translate(swf * -25, swf * -92)
     ctx.translate(swf * -307, 0)
     ctx.translate(swf*125, 0)
 
    ctx.draw()
  },
  

  // End of pestcontrol block
  // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++



// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  //This is the colorimetri cpestSampleblock

  //
  drawpestSample: function(time){
    var swf = this.data.swf
    const ctx = wx.createCanvasContext('pestSample')

    
   // draw a leaf
    ctx.translate(swf * 55, swf * 20)
    this.drawleafs(ctx,swf)
  ctx.translate(swf * -55, swf * -20)

     // and then draw the part of the chip where we deposit the fluid
     //part 1
     ctx.translate(swf * 250, swf * 10)
    this.drawPestbox(ctx, swf)
    ctx.translate(swf * -250, swf * -10)

    //add a drop
    ctx.translate(swf * 270, swf * 110)
    ctx.beginPath()
    ctx.setFillStyle('LightBlue')
    ctx.moveTo(0 , swf * 0)
    ctx.bezierCurveTo(swf * -20, swf * 0 , swf * -10, swf * -15 , swf * 0, swf * -21)
    ctx.bezierCurveTo(swf * 10, swf * -15 , swf * 20, swf * 0 , swf * 0, swf * 0)
    ctx.fill()
    ctx.stroke()
    ctx.translate(swf * -270, swf * -110)

    // aslo topright
    ctx.translate(swf * 322, swf * 60)
    ctx.beginPath()
    ctx.setFillStyle('LightBlue')
    ctx.moveTo(0 , swf * 0)
    ctx.bezierCurveTo(swf * -20, swf * 0 , swf * -10, swf * -15 , swf * 0, swf * -21)
    ctx.bezierCurveTo(swf * 10, swf * -15 , swf * 20, swf * 0 , swf * 0, swf * 0)
    ctx.fill()
    ctx.stroke()
    ctx.translate(swf * -322, swf * -60)


// add 1 arrow

    ctx.beginPath()
    ctx.setLineDash([swf*3, swf * 3], swf * 3)
    ctx.setLineWidth(swf * 1)
    ctx.moveTo(swf * 110, swf * 45)
    ctx.quadraticCurveTo(swf * 200 , swf * 0, swf * 255, swf * 90)
    ctx.stroke()

    ctx.setLineWidth(swf * 0.5)
    ctx.setStrokeStyle('black')
    ctx.setFillStyle('black')
    ctx.setLineDash()
    ctx.beginPath()
    ctx.moveTo(swf * 255, swf * 90)
    ctx.lineTo(swf * 249, swf * 69)
    ctx.lineTo(swf * 238, swf * 79)
    ctx.closePath()
    ctx.fill()

    ctx.setStrokeStyle('black')
    ctx.scale(1/0.7,1/0.7)
    ctx.translate(swf * -165, swf * -25)


    ctx.draw()                                                  
  },
  

  // End of pestSample block
  // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++









  // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  //This is the colorimetric Add to pesticide block

  //
  
  pressIncubatePestTimer: function(e){
    if ((e.target.id == 'incubatePest' || e.currentTarget.id == 'pressIncubatePestButton')  && this.data.IncubatePestTimer == 0 && this.data.timer == ''){
      console.log(this.data.IncubatePestTimer)
      var timer = this.data.IncubatePestTimer + 1
      this.setData({
        IncubatePestTimer : timer
      })
      this.drawincubatePest(this.data.class.incubatePest, this.data.screenwidth / 375)
    }
  },

  drawincubatePest: function(time){
    var swf = this.data.swf
    console.log('pesticide 1')
    clearInterval(this.data.timer)
    this.data.timer = ''
    var that = this
    const ctx = wx.createCanvasContext('incubatePest')
    var step = 0
    if (this.data.IncubatePestTimer > 0){
      this.data.timer = setInterval(drawTimer,1000,time)
    }
    else if (this.data.IncubatePestTimer== 0){
      console.log('pesticede 2')
      drawTimer(time)
    }
    
  function drawTimer(ft){
    console.log('pesticede 2')
      that.incubatePestCanvas(ctx, swf)
      ctx.translate(swf * 300, swf * 60 ) 
      ctx.beginPath() 
      ctx.setLineDash()  // no dash

      ctx.moveTo(0,0)
      ctx.lineTo(swf * 40,0)
      ctx.setStrokeStyle('red')
      ctx.arc(0, 0, swf * 40, 0, ((2/ft) * step) * Math.PI)
      ctx.closePath()
      ctx.stroke()
      ctx.fill()

      ctx.beginPath()
      ctx.moveTo(0,0)
      ctx.lineTo(10,0)
      ctx.arc(0, 0, swf * 35, 0, 2 * Math.PI)
      ctx.setStrokeStyle('white')
      ctx.setFillStyle('white')
      ctx.closePath()
      ctx.stroke()
      ctx.fill()
    
      ctx.beginPath()
      ctx.setTextAlign('center')
      ctx.setTextBaseline('middle')
      ctx.setFillStyle('red')
      ctx.setFontSize(swf * 40)
      var stepPrint = (ft - step)
      if (that.data.timer == '') {
        ctx.setFontSize(swf * 20)
        stepPrint = ft
      }
      if (step <= (ft - 1) ){
      ctx.fillText(stepPrint, 0, 0)
      }
      else if (step > (ft - 1)){
        ctx.setFillStyle('red')
        ctx.setFontSize(swf * 20)
        ctx.fillText(that.data.language.ready, 0, 0)
        clearInterval(that.data.timer)
        that.data.timer = ''
        console.log(that.data.timer)
      }
      ctx.draw()
      step = step + 1
    }
  },

  incubatePestCanvas:function(ctx, swf){
    console.log('reached')
    ctx.translate(swf * 60, 10)
    this.drawPestbox(ctx, swf)
    ctx.translate(swf * -60, -10)

    //reuse the two drops
    ctx.translate(swf * 80, swf * 110)
    ctx.beginPath()
    ctx.setFillStyle('LightBlue')
    ctx.moveTo(0 , swf * 0)
    ctx.bezierCurveTo(swf * -20, swf * 0 , swf * -10, swf * -15 , swf * 0, swf * -21)
    ctx.bezierCurveTo(swf * 10, swf * -15 , swf * 20, swf * 0 , swf * 0, swf * 0)
    ctx.fill()
    ctx.stroke()
    ctx.translate(swf * -80, swf * -110)

    // aslo topright
    ctx.translate(swf * 132, swf * 60)
    ctx.beginPath()
    ctx.setFillStyle('LightBlue')
    ctx.moveTo(0 , swf * 0)
    ctx.bezierCurveTo(swf * -20, swf * 0 , swf * -10, swf * -15 , swf * 0, swf * -21)
    ctx.bezierCurveTo(swf * 10, swf * -15 , swf * 20, swf * 0 , swf * 0, swf * 0)
    ctx.fill()
    ctx.stroke()
    ctx.translate(swf * -132, swf * -60)
    ctx.setFillStyle('red')




  },
  
  

  // End of addPest block
  // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++


  // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  //This is the colorimetric Add to pesticide block

  //
  drawfoldPest: function(time){
    var swf = this.data.swf
    const ctx = wx.createCanvasContext('foldPest')
    ctx.beginPath()
    ctx.translate(swf * 60, 10)
    this.drawPestbox(ctx, swf)
    ctx.translate(swf * -60, -10)
 
        
   // draw an arrow
    ctx.translate(swf * 190, swf * 75)
    ctx.beginPath()
    ctx.setFillStyle('black')
    ctx.moveTo(swf * 0, swf * 0)
    ctx.lineTo(swf * 20, 0)
    ctx.stroke()
    ctx.beginPath()
    ctx.setLineWidth(swf * 0.5)
    ctx.moveTo(swf * 25, 0)
    ctx.lineTo(swf * 15, swf * -5)
    ctx.lineTo(swf * 15, swf * 5)
    ctx.lineTo(swf * 25, swf * 0)
    ctx.fill()
    ctx.stroke()
    ctx.translate(swf * -190, swf * -75)

         //reuse the two drops
         ctx.translate(swf * 80, swf * 110)
         ctx.beginPath()
         ctx.setFillStyle('LightBlue')
         ctx.moveTo(0 , swf * 0)
         ctx.bezierCurveTo(swf * -20, swf * 0 , swf * -10, swf * -15 , swf * 0, swf * -21)
         ctx.bezierCurveTo(swf * 10, swf * -15 , swf * 20, swf * 0 , swf * 0, swf * 0)
         ctx.fill()
         ctx.stroke()
         ctx.translate(swf * -80, swf * -110)
     
         // aslo topright
         ctx.translate(swf * 132, swf * 60)
         ctx.beginPath()
         ctx.setFillStyle('LightBlue')
         ctx.moveTo(0 , swf * 0)
         ctx.bezierCurveTo(swf * -20, swf * 0 , swf * -10, swf * -15 , swf * 0, swf * -21)
         ctx.bezierCurveTo(swf * 10, swf * -15 , swf * 20, swf * 0 , swf * 0, swf * 0)
         ctx.fill()
         ctx.stroke()
         ctx.translate(swf * -132, swf * -60)
         ctx.setFillStyle('red')
     


    // then add a folded version

    // same as above...
    ctx.setGlobalAlpha(0.1)
    ctx.translate(swf * 250, swf * 10)
    this.drawPestbox(ctx, swf)
    //...  untill here

    ctx.beginPath()
    ctx.setGlobalAlpha(1)
    ctx.setFillStyle('white')
    ctx.setLineWidth(swf * 0.5)
    ctx.rect(swf * 47, swf * 5, swf * 50, swf * 60 )
    ctx.fill() 
    ctx.stroke()

  

    ctx.beginPath()
    ctx.rect(swf * -5, swf * 65, swf * 50, swf * 60)
    ctx.fill() 
    ctx.stroke()
  

    // and another arrow
    ctx.beginPath()
    ctx.setLineDash([swf*3, swf * 3], swf * 3)
    ctx.setFillStyle('black')
    ctx.moveTo(swf * 100, swf *  30)
    ctx.quadraticCurveTo(swf * 130, swf * 70, swf * 100, swf * 90)
    ctx.stroke()
    ctx.setLineDash(0)
    ctx.beginPath()
    ctx.moveTo(swf * 96, swf * 30)
    ctx.lineTo(swf * 111, swf * 33)
    ctx.lineTo(swf * 105, swf * 43)
    ctx.lineTo(swf * 96, swf * 30)
    ctx.fill()

    ctx.beginPath()
    ctx.setLineDash([swf*3, swf * 3], swf * 3)
    ctx.setFillStyle('black')
    ctx.moveTo(swf * -8, swf *  30)
    ctx.quadraticCurveTo(swf * -38, swf * 70, swf * -8, swf * 90)
    ctx.stroke()
    ctx.setLineDash(0)    
    ctx.beginPath()
    ctx.moveTo(swf * -4, swf * 90)
    ctx.lineTo(swf * -20, swf * 89)
    ctx.lineTo(swf * -15, swf * 79)
    ctx.lineTo(swf * -4, swf * 90)
    ctx.fill()



      ctx.translate(swf * -250, swf * -10)
    ctx.draw()
  },
  

  // End of foldPest block
  // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++




  addSamplePipet:function(ctx,swf){
    //draw droplets 
    ctx.setFillStyle("LightBlue")
    ctx.setLineWidth(1)
    ctx.scale(0.5 , 0.5)
    ctx.beginPath()
    ctx.moveTo( swf * -60, swf * 7.5)
    ctx.bezierCurveTo(swf * -50, 0, swf * -30, swf * 0, swf * -40, swf * 25)
    ctx.lineTo(swf * 9, swf * 82)
    ctx.quadraticCurveTo(swf * 6, swf *75 , swf * 5, swf * 85)
    ctx.moveTo(swf * 9, swf * 82)
    ctx.quadraticCurveTo(swf * 6, swf * 88 , swf * 5, swf * 85)
    ctx.lineTo(swf * -45, swf * 30)
    ctx.bezierCurveTo(swf * -55, swf * 40, swf * -80, 25, swf * -60, swf * 7.5)
    ctx.fill()
    ctx.stroke()
 

   // Draw quadratic curve
   ctx.beginPath()
   ctx.setLineWidth(swf * 2)
   ctx.moveTo(swf * 9, swf * 90)
   ctx.bezierCurveTo(swf * 2, swf * 100, swf * 16, swf * 100, swf *9, swf *90)
   ctx.stroke()
   
   ctx.translate( swf*8,swf*8)
   ctx.moveTo(swf * 9, swf * 90)
   ctx.bezierCurveTo(swf * 2, swf * 100, swf * 16, swf * 100, swf *9, swf *90)
   ctx.stroke()

   ctx.translate( swf*8,swf*8)
   ctx.moveTo(swf * 9, swf * 90)
   ctx.bezierCurveTo(swf * 2, swf * 100, swf * 16, swf * 100, swf *9, swf *90)
   ctx.stroke()

   ctx.translate(swf * -8,swf * -8)
   ctx.translate(swf * -8,swf * -8)
   ctx.scale(1/0.5, 1/0.5)

},


mixSamplePipet:function(ctx,swf){
  //draw droplets 
  ctx.setFillStyle('#FF0071')
  ctx.setLineWidth(1)
  ctx.scale(0.5 , 0.5)
  ctx.beginPath()
  ctx.moveTo( swf * -60, swf * 7.5)
  ctx.bezierCurveTo(swf * -50, 0, swf * -30, swf * 0, swf * -40, swf * 25)
  ctx.lineTo(swf * 9, swf * 82)
  ctx.quadraticCurveTo(swf * 6, swf *75 , swf * 5, swf * 85)
  ctx.moveTo(swf * 9, swf * 82)
  ctx.quadraticCurveTo(swf * 6, swf * 88 , swf * 5, swf * 85)
  ctx.lineTo(swf * -45, swf * 30)
  ctx.bezierCurveTo(swf * -55, swf * 40, swf * -80, 25, swf * -60, swf * 7.5)
  ctx.fill()
  ctx.stroke()

 ctx.scale(1/0.5, 1/0.5)

},



   // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  //This is the draw pesticide press  block
  // The picture is drawn via the functions d

    pressPestTimer: function(e){
      console.log('e', e)
      if ((e.target.id == 'pressPest' || e.currentTarget.id == 'pressPestButton') && this.data.pressPestTimer == 0 && this.data.timer == ''){
        console.log(this.data.pressPestTimer)
        var timer = this.data.pressPestTimer + 1
        this.setData({
          pressPestTimer : timer
        })
        this.drawpressPest(this.data.class.pressPest, this.data.screenwidth / 375)
      }
    },
  
    drawpressPest: function(time){
      var swf = this.data.swf
      console.log('pesticide')
      clearInterval(this.data.timer)
      this.data.timer = ''
      var that = this
      const ctx = wx.createCanvasContext('pressPest')
      var step = 0
      if (this.data.pressPestTimer > 0){
        this.data.timer = setInterval(drawTimer,1000,time)
      }
      else if (this.data.pressPestTimer == 0){
        drawTimer(time)
      }
      
    function drawTimer(ft){
        that.pestCanvas(ctx, swf)
        ctx.translate(swf * 300, swf * 60 ) 
        ctx.beginPath() 
        ctx.setLineDash()  // no dash
  
        ctx.moveTo(0,0)
        ctx.lineTo(swf * 40,0)
        ctx.setStrokeStyle('red')
        ctx.arc(0, 0, swf * 40, 0, ((2/ft) * step) * Math.PI)
        ctx.closePath()
        ctx.stroke()
        ctx.fill()
  
        ctx.beginPath()
        ctx.moveTo(0,0)
        ctx.lineTo(10,0)
        ctx.arc(0, 0, swf * 35, 0, 2 * Math.PI)
        ctx.setStrokeStyle('white')
        ctx.setFillStyle('white')
        ctx.closePath()
        ctx.stroke()
        ctx.fill()
      
        ctx.beginPath()
        ctx.setTextAlign('center')
        ctx.setTextBaseline('middle')
        ctx.setFillStyle('red')
        ctx.setFontSize(swf * 40)
        var stepPrint = (ft - step)
        if (that.data.timer == '') {
          ctx.setFontSize(swf * 20)
          stepPrint = ft
        }
        if (step <= (ft - 1) ){
        ctx.fillText(stepPrint, 0, 0)
        }
        else if (step > (ft - 1)){
          ctx.setFillStyle('red')
          ctx.setFontSize(swf * 20)
          ctx.fillText(that.data.language.ready, 0, 0)
          clearInterval(that.data.timer)
          that.data.timer = ''
          console.log(that.data.timer)
        }
        ctx.draw()
        step = step + 1
      }
    },
  
    pestCanvas:function(ctx, swf){
      console.log('reached')
      ctx.translate(swf * 120, swf * 90)
      stripFinger()
      ctx.translate(swf * -120, swf * -90)


      function stripFinger(){
        lowerFinger()
        ctx.beginPath() // patch
        //ctx.scale(1.2)
        ctx.setFillStyle('FloralWhite')
        ctx.beginPath()
        ctx.moveTo(0, 0)
        ctx.lineTo(swf * 63, swf * 4)
        ctx.lineTo(swf * 84, swf * -25)
        ctx.lineTo(swf * 80, swf * -25)
        ctx.fill()
        ctx.stroke()

        ctx.beginPath()
        ctx.moveTo(0, 0)
        ctx.setFillStyle('Ivory')
        ctx.lineTo(swf* 60, swf * 0)
        ctx.lineTo(swf* 84, swf * -27)
        ctx.lineTo(swf * 45, swf * -27)
        ctx.lineTo(0, swf * 0)
        ctx.fill()
        ctx.stroke()
        //ctx.scale (1/1.2)

        ctx.translate(swf * -10, swf * -5)
        upperFinger()
        ctx.translate(swf * 10, swf * 5)


        function lowerFinger(){
          ctx.setLineWidth(2)
          ctx.translate(0, swf * -3)
          ctx.beginPath() // lower finger
          ctx.moveTo(swf * -10, swf * 30)
          ctx.setFillStyle('BurlyWood')
          ctx.quadraticCurveTo(swf * 45, swf * 30, swf * 52, swf * 9)
          ctx.quadraticCurveTo(swf * 37.5, 0, swf * 22.6, swf * 7.5)
          ctx.quadraticCurveTo(swf * 15, swf * 10, swf * 0, swf * 9)
          ctx.fill()
          ctx.stroke()

          ctx.beginPath()
          ctx.setFillStyle('Crimson')
          ctx.moveTo(swf * 30, swf * 27)
          ctx.quadraticCurveTo(swf * 40, swf * 15, swf * 53, swf * 9)
          ctx.quadraticCurveTo(swf * 47, swf * 25, swf * 30, swf * 27)
          ctx.fill()
          ctx.stroke()
          ctx.translate(0, swf * 3)
        }

        function upperFinger(){
          ctx.beginPath() // upper finger
          ctx.moveTo(swf * 15, swf * -27)
          ctx.setFillStyle('BurlyWood')
          ctx.quadraticCurveTo(swf * 30, swf * -30, swf * 45, swf * -7.5)
          ctx.quadraticCurveTo(swf * 52.5, swf * 0, swf * 60, swf * -7.5)
          ctx.quadraticCurveTo(swf * 47, swf * -45, swf * 22.5, swf * -42)
          ctx.fill()
          ctx.stroke()

          ctx.beginPath()
          ctx.setFillStyle('Crimson')
          ctx.moveTo(swf * 60, swf * -7.5)
          ctx.quadraticCurveTo(swf * 45, swf * -15, swf * 52, swf * -25)
          ctx.fill()
          ctx.stroke()
        }
      }
      ctx.setFillStyle('red')
  
  

    },
    
  
  //
 // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++





   // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  //This is the readPest block
  drawreadPest : function(time){
    var swf = this.data.swf
    const ctx = wx.createCanvasContext('readPest')
    // set the colors

    ctx.translate(swf * 150, 0)
    this.drawPestbox(ctx, swf)
  
   var validity = this.data.class  // should be dynamic
   var sample_i = this.data.sample_i
   var control_j = this.data.control_j
    console.log(validity)
    var validStatement = '';
    var validStatement_en = '';
    var validStatement_cn = '';
    if (this.data.lang == 'EN'){
      if (control_j >= (validity.switchPoint - 10)){ //first check the control
        validStatement = validity.undecided
        validStatement_en = validity.undecided
        validStatement_cn = validity.undecided_cn
      }
      else if (sample_i >=  validity.switchPoint && control_j < (validity.switchPoint - 10)){
        validStatement = validity.end
        validStatement_en = validity.end
        validStatement_cn = validity.end_cn
      }
      else if (sample_i >= (control_j + 30)){
        validStatement = validity.end
        validStatement_en = validity.end 
        validStatement_cn = validity.end_cn  
      }
      else if (control_j >= (sample_i + 30)){
        validStatement = validity.undecided
        validStatement_en = validity.undecided
        validStatement_cn = validity.undecided_cn
      }
      else {
        validStatement = validity.start
        validStatement_en = validity.start
        validStatement_cn = validity.start_cn
      }
    }
    else if (this.data.lang == 'CN'){
      if (control_j >= (validity.switchPoint - 10)){ //first check the control
        validStatement = validity.undecided_cn
        validStatement_en = validity.undecided
        validStatement_cn = validity.undecided_cn
      }
      else if (sample_i >=  validity.switchPoint && control_j < (validity.switchPoint - 10)){
        validStatement = validity.end_cn
        validStatement_en = validity.end
        validStatement_cn = validity.end_cn
      }
      else if (sample_i >= (control_j + 30)){
        validStatement = validity.end_cn
        validStatement_en = validity.end
        validStatement_cn = validity.end_cn
      }
      else if (control_j >= (sample_i + 30)){
        validStatement = validity.undecided_cn
        validStatement_en = validity.undecided
        validStatement_cn = validity.undecided_cn
      }
      else {
        validStatement = validity.start_cn
        validStatement_en = validity.start
        validStatement_cn = validity.start_cn
      }
    }

    this.setData({
      qualitative : validStatement,
      qualitative_en : validStatement_en,
      qualitative_cn: validStatement_cn
    })
       
    ctx.setFillStyle('black')
    ctx.setFontSize(20)
    ctx.fillText(validStatement, swf * 15, swf * 145)
    ctx.draw()

  },
  
ControlReadPest: function(e){
  this.setData({
    control_j : e.detail.value
  })
  this.drawreadPest(1)
},

SampleReadPest: function(e){
  console.log('s', e.detail.value)
  this.setData({
    sample_i : e.detail.value
  })
  this.drawreadPest(1)
},
  

   // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  //This is the readstrip block

  drawreadStrip: function(e){  // check the input!!
    if (e == 1 ){
      e = {detail:{value:50}}
    } 
    var swf = this.data.screenwidth / 375 
    var i =  (e.detail.value * (6/5)) / 20
    var i_ori = e.detail.value
    const ctx = wx.createCanvasContext('readStrip')
    var corner1 = swf * (20 + (i * 42))
    var corner2 = corner1 + swf * 40 
    var midcircle = corner1 + swf * 20
    var validity = this.data.class
    var validStatement = ''
    var validStatement_en = '';
    var validStatement_cn = '';
    console.log('v', validity.switchPoint)
    if (this.data.lang == 'EN'){
      if (i_ori < validity.switchPoint){
        validStatement = validity.start
        validStatement_en = validity.start
        validStatement_cn = validity.start_cn
      }
      if (i_ori >= validity.switchPoint){
        validStatement = validity.end
        validStatement_en = validity.end
        validStatement_cn = validity.end_cn
      }
      if  (i_ori >= validity.unvalidStart){
        validStatement = validity.undecided
        validStatement_en = validity.undecided
        validStatement_cn = validity.undecided_cn
      }
    }
    else if (this.data.lang == 'CN'){
      if (i_ori < validity.switchPoint){
        validStatement = validity.start_cn
        validStatement_en = validity.start
        validStatement_cn = validity.start_cn
      }
      if (i_ori >= validity.switchPoint){
        validStatement = validity.end_cn
        validStatement_en = validity.end
        validStatement_cn = validity.end_cn
      }
      if  (i_ori >= validity.unvalidStart){
        validStatement = validity.undecided_cn
        validStatement_en = validity.undecided
        validStatement_cn = validity.undecided_cn
      }
    }
     // return the result
     this.setData({
      qualitative : validStatement,
      quantitative : i_ori,
      qualitative_en : validStatement_en,
      qualitative_cn: validStatement_cn
    })


    //first create a box
    ctx.setFillStyle('lightgrey')
    ctx.fillRect(corner1 - swf * 5, swf * 5, swf * 50, swf * 120)
    ctx.fill()

    ctx.setFillStyle('black')
    ctx.setFontSize(20)
    ctx.fillText('C', corner1- swf * -50, swf * 40)
    ctx.fillText('T', corner1- swf * -50, swf * 80)
    ctx.fillText(validStatement, corner1+ swf * 15, swf * 145)

    ctx.setLineWidth(2)
    ctx.beginPath()
    ctx.rect(corner1, swf * 10, swf * 40, swf * 80)
    ctx.setFillStyle('white')
    ctx.fill()

    ctx.beginPath()
    ctx.setLineJoin('round')
    ctx.moveTo(corner1, swf * 10)
    ctx.lineTo(corner2, swf * 10)
    ctx.lineTo(corner2, swf * 90)
    ctx.lineTo(corner1, swf * 90)
    ctx.closePath()
    ctx.stroke()

    ctx.setLineWidth(2)
    ctx.beginPath()
    ctx.arc(midcircle, swf * 110, swf * 6, 0, 2 * Math.PI)
    ctx.setFillStyle('white')
    ctx.fill()
    ctx.stroke()

    if ((5.5 - i) > 0){
      ctx.setLineCap('round')
      ctx.beginPath()
      ctx.moveTo(corner1+swf * 5, swf * 30)
      ctx.setLineWidth(swf * 5.5  - swf * i )
      ctx.lineTo(corner1+swf * 35, swf * 30)
      ctx.stroke()
    }
    if (i > 1 && i < 5.8){
      ctx.beginPath()
      ctx.beginPath()
      ctx.moveTo(corner1+swf * 5, swf * 70)
      ctx.setLineWidth(swf * (i / 5) * swf * 5.5)
      ctx.lineTo(corner1+swf * 35, swf * 70)
      ctx.stroke()
    }
    ctx.draw()
  },


   // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  //This is the readstrip block


 drawPestbox: function(ctx,swf){
  ctx.beginPath()
  // draw the strip
  var corner1 = 0
  var midcircle = corner1 + swf * 20
  var sample_i = this.data.sample_i
  var control_j = this.data.control_j
  var sampleBlue =   ['rgb(',   parseInt(50+ (sample_i*2.55)) ,  ',' , parseInt(50+ (sample_i*2.55))  , ',' , '255)' ].join('')
  var controlBlue =   ['rgb(',   parseInt(50+ (control_j*2.55)) ,  ',' , parseInt(50+ (control_j*2.55))  , ',' , '255)' ].join('')

  //first create a box
  ctx.setFillStyle('white')
  ctx.setStrokeStyle('black')
  ctx.setLineWidth(swf * 0.5)
  //ctx.fillRect(corner1 - swf * 5, swf * 5, swf * 50, swf * 120)
  ctx.rect(corner1 - swf * 5, swf * 5, swf * 50, swf * 120)
  ctx.fill() 
  ctx.stroke()

  ctx.beginPath()
  ctx.setFillStyle(sampleBlue)
  ctx.arc(midcircle, swf * 90, swf * 15, 0, 2 * Math.PI)
  ctx.fill() 
  ctx.stroke()

  ctx.beginPath()
  ctx.setFillStyle('red')
  ctx.arc(midcircle, swf * 40, swf * 15, 0, 2 * Math.PI)
  ctx.fill() 
  ctx.stroke()

 //also a dahsed line
 ctx.beginPath()
 ctx.moveTo(corner1 - swf * 5, swf * 65)
 ctx.setLineDash([swf*10, swf*5])
 ctx.lineTo(swf*corner1 + swf * 45, swf * 65)
 ctx.stroke()
 ctx.setLineDash(0)

 // ctx.translate(swf * -250, swf * -10)
   
 //part 2
  ctx.translate(swf * 52, 0)
  ctx.beginPath()
  // draw the strip
  var corner1 = 0
  var midcircle = corner1 + swf * 20

  //first create a box
  ctx.setFillStyle('white')
  ctx.setStrokeStyle('black')
  ctx.setLineWidth(swf * 0.5)
  //ctx.fillRect(corner1 - swf * 5, swf * 5, swf * 50, swf * 120)
  ctx.moveTo(corner1 - swf * 5, swf * 5)
  ctx.lineTo(corner1 - swf * 5 + swf * 40, swf * 5)
  ctx.lineTo(corner1 - swf * 5 + swf * 50 , swf * 15)
  ctx.lineTo(corner1 - swf * 5 + swf * 50, swf * 125)
  ctx.lineTo(corner1 - swf * 5, swf * 125)
  ctx.lineTo(corner1 - swf * 5, swf * 5)
  ctx.fill() 
  ctx.stroke()

  ctx.beginPath()
  ctx.setFillStyle('red')
  ctx.arc(midcircle, swf * 90, swf * 15, 0, 2 * Math.PI)
  ctx.fill() 
  ctx.stroke()

  ctx.beginPath()
  ctx.setFillStyle(controlBlue)
  ctx.arc(midcircle, swf * 40, swf * 15, 0, 2 * Math.PI)
  ctx.fill() 
  ctx.stroke()


   //also a dahsed line
   ctx.beginPath()
   ctx.moveTo(corner1 - swf * 5, swf * 65)
   ctx.setLineDash([swf*10, swf*5])
   ctx.lineTo(swf*corner1 + swf * 45, swf * 65)
   ctx.stroke()
   ctx.setLineDash(0)

   ctx.translate(swf * -52, 0)

  },

  goBack:function(){
    wx.redirectTo({
      url: '/pages/basket/orderTest/testDescription/testDescription',
    })
  },

  drawleafs:function(ctx,swf){

  ctx.beginPath();
	ctx.lineJoin = 'miter';
	ctx.strokeStyle = 'rgb(0, 0, 0)';
	ctx.lineCap = 'butt';
  ctx.lineWidth = 1.000000;
  ctx.scale(swf,swf)
	ctx.moveTo(85.868746, 84.888599);
	ctx.bezierCurveTo(88.887596, 79.241099, 94.394176, 75.627219, 100.093640, 73.136549);
	ctx.bezierCurveTo(107.132620, 69.034679, 102.095530, 61.775429, 101.695190, 55.967939);
	ctx.bezierCurveTo(102.300290, 49.589159, 107.125890, 43.536829, 102.248900, 37.428809);
	ctx.bezierCurveTo(99.258176, 31.639359, 91.230906, 30.964179, 89.121066, 24.419299);
	ctx.bezierCurveTo(87.622436, 18.788148, 84.761156, 12.570534, 78.272176, 11.548011);
	ctx.bezierCurveTo(73.141576, 10.217077, 72.496916, 3.314390, 65.103536, 4.629185);
	ctx.bezierCurveTo(61.160776, 5.330341, 56.452446, -4.017604, 54.534366, 3.347992);
	ctx.bezierCurveTo(50.623686, 10.130383, 46.361706, 17.780410, 38.600566, 20.632759);
	ctx.bezierCurveTo(32.711206, 24.819659, 40.146906, 34.851619, 32.751906, 37.346639);
	ctx.bezierCurveTo(26.216836, 40.187679, 20.988236, 33.701479, 14.710990, 34.207439);
	ctx.bezierCurveTo(8.693308, 34.763589, 5.135143, 40.826449, 5.737811, 46.494719);
	ctx.bezierCurveTo(5.640661, 51.787339, 7.095603, 57.809959, 3.181775, 62.174889);
	ctx.bezierCurveTo(-2.194950, 66.674939, 1.326010, 72.511369, 6.338612, 75.112349);
	ctx.bezierCurveTo(10.318623, 77.948329, 15.145816, 79.872709, 20.097046, 79.605849);
	ctx.bezierCurveTo(27.768946, 81.614229, 30.275406, 89.787889, 32.029666, 96.445179);
	ctx.bezierCurveTo(36.720836, 102.690520, 43.540336, 97.101379, 48.699646, 95.800919);
	ctx.bezierCurveTo(53.450766, 97.435139, 55.026086, 105.130230, 61.195976, 101.691030);
	ctx.bezierCurveTo(68.673746, 97.615679, 75.988756, 103.684940, 79.864586, 107.678490);
	ctx.bezierCurveTo(81.802496, 109.675270, 83.338586, 111.117800, 85.002066, 111.520470);
	ctx.bezierCurveTo(85.833796, 111.721810, 86.697386, 111.663180, 87.026946, 111.178550);
	ctx.bezierCurveTo(87.356506, 110.693930, 87.152056, 109.783300, 85.847716, 108.280640);
	ctx.bezierCurveTo(80.630366, 102.270000, 82.996516, 96.075929, 83.986446, 90.219519);
	ctx.bezierCurveTo(84.449296, 88.390079, 85.077496, 86.601989, 85.868746, 84.888599);
	ctx.stroke();
	
// #path3343
	ctx.beginPath();
	ctx.lineJoin = 'miter';
	ctx.strokeStyle = 'rgb(0, 0, 0)';
	ctx.lineCap = 'butt';
	ctx.lineWidth = 1.000000;
	ctx.moveTo(80.180616, 103.849020);
	ctx.bezierCurveTo(66.941176, 88.622969, 55.548716, 72.430009, 40.774776, 58.564569);
	ctx.bezierCurveTo(37.588136, 55.197229, 34.241696, 51.863789, 30.024866, 49.803589);
	ctx.bezierCurveTo(27.929906, 48.534359, 25.929666, 47.117919, 23.931366, 45.703729);
	ctx.stroke();
	
// #path3345
	ctx.beginPath();
	ctx.lineJoin = 'miter';
	ctx.strokeStyle = 'rgb(0, 0, 0)';
	ctx.lineCap = 'butt';
	ctx.lineWidth = 1.000000;
	ctx.moveTo(78.495246, 63.400119);
	ctx.bezierCurveTo(78.183556, 59.585709, 78.760916, 55.599599, 77.285326, 51.962779);
	ctx.bezierCurveTo(74.445496, 41.493829, 70.641896, 26.375029, 66.276306, 16.420399);
	ctx.stroke();
	
// #path3347
	ctx.beginPath();
	ctx.lineJoin = 'miter';
	ctx.strokeStyle = 'rgb(0, 0, 0)';
	ctx.lineCap = 'butt';
	ctx.lineWidth = 1.000000;
	ctx.moveTo(83.340686, 94.158139);
	ctx.bezierCurveTo(83.291286, 89.153629, 81.233986, 82.708209, 81.233986, 79.832489);
	ctx.stroke();
	
// #path3349
	ctx.beginPath();
	ctx.lineJoin = 'miter';
	ctx.strokeStyle = 'rgb(0, 0, 0)';
	ctx.lineCap = 'butt';
	ctx.lineWidth = 0.918881;
	ctx.moveTo(83.720676, 68.254029);
	ctx.bezierCurveTo(84.661066, 62.792309, 88.575926, 54.071049, 89.483366, 52.842259);
	ctx.stroke();
	
// #path3351
	ctx.beginPath();
	ctx.lineJoin = 'miter';
	ctx.strokeStyle = 'rgb(0, 0, 0)';
	ctx.lineCap = 'butt';
	ctx.lineWidth = 1.000000;
	ctx.moveTo(74.913836, 43.175669);
	ctx.bezierCurveTo(74.849336, 39.031569, 78.832096, 29.819259, 81.233976, 28.217999);
	ctx.stroke();
	
// #path3353
	ctx.beginPath();
	ctx.lineJoin = 'miter';
	ctx.strokeStyle = 'rgb(0, 0, 0)';
	ctx.lineCap = 'butt';
	ctx.lineWidth = 1.000000;
	ctx.moveTo(75.335176, 43.597019);
	ctx.bezierCurveTo(72.300256, 39.314319, 66.459516, 32.825309, 63.116236, 29.482029);
	ctx.bezierCurveTo(62.088066, 28.453859, 59.442286, 27.493439, 58.902816, 26.953969);
	ctx.stroke();
	
// #path3355
	ctx.beginPath();
	ctx.lineJoin = 'miter';
	ctx.strokeStyle = 'rgb(0, 0, 0)';
	ctx.lineCap = 'butt';
	ctx.lineWidth = 1.000000;
	ctx.moveTo(65.854966, 86.995319);
	ctx.bezierCurveTo(67.761176, 74.199269, 61.430866, 66.199119, 61.430866, 60.661389);
	ctx.stroke();
	
// #path3357
	ctx.beginPath();
	ctx.lineJoin = 'miter';
	ctx.strokeStyle = 'rgb(0, 0, 0)';
	ctx.lineCap = 'butt';
	ctx.lineWidth = 1.000000;
	ctx.moveTo(44.998496, 62.557439);
	ctx.bezierCurveTo(46.199946, 55.794239, 41.629436, 46.553129, 40.995746, 44.018349);
	ctx.stroke();
	
// #path3359
	ctx.beginPath();
	ctx.lineJoin = 'miter';
	ctx.strokeStyle = 'rgb(0, 0, 0)';
	ctx.lineCap = 'butt';
	ctx.lineWidth = 1.000000;
	ctx.moveTo(49.001256, 66.560199);
	ctx.bezierCurveTo(47.389356, 68.061379, 35.646256, 64.626519, 23.088676, 61.082739);
	ctx.stroke();
	
// #path3361
	ctx.beginPath();
	ctx.lineJoin = 'miter';
	ctx.strokeStyle = 'rgb(0, 0, 0)';
	ctx.lineCap = 'butt';
	ctx.lineWidth = 1.000000;
	ctx.moveTo(66.065646, 87.627329);
	ctx.bezierCurveTo(65.377386, 87.513789, 63.797516, 86.322949, 63.116236, 86.152629);
	ctx.bezierCurveTo(57.455326, 84.737399, 51.850376, 83.399579, 46.051856, 82.571219);
	ctx.bezierCurveTo(43.443556, 82.198599, 39.891406, 82.505819, 37.625006, 81.939199);
	ctx.stroke();
	
// #path3363
	ctx.beginPath();
	ctx.lineJoin = 'miter';
	ctx.strokeStyle = 'rgb(0, 0, 0)';
	ctx.lineCap = 'butt';
	ctx.lineWidth = 1.000000;
	ctx.moveTo(82.498006, 99.424929);
	ctx.bezierCurveTo(82.490006, 95.934889, 82.240886, 94.135319, 81.558246, 90.714239);
	ctx.bezierCurveTo(80.887636, 87.527399, 80.019536, 84.217869, 81.047126, 80.997179);
	ctx.bezierCurveTo(81.884976, 77.649239, 84.136256, 74.786249, 84.739536, 71.386379);
	ctx.bezierCurveTo(84.642836, 67.041039, 80.226916, 64.775419, 76.941866, 62.855949);
	ctx.bezierCurveTo(73.360816, 61.158479, 71.291676, 57.576099, 70.650606, 53.780899);
	ctx.bezierCurveTo(70.110926, 50.038349, 68.268766, 46.364249, 64.788426, 44.574149);
	ctx.bezierCurveTo(59.891196, 41.797469, 54.031796, 41.705299, 48.573086, 42.098219);
	ctx.bezierCurveTo(46.396146, 41.123049, 44.257056, 36.800019, 41.596206, 36.088539);
	ctx.bezierCurveTo(39.216466, 34.890229, 36.272326, 37.009149, 33.622246, 36.960859);
	ctx.stroke();
	
// #path4220
	ctx.beginPath();
	ctx.lineJoin = 'miter';
	ctx.lineCap = 'butt';
	ctx.lineWidth = 2.300000;
	ctx.fillStyle = 'rgb(0, 184, 0)';
	ctx.miterLimit = 4;
	ctx.globalAlpha = 1.0;
	ctx.fill();
	
// #path4237
	ctx.beginPath();
	ctx.lineJoin = 'miter';
	ctx.lineCap = 'butt';
	ctx.lineWidth = 2.300000;
	ctx.fillStyle = 'rgb(0, 193, 0)';
	ctx.miterLimit = 4;
	ctx.globalAlpha = 1.0;
	ctx.moveTo(82.678486, 85.192999);
	ctx.bezierCurveTo(82.242566, 82.915739, 81.887056, 80.837829, 81.888466, 80.575409);
	ctx.bezierCurveTo(81.889466, 80.312989, 82.468426, 78.809799, 83.174106, 77.234979);
	ctx.bezierCurveTo(85.450346, 72.155299, 85.617636, 71.309359, 84.804016, 68.992729);
	ctx.lineTo(84.341986, 67.677169);
	ctx.lineTo(84.921646, 65.621989);
	ctx.bezierCurveTo(85.722846, 62.781329, 87.402196, 58.344829, 88.768446, 55.459499);
	ctx.bezierCurveTo(89.814086, 53.251249, 89.882946, 53.017639, 89.558216, 52.780189);
	ctx.bezierCurveTo(89.362556, 52.637109, 89.108596, 52.578069, 88.993866, 52.648979);
	ctx.bezierCurveTo(88.400386, 53.015769, 85.312846, 60.428319, 84.183026, 64.198819);
	ctx.bezierCurveTo(83.801106, 65.473379, 83.462916, 66.553769, 83.431496, 66.599669);
	ctx.bezierCurveTo(83.400096, 66.645569, 82.957136, 66.298569, 82.447206, 65.828529);
	ctx.bezierCurveTo(81.937276, 65.358479, 80.991526, 64.622979, 80.345556, 64.194079);
	ctx.bezierCurveTo(78.964126, 63.276869, 79.008376, 63.452629, 78.861806, 58.300019);
	ctx.bezierCurveTo(78.789806, 55.769559, 78.656956, 54.535389, 78.328806, 53.349239);
	ctx.bezierCurveTo(75.661136, 43.706529, 75.629886, 43.573529, 75.680646, 42.078319);
	ctx.bezierCurveTo(75.788206, 38.910199, 78.727426, 31.812849, 80.951246, 29.351339);
	ctx.bezierCurveTo(81.621946, 28.608949, 81.633796, 28.565509, 81.289806, 28.109489);
	ctx.lineTo(80.933356, 27.636929);
	ctx.lineTo(80.181216, 28.432149);
	ctx.bezierCurveTo(78.281846, 30.440309, 76.892446, 33.333759, 74.791846, 39.655599);
	ctx.bezierCurveTo(74.734146, 39.829409, 74.087946, 37.885959, 73.355946, 35.336839);
	ctx.bezierCurveTo(72.623956, 32.787719, 71.437906, 28.900829, 70.720276, 26.699309);
	ctx.bezierCurveTo(69.396116, 22.637079, 67.028876, 16.354968, 66.759586, 16.188537);
	ctx.bezierCurveTo(66.678486, 16.138397, 66.409166, 16.207557, 66.161156, 16.342230);
	ctx.bezierCurveTo(65.711606, 16.586344, 65.713106, 16.594113, 66.656376, 18.904471);
	ctx.bezierCurveTo(68.479916, 23.370889, 73.509976, 39.258699, 73.198966, 39.569709);
	ctx.bezierCurveTo(73.144966, 39.623709, 72.318936, 38.740799, 71.363346, 37.607699);
	ctx.bezierCurveTo(70.407756, 36.474599, 68.254566, 34.056919, 66.578476, 32.235089);
	ctx.bezierCurveTo(63.558746, 28.952799, 62.627996, 28.195229, 60.137096, 26.992259);
	ctx.bezierCurveTo(59.215706, 26.547279, 59.106766, 26.535459, 58.795466, 26.846749);
	ctx.bezierCurveTo(58.327376, 27.314839, 58.534236, 27.547959, 60.154896, 28.378779);
	ctx.bezierCurveTo(60.928396, 28.775309, 61.817776, 29.274549, 62.131296, 29.488199);
	ctx.bezierCurveTo(63.294686, 30.281009, 70.703196, 38.510709, 73.307626, 41.903349);
	ctx.bezierCurveTo(74.253376, 43.135329, 74.372506, 43.448309, 75.592956, 47.907489);
	ctx.bezierCurveTo(76.301116, 50.494909, 77.018356, 53.085899, 77.186816, 53.665249);
	ctx.bezierCurveTo(77.458866, 54.600809, 78.009516, 62.357109, 77.817526, 62.549099);
	ctx.bezierCurveTo(77.610086, 62.756539, 75.536266, 61.341159, 74.482766, 60.273129);
	ctx.bezierCurveTo(73.082306, 58.853359, 71.930346, 56.664059, 71.449246, 54.507939);
	ctx.bezierCurveTo(70.443086, 49.998639, 69.708966, 48.239969, 68.073536, 46.420979);
	ctx.bezierCurveTo(66.224196, 44.364059, 63.122556, 42.784059, 59.243866, 41.923079);
	ctx.bezierCurveTo(57.733006, 41.587699, 56.449076, 41.493039, 52.923726, 41.457119);
	ctx.lineTo(48.499626, 41.412019);
	ctx.lineTo(45.866236, 38.752589);
	ctx.bezierCurveTo(42.880216, 35.737039, 42.027566, 35.231479, 39.927716, 35.231479);
	ctx.bezierCurveTo(39.229866, 35.231479, 38.089606, 35.378999, 37.393816, 35.559299);
	ctx.bezierCurveTo(36.698026, 35.739599, 36.084836, 35.843209, 36.031176, 35.789549);
	ctx.bezierCurveTo(35.977476, 35.735849, 36.106376, 35.375069, 36.317446, 34.987719);
	ctx.bezierCurveTo(36.648826, 34.379689, 36.716736, 33.578189, 36.814426, 29.122009);
	ctx.bezierCurveTo(36.960996, 22.435779, 37.076996, 22.146569, 40.250766, 20.554459);
	ctx.bezierCurveTo(43.335896, 19.006812, 45.133366, 17.607282, 47.627276, 14.811010);
	ctx.bezierCurveTo(49.946096, 12.211065, 54.728366, 4.767997, 55.294816, 2.877343);
	ctx.bezierCurveTo(55.665946, 1.638622, 56.306746, 1.031440, 57.079756, 1.186041);
	ctx.bezierCurveTo(57.423366, 1.254761, 58.761876, 2.069729, 60.054216, 2.997075);
	ctx.bezierCurveTo(62.900936, 5.039788, 63.661856, 5.305639, 66.240876, 5.158589);
	ctx.bezierCurveTo(68.053316, 5.055249, 68.237046, 5.084779, 69.496266, 5.681804);
	ctx.bezierCurveTo(70.501676, 6.158496, 71.402306, 6.879841, 73.148176, 8.606740);
	ctx.bezierCurveTo(75.601026, 11.032931, 76.865496, 11.864139, 78.681086, 12.243835);
	ctx.bezierCurveTo(81.252266, 12.781548, 83.650056, 14.530910, 85.377496, 17.129356);
	ctx.bezierCurveTo(86.536676, 18.873009, 87.156136, 20.255129, 88.234066, 23.502819);
	ctx.bezierCurveTo(89.606826, 27.638819, 90.428946, 28.594429, 95.642466, 32.114149);
	ctx.bezierCurveTo(99.249886, 34.549559, 100.374180, 35.580259, 101.800520, 37.759539);
	ctx.bezierCurveTo(104.225240, 41.464249, 104.347330, 43.499909, 102.521150, 49.774469);
	ctx.bezierCurveTo(102.064820, 51.342369, 101.549600, 53.366649, 101.376210, 54.272849);
	ctx.bezierCurveTo(101.000000, 56.239129, 101.129940, 57.313989, 102.257800, 61.565409);
	ctx.bezierCurveTo(104.123760, 68.599009, 103.324930, 70.857329, 98.060486, 73.431399);
	ctx.bezierCurveTo(92.999606, 75.905929, 88.700266, 79.374829, 86.431936, 82.813829);
	ctx.bezierCurveTo(85.456466, 84.292739, 83.804826, 88.027879, 83.792776, 88.782249);
	ctx.bezierCurveTo(83.789776, 88.978179, 83.715976, 89.182359, 83.629086, 89.235969);
	ctx.bezierCurveTo(83.542186, 89.289569, 83.114416, 87.470239, 82.678486, 85.192979);
	ctx.fill();
	
// #path4239
	ctx.beginPath();
	ctx.lineJoin = 'miter';
	ctx.lineCap = 'butt';
	ctx.lineWidth = 2.300000;
	ctx.fillStyle = 'rgb(0, 230, 0)';
	ctx.miterLimit = 4;
	ctx.globalAlpha = 1.0;
	ctx.moveTo(84.302426, 110.573310);
	ctx.bezierCurveTo(83.588736, 110.240970, 82.227656, 109.111690, 80.173856, 107.147850);
	ctx.bezierCurveTo(75.495856, 102.674750, 72.343196, 100.735430, 68.532216, 99.986639);
	ctx.bezierCurveTo(66.109346, 99.510589, 64.070906, 99.769919, 61.590926, 100.869720);
	ctx.bezierCurveTo(59.061386, 101.991500, 58.471026, 102.117830, 57.291876, 101.789670);
	ctx.bezierCurveTo(56.454466, 101.556620, 55.855156, 101.084170, 53.555746, 98.844399);
	ctx.bezierCurveTo(50.894626, 96.252289, 49.530576, 95.272849, 48.581766, 95.272849);
	ctx.bezierCurveTo(48.328026, 95.272849, 46.594116, 95.879659, 44.728616, 96.621319);
	ctx.bezierCurveTo(40.331106, 98.369609, 39.357296, 98.644019, 37.559146, 98.641529);
	ctx.bezierCurveTo(36.433036, 98.640529, 35.813236, 98.517869, 35.016656, 98.140649);
	ctx.bezierCurveTo(33.265956, 97.311599, 32.695056, 96.528479, 31.952166, 93.936989);
	ctx.bezierCurveTo(29.750226, 86.255749, 26.854786, 81.946909, 22.481716, 79.843549);
	ctx.bezierCurveTo(21.314476, 79.282129, 20.767686, 79.161469, 18.777316, 79.026119);
	ctx.bezierCurveTo(14.515678, 78.736319, 11.502078, 77.664629, 6.997367, 74.836989);
	ctx.bezierCurveTo(3.016601, 72.338219, 1.128103, 69.906799, 1.138407, 67.293639);
	ctx.bezierCurveTo(1.144807, 65.673179, 1.534538, 64.863189, 3.193430, 63.022739);
	ctx.bezierCurveTo(4.870808, 61.161779, 5.679269, 59.563809, 6.169013, 57.141329);
	ctx.bezierCurveTo(6.481336, 55.596449, 6.512144, 54.584219, 6.393430, 49.767829);
	ctx.bezierCurveTo(6.283573, 45.310739, 6.316610, 43.903739, 6.557284, 42.789969);
	ctx.bezierCurveTo(7.498315, 38.435119, 10.887030, 35.164189, 14.761219, 34.871189);
	ctx.bezierCurveTo(16.790996, 34.717679, 17.951976, 34.996509, 21.961946, 36.600599);
	ctx.bezierCurveTo(23.819656, 37.343729, 25.901516, 38.098109, 26.588306, 38.276999);
	ctx.bezierCurveTo(28.458976, 38.764239, 30.623096, 38.695889, 32.546896, 38.088779);
	ctx.bezierCurveTo(33.441796, 37.806379, 35.027196, 37.367969, 36.070016, 37.114539);
	ctx.bezierCurveTo(39.862806, 36.192789, 39.904946, 36.188509, 41.199376, 36.592939);
	ctx.bezierCurveTo(42.273616, 36.928569, 42.658216, 37.238779, 45.128886, 39.762399);
	ctx.lineTo(47.867616, 42.559819);
	ctx.lineTo(52.818396, 42.656319);
	ctx.bezierCurveTo(57.312846, 42.743919, 57.960856, 42.803709, 59.848876, 43.305299);
	ctx.bezierCurveTo(65.663816, 44.850159, 68.695256, 47.702739, 69.779756, 52.650209);
	ctx.bezierCurveTo(71.182696, 59.050409, 72.428546, 60.874239, 77.442076, 63.867329);
	ctx.bezierCurveTo(81.852846, 66.500559, 83.458326, 68.103269, 83.968126, 70.382159);
	ctx.bezierCurveTo(84.235786, 71.578679, 83.939226, 72.586339, 82.160736, 76.523129);
	ctx.bezierCurveTo(79.923046, 81.476429, 79.600856, 83.610179, 80.424486, 88.021699);
	ctx.bezierCurveTo(81.526366, 93.923539, 81.706896, 95.175589, 81.910446, 98.327619);
	ctx.bezierCurveTo(82.030176, 100.181530, 82.263026, 102.290880, 82.427896, 103.015060);
	ctx.bezierCurveTo(82.808356, 104.686210, 83.773586, 106.611330, 85.046646, 108.238100);
	ctx.bezierCurveTo(86.270746, 109.802300, 86.592156, 110.385810, 86.443316, 110.773700);
	ctx.bezierCurveTo(86.276106, 111.209420, 85.515566, 111.138250, 84.302426, 110.573350);
	ctx.moveTo(80.276686, 103.020220);
	ctx.bezierCurveTo(79.243776, 101.878530, 74.722686, 96.462919, 70.839126, 91.715369);
	ctx.lineTo(66.636566, 86.577859);
	ctx.lineTo(66.695666, 82.972509);
	ctx.bezierCurveTo(66.784466, 77.553669, 66.293676, 74.958399, 63.761886, 67.459659);
	ctx.bezierCurveTo(62.936886, 65.016119, 62.242576, 62.565809, 62.165066, 61.824199);
	ctx.bezierCurveTo(62.032226, 60.553259, 62.009026, 60.512069, 61.425916, 60.512069);
	ctx.bezierCurveTo(60.908876, 60.512069, 60.824356, 60.593869, 60.827026, 61.091419);
	ctx.bezierCurveTo(60.833026, 62.115789, 61.431756, 64.312239, 62.850646, 68.509019);
	ctx.bezierCurveTo(63.612946, 70.763769, 64.463206, 73.607829, 64.740106, 74.829169);
	ctx.bezierCurveTo(65.365916, 77.589449, 65.784876, 82.103359, 65.571926, 83.791259);
	ctx.lineTo(65.412456, 85.055289);
	ctx.lineTo(64.645556, 84.116999);
	ctx.bezierCurveTo(58.108406, 76.118929, 53.036786, 70.252849, 48.530406, 65.477399);
	ctx.lineTo(45.760906, 62.542549);
	ctx.lineTo(45.730506, 59.999939);
	ctx.bezierCurveTo(45.692006, 56.781609, 45.039116, 53.778199, 43.301396, 48.825749);
	ctx.bezierCurveTo(42.609096, 46.852709, 41.939046, 44.930289, 41.812396, 44.553709);
	ctx.bezierCurveTo(41.584576, 43.876279, 41.185836, 43.703969, 40.642966, 44.048359);
	ctx.bezierCurveTo(40.430926, 44.182879, 40.576366, 44.778229, 41.298476, 46.731199);
	ctx.bezierCurveTo(43.568786, 52.871559, 44.323436, 55.794919, 44.529616, 59.248039);
	ctx.lineTo(44.661706, 61.460089);
	ctx.lineTo(40.471206, 57.347699);
	ctx.bezierCurveTo(36.145816, 53.102939, 33.846476, 51.205279, 31.385376, 49.849119);
	ctx.bezierCurveTo(30.601736, 49.417299, 28.658706, 48.184819, 27.067546, 47.110279);
	ctx.bezierCurveTo(24.222626, 45.189039, 24.169366, 45.163939, 23.863596, 45.600489);
	ctx.bezierCurveTo(23.692586, 45.844639, 23.596026, 46.114569, 23.649016, 46.200319);
	ctx.bezierCurveTo(23.822486, 46.480999, 29.297686, 50.094049, 30.598706, 50.786389);
	ctx.bezierCurveTo(33.097896, 52.116309, 35.719266, 54.352589, 41.600166, 60.171689);
	ctx.bezierCurveTo(44.873466, 63.410599, 47.551626, 66.137599, 47.551626, 66.231709);
	ctx.bezierCurveTo(47.551626, 66.877859, 39.310596, 65.028889, 28.187896, 61.887209);
	ctx.bezierCurveTo(24.333286, 60.798449, 23.217386, 60.553469, 23.082346, 60.766339);
	ctx.bezierCurveTo(22.590186, 61.542129, 22.833256, 61.650759, 28.750196, 63.299339);
	ctx.bezierCurveTo(40.006906, 66.435699, 44.601206, 67.464229, 47.354276, 67.464229);
	ctx.lineTo(48.768606, 67.464229);
	ctx.lineTo(51.280416, 70.255619);
	ctx.bezierCurveTo(55.429546, 74.866589, 64.616006, 85.787939, 64.616006, 86.109669);
	ctx.bezierCurveTo(64.616006, 86.172969, 64.325476, 86.074569, 63.970386, 85.890929);
	ctx.bezierCurveTo(62.667956, 85.217419, 50.372076, 82.540829, 46.182266, 82.018779);
	ctx.bezierCurveTo(45.255306, 81.903289, 43.169666, 81.755719, 41.547496, 81.690859);
	ctx.bezierCurveTo(39.925326, 81.625959, 38.389086, 81.517009, 38.133636, 81.448659);
	ctx.bezierCurveTo(37.759156, 81.348469, 37.642016, 81.432659, 37.528986, 81.882949);
	ctx.bezierCurveTo(37.451886, 82.190159, 37.436886, 82.489579, 37.495586, 82.548319);
	ctx.bezierCurveTo(37.554286, 82.607019, 39.675056, 82.785949, 42.208326, 82.945849);
	ctx.bezierCurveTo(47.678156, 83.291119, 50.973486, 83.853749, 59.665216, 85.926389);
	ctx.bezierCurveTo(61.802976, 86.436159, 63.258996, 86.914229, 64.165936, 87.404159);
	ctx.bezierCurveTo(64.903296, 87.802489, 65.668416, 88.100969, 65.866196, 88.067469);
	ctx.bezierCurveTo(66.113646, 88.025569, 67.464136, 89.517329, 70.196686, 92.851059);
	ctx.bezierCurveTo(74.824646, 98.497189, 76.858586, 100.936130, 78.596116, 102.923000);
	ctx.lineTo(79.851326, 104.358350);
	ctx.lineTo(80.280786, 103.928890);
	ctx.lineTo(80.710236, 103.499440);
	ctx.lineTo(80.276686, 103.020220);
	ctx.fill();
	
// #path4241
	ctx.beginPath();
	ctx.lineJoin = 'miter';
	ctx.lineCap = 'butt';
	ctx.lineWidth = 2.300000;
	ctx.fillStyle = 'rgb(0, 149, 0)';
	ctx.miterLimit = 4;
	ctx.globalAlpha = 1.0;
	ctx.moveTo(81.835436, 89.130239);
	ctx.bezierCurveTo(81.322066, 86.466229, 81.099226, 84.496959, 81.340536, 84.756829);
	ctx.bezierCurveTo(81.519966, 84.950059, 82.546486, 91.096929, 82.484346, 91.606019);
	ctx.bezierCurveTo(82.447746, 91.906219, 82.155696, 90.792119, 81.835436, 89.130239);
	ctx.fill();
	
// #path4243
	ctx.beginPath();
	ctx.lineJoin = 'miter';
	ctx.lineCap = 'butt';
	ctx.lineWidth = 2.300000;
	ctx.fillStyle = 'rgb(0, 149, 0)';
	ctx.miterLimit = 4;
	ctx.globalAlpha = 1.0;
	ctx.fill();
	
// #path4247
	ctx.beginPath();
	ctx.lineJoin = 'miter';
	ctx.strokeStyle = 'rgb(0, 0, 0)';
	ctx.lineCap = 'butt';
	ctx.miterLimit = 4;
	ctx.lineWidth = 0.324416;
	ctx.fillStyle = 'rgb(173, 216, 230)';
	ctx.moveTo(40.646936, 32.853319);
	ctx.bezierCurveTo(44.985246, 34.693239, 52.047516, 35.683869, 57.349846, 32.853319);
	ctx.bezierCurveTo(60.996916, 30.906389, 54.601556, 24.297219, 51.260966, 21.089829);
	ctx.bezierCurveTo(48.748696, 18.677715, 46.469066, 21.016429, 45.589416, 21.721849);
	ctx.bezierCurveTo(42.572216, 24.141539, 36.308626, 31.013399, 40.646936, 32.853319);
	ctx.fill();
  ctx.stroke();
  ctx.scale(1/swf,1/swf)

  }

})