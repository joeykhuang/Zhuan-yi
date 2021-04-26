// pages/up/up.js
var util = require('../../utils/util.js');
var api = require('../../config/api.js');
var uploadImage = require('utils/uploadImg.js');
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {   
    address: {
        id: 0,
        province_id: 0,
        details: '',
        full_region: '',
        goodsname: '',
        is_default: 0,
        time:''
    },
    addressId: 0,
    openSelectRegion: false,
    selectRegionList: [{
            id: 0,
            name: '种类',
            parent_id: 1,
            type: 1
        }
    ],
    judge:0,
    regionType: 1,
    regionList: [{
        id:0,
        name:'上衣',
        type:1
    },
    {
        id:1,
        name:'裤子',
        type:1
    },
    {
        id:2,
        name:'鞋类',
        type:1
    },
    {
        id:3,
        name:'配饰',
        type:1
    },
    {
        id:4,
        name:'其他',
        type:1
    },
],
    selectRegionDone: false,
    //上传图片数据
    picturePathLocal:"",
    showPic: true,
    itemhide:false,
    // 多张图片
    uploaderList: [],
    uploadURLS: [],
    uploaderNum: 0,
    judgeupload:false,
    showUpload: true
},
bindinputName(event) {
    let address = this.data.address;
    address.goodsname = event.detail.value;
    this.setData({
        address: address
    });
},//商品名称
bindinputAddress(event) {
    let address = this.data.address;
    address.details = event.detail.value;
    this.setData({
        address: address
    });
},//商品介绍 
bindinputtime(event) {
    let address = this.data.address;
    address.time = event.detail.value;
    this.setData({
        address: address
    });
},//商品租赁期限
setRegionDoneStatus() {
    let that = this;
    let doneStatus=false;
    if(this.data.judge===1){doneStatus=true};
    that.setData({
        selectRegionDone: doneStatus
    })
},
chooseRegion() {
    let that = this;
    this.setData({
        openSelectRegion: !this.data.openSelectRegion
    });

    //设置区域选择数据
    let address = this.data.address;
    if (address.province_id > 0 ) {
        let selectRegionList = this.data.selectRegionList;
        selectRegionList[0].id = address.province_id;
        selectRegionList[0].name = address.province_name;
        selectRegionList[0].parent_id = 1;
    } else {
        this.setData({
            selectRegionList: [{
                    id: 1,
                    name: '种类',
                    parent_id: 1,
                    type: 1
                },
            ],
            regionType: 1
        })
    }

    this.setRegionDoneStatus();

},
onLoad: function(options) {
    // 页面初始化 options为页面跳转所带来的参数
    if (options.id) {
        this.setData({
            addressId: options.id
        });
        this.getAddressDetail();
    }
},
onReady: function() {

},
selectRegionType(event) {
    let that = this;
    let regionTypeIndex = event.target.dataset.regionTypeIndex;
    let selectRegionList = that.data.selectRegionList;

    //判断是否可点击
    this.setData({
        regionType: regionTypeIndex + 1
    })

    let selectRegionItem = selectRegionList[regionTypeIndex];

    this.setRegionDoneStatus();

},
selectRegion(event) {
    let that = this;
    let regionIndex = event.target.dataset.regionIndex;
    let regionItem = this.data.regionList[regionIndex];
    let regionType = regionItem.type;
    let selectRegionList = this.data.selectRegionList;
    selectRegionList[regionType - 1] = regionItem;

    if (regionType != 2) {
        this.setData({
            selectRegionList: selectRegionList,
            regionType: regionType + 1
        })
    } else {
        this.setData({
            selectRegionList: selectRegionList
        })
    }
    that.setData({
        regionList: that.data.regionList.map(item => {

            //标记已选择的
            if (that.data.regionType == item.type ) {
                item.selected = true;
                this.data.judge=1;
            } else {
                item.selected = false;
            }

            return item;
        })
    });

    this.setRegionDoneStatus();

},
doneSelectRegion() {
    let address = this.data.address;
    let selectRegionList = this.data.selectRegionList;
    address.province_id = selectRegionList[0].id;
    address.full_region = selectRegionList.map(item => {
        return item.name;
    }).join('');

    this.setData({
        address: address,
        openSelectRegion: false
    });

},
cancelSelectRegion() {
    this.setData({
        openSelectRegion: false,
        regionType: this.data.regionDoneStatus ? 3 : 1
    });
},
saveAddress() {
    let address = this.data.address;
    if (address.goodsname == '' || address.goodsname == undefined) {
        util.showErrorToast('请输入商品名字');
        return false;
    }
    if (this.data.address.full_region == '' || address.full_region == undefined) {
        util.showErrorToast('请选择商品种类');
        return false;
    }
    if (address.details == '' || address.details == undefined) {
        util.showErrorToast('请输入商品介绍');
        return false;
    }
    if (this.data.address.time == '' || address.time == undefined) {
        util.showErrorToast('请输入商品预计租赁时间');
        return false;
    }
    if(this.data.uploaderNum<1){
        util.showErrorToast('请上传至少一张照片');
        return false;
    }
    if(this.data.judgeupload==false){
        util.showErrorToast('请点击上传按钮上传照片');
        return false;
    }
    let that = this;
    util.request(api.SaveNewProduct, {
        name: address.goodsname,//新商品名
        details: address.details,//新商品的详细介绍
        types:address.full_region,// 新商品的种类
        time:address.time,//商品的预计租赁时间
        images:that.data.uploadURLS
    }, 'POST').then(function(res) {
        wx.showToast({
            title: '成功',
            icon: 'success',
            duration: 2000//持续的时间2s
          })
          setTimeout(function () {
            wx.navigateBack()
           }, 2200) //延迟时间 这里是2.2秒       
    });

},
onShow: function() {
},
  /**
   * 生命周期函数--监听页面加载
   */

  showImg: function (e) {
    var that = this;
    wx.previewImage({
      urls: that.data.picturePathLocal, 
    })
  },

  //展示图片
  showImg_d: function (e) {
    var that = this;
    wx.previewImage({
      urls: that.data.uploaderList,
      current: that.data.uploaderList[e.currentTarget.dataset.index]
    })
  },
  // 删除图片
  clearImg_d: function (e) {
    var nowList = []; //新数据
    var uploaderList = this.data.uploaderList; //原数据

    for (let i = 0; i < uploaderList.length; i++) {
      if (i == e.currentTarget.dataset.index) {
        continue;
      } else {
        nowList.push(uploaderList[i])
      }
    }
    this.setData({
      uploaderNum: this.data.uploaderNum - 1,
      uploaderList: nowList,
      showUpload: true
    })
  },

  //选择图片
  choosePic_d: function (e) {
    var that = this;
    wx.chooseImage({
      count: 9 - that.data.uploaderNum, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        console.log(res)
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        let tempFilePaths = res.tempFilePaths;
        let uploaderList = that.data.uploaderList.concat(tempFilePaths);
        var URLS = [];
        for (var i = 0; i < res.tempFilePaths.length; i++) {
          //显示消息提示框
          wx.showLoading({
            title: '上传中' + (i + 1) + '/' + res.tempFilePaths.length,
            mask: true
          })
          uploadImage(res.tempFilePaths[i], 'images/',
            function (result) {
              console.log("======上传成功图片地址为：", result);
              URLS[i] = result;
              wx.hideLoading();
              that.data.judgeupload = true;
            }, function (result) {
              console.log("======上传失败======", result);
              wx.hideLoading()
            }
          )
        }
      
        if (uploaderList.length == 9) {
          that.setData({
            showUpload: false
          })
        }
        console.log(URLS);
        that.setData({
          uploaderList: uploaderList,
          uploaderNum: uploaderList.length,
          uploadURLS: URLS,
        })
      }
    })
  },

  onHide: function () {

  },

  onUnload: function () {

  },

  onPullDownRefresh: function () {
    this.clrearinputevent();
    /*
    wx.switchTab({
        url: '/pages/index/index',
    });*/
    },

  onReachBottom: function () {

  },

  onShareAppMessage: function () {

  }
})