// miniprogram/pages/index/dayview.js
const app = getApp()


Page({

  /**
   * Page initial data
   */
  data: {
    dayview : '',
    swf : '',
    shf:'',
    lang: 'CN'
  },

  /**
   * Lifecycle function--Called when page load
   */

 
  onLoad: function (options) {
    var that = this
    var info = wx.getSystemInfoSync() 
    this.setData({
      dayview : app.globalData.dayview,
      swf : info.screenWidth / 375, //screenwidth factor
      shf : info.screenHeight / 667, // screenheight factor
      lang: app.globalData.languagePreference
    })
    if (this.data.lang == 'CN'){
      wx.setNavigationBarTitle({
        title: '我的报告'
      })
    }
    else if (this.data.lang =='EN'){
      wx.setNavigationBarTitle({
        title: 'My Reports'
      })
    }

    console.log('lang', this.data.lang)
 
    var logoLink = 'cloud://anthill-2hbtj.616e-anthill-2hbtj-1302839884/appImages/logo_small.png'
    wx.getImageInfo({
      src: logoLink,
      success (res) {
        logoLink = res.path
        var qrLink = 'cloud://anthill-2hbtj.616e-anthill-2hbtj-1302839884/appImages/OA_qr.JPG'
        wx.getImageInfo({
          src: qrLink,
          success (res) {
            qrLink = res.path
            var mpLink = 'cloud://anthill-2hbtj.616e-anthill-2hbtj-1302839884/appImages/AntHill1.0.0.small.jpg'
            wx.getImageInfo({
              src: mpLink,
              success (res) {
                mpLink = res.path
                for (var i = 0; i <that.data.dayview.length;i++){
                var data = that.data.dayview[i]
                console.log('imagelinkdata', data)
                var canvasId = data.canvasId
                var ctx = wx.createCanvasContext(canvasId)
                that.createCanvas(ctx, data, logoLink, qrLink, mpLink)
              }  
            }
          })
        }
      })
    }
  })
  },

  goBack:function(){
    wx.navigateBack({
      delta: 0,
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


  createCanvas:function(ctx, data, logoLink, qrLink, mpLink){
    var selfTestReport = 'Self-test Report'
    var goodFoodYourdecision = '蚁巢AntHill, your food quality guide'
    var testedWithSA = 'A 希蚁SquaredAnt platform'
    var noDetails = "No details provided" 
    var noAddress = "unknown"
    var noBrand = "no brand"
    if (this.data.lang == 'CN'){
       selfTestReport = '食品自检报告'
       goodFoodYourdecision = '蚁巢AntHill,您的食品质量管家'
       testedWithSA = '本平台由希蚁SquaredAnt提供支持'
       noDetails = "无详细信息" 
       noAddress = "未知"
       noBrand = "品牌未知"
    }


    var that = this
    //what do we need
    var swf = this.data.swf
    var shf = this.data.shf
    var date = data.date
    var subcategory =''
    var category = ''
    var result = ''
    if (this.data.lang=='EN'){
      result = data.qualresult_en
      var subcategory = data.subcategory
      if (subcategory != data.category){
        category = ['(',data.category,')'].join('')
      }
      category = [subcategory, ' ', category].join('')
    }
    if (this.data.lang=='CN'){
      result = data.qualresult_cn
      var subcategory = data.subcategory_cn
      if (subcategory != data.category_cn){
        category = ['(',data.category_cn,')'].join('')
      }
      category = [subcategory, ' ', category].join('')
    }

    var food = [data.matrix , ': ', data.submatrix].join('')
  
    var brand = data.brand
    var details = data.details
    if (details == ''){
      details = noDetails
    }
    if (brand == ''){
      brand = noBrand
    }
    var details = [details , ' [', brand ,']'].join('')
   
    var seller = data.seller
    if (seller == ''){
      seller = noAddress
    }
    var origin = seller
   
    var imagelink = data.fileID
    var address = data.address
    if (typeof address == 'undefined'){
      address = noAddress
    }
    

    var canvasId = data.canvasId  
      wx.getImageInfo({
      src: imagelink,
      success (res) {
        imagelink = res.path

        // draw on a 375 * 1000 rpx
        //the title line

       ctx.save()
       ctx.beginPath() 
       ctx.setFillStyle('#92c06d')
       ctx.rect(0, swf*0, swf * 375, swf * 600 )
       ctx.fill()
       ctx.beginPath() 
       ctx.setFillStyle('white')
        ctx.rect(0, swf*50, swf * 375, swf * 425 )
        ctx.fill()

        ctx.beginPath()
        ctx.setFillStyle('black')
        ctx.setTextBaseline('middle')
        ctx.setFontSize(swf * 25) 
        ctx.beginPath() 
        ctx.fillText(selfTestReport, swf* 100, swf * 25) 
      
        ctx.beginPath()
        ctx.setStrokeStyle('white')
        ctx.arc(swf * 350, swf * 25 , swf * 20, 0, 2 * Math.PI)
        ctx.stroke()
        ctx.clip()
        ctx.drawImage(logoLink, swf * 325, 0, swf *50, swf * 50)
        ctx.restore()

        ctx.beginPath()
        ctx.setStrokeStyle('orange')
        ctx.setLineWidth(swf * 1)
        ctx.arc(swf * 350, swf * 25 , swf * 20, 0, 2 * Math.PI)
        ctx.stroke()

        // now the linestructure
        ctx.beginPath()
        ctx.setStrokeStyle('#92c06d')
        ctx.setLineWidth(swf * 1)
        ctx.moveTo(swf * 187, swf * 50)
        ctx.lineTo(swf * 187, swf * 475)
        ctx.stroke() 

        ctx.beginPath()
        ctx.moveTo(swf * 0, swf * 50)
        ctx.lineTo(swf * 375, swf * 50)
        ctx.stroke() 

        ctx.beginPath()
        ctx.moveTo(swf * 0, swf * 100)
        ctx.lineTo(swf * 375, swf * 100)
        ctx.stroke() 

        ctx.beginPath()
        ctx.moveTo(swf * 0, swf * 200)
        ctx.lineTo(swf * 375, swf * 200)
        ctx.stroke() 

        ctx.beginPath()
        ctx.moveTo(swf * 0, swf * 275)
        ctx.lineTo(swf * 187.5, swf * 275)
        ctx.stroke() 

        ctx.beginPath()
        ctx.moveTo(swf * 0, swf * 350)
        ctx.lineTo(swf * 187.5, swf * 350)
        ctx.stroke() 

        ctx.beginPath()
        ctx.moveTo(swf * 0, swf * 475)
        ctx.lineTo(swf * 375, swf * 475)
        ctx.stroke() 

        //now the text
        ctx.setFontSize(swf*12)
        if (that.data.lang == 'EN'){
          ctx.fillText('Date:',swf * 10, swf* 65)
          ctx.fillText('Category:',swf * 197.5, swf* 65)
          ctx.fillText('Food:',swf * 10, swf* 115)
          ctx.fillText('Descriptions:',swf * 197.5, swf* 115)
          ctx.fillText('Origin:',swf * 10, swf* 215)
          ctx.fillText('Address:',swf * 10, swf* 290)
          ctx.fillText('Image:',swf * 197.5, swf* 215)
          ctx.fillText('Result:',swf * 10, swf* 365)
        }
        else if (that.data.lang == 'CN'){
          ctx.fillText('日期:',swf * 10, swf* 65)
          ctx.fillText('被检物:',swf * 197.5, swf* 65)
          ctx.fillText('食品种类:',swf * 10, swf* 115)
          ctx.fillText('食品描述:',swf * 197.5, swf* 115)
          ctx.fillText('商铺名称:',swf * 10, swf* 215)
          ctx.fillText('商铺地址:',swf * 10, swf* 290)
          ctx.fillText('照片:',swf * 197.5, swf* 215)
          ctx.fillText('检测结果:',swf * 10, swf* 365)
        }

        //print the image
        ctx.drawImage(imagelink, swf * 197.5, swf * 230, swf *167.5, swf * 235)

        //print the text
        ctx.setFontSize(swf*15)
        ctx.fillText(date, swf * 20, swf* 90)
        ctx.fillText(category,swf * 207.5, swf* 90)
        that.wrapText(food, ctx, swf * 20, swf* 140, swf*16, 120)
        that.wrapText(details, ctx, swf * 207.5, swf* 140, swf * 16, 120)
        that.wrapText(origin, ctx, swf * 20, swf* 240, swf * 16, 120)
        that.wrapText(address, ctx, swf * 20, swf* 315, swf * 16, 120)
      
 
        var chars = result.split('');
        ctx.setFontSize(swf*100 /chars.length)
        ctx.setTextBaseline('normal')
        ctx.fillText(result,  swf * 70, swf* 450)

        // now the qr and the text
        ctx.drawImage(qrLink, swf * 243, swf * 477, swf *60, swf * 60)
        ctx.drawImage(mpLink, swf * 305, swf * 477, swf *60, swf * 60)
        ctx.setFontSize(swf*13)
        ctx.fillText(goodFoodYourdecision,  swf * 10, swf* 505)
        ctx.setFontSize(swf*11)
        ctx.fillText(testedWithSA,  swf * 10, swf* 525)
        ctx.draw()
      }
   })

  },

  screenShot:function(e){
      var canvasId = e.target.id 

      // canvas has been drawn here, you can save the canvas image with wx.canvasToTempFilePath 

      wx.canvasToTempFilePath({
        canvasId: canvasId,
        success(res) {
          console.log(res.tempFilePath)
          var filename = res.tempFilePath
          wx.saveFile({
            tempFilePath: filename,
             success (res) {
               const savedFilePath = res.savedFilePath
               console.log(savedFilePath)
               wx.previewImage({
                current: savedFilePath, // The http link of the current image
                urls: [savedFilePath], // The http links of the images to preview
                success(res){
                  wx.showShareMenu({
                    withShareTicket: true
                  })
                }
              })
            }
          })
        }
      })
    },

wrapText:function(text, ctx, x, y, lineHeight, maxwidth){
  // slice into the string a spece
    //var words = text.split(' ');
    var words = text.split('');
    var line = '';
    var maxWidth = maxwidth

 
    for(var n = 0; n < words.length; n++) {
   //   var testLine = line + words[n] + ' ';
      var testLine = line + words[n];
      var metrics = ctx.measureText(testLine);
      var testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line, x, y);
   //     line = words[n] + ' ';
         line = words[n];
        y += lineHeight;
      }
      else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, y);
  }

})