/**
 * Created by diogoxiang on 2016/5/20.
 * modify  : 2016年5月30日15:44:55
 * version : 0.0.1 版本
 * anthor : diogoxiang
 */

define(['jquery', 'underscore', 'progress', 'domReady', 'layer', 'md5', 'qrcode'], function ($, _, lod, doc, layer, md5, qrcode) {

    /**
     * 使用 {{xx}}  模版
     * @type {{interpolate: RegExp}}
     */
    _.templateSettings = {
        evaluate: /<%([\s\S]+?)%>/g,
        interpolate: /<%=([\s\S]+?)%>/g,
        escape: /<%-([\s\S]+?)%>/g
    };


    var that;

    //提共接口外调
    return {
        version: '0.0.2',   //当前工具的版本 2016年6月27日18:29:47
        progress: lod,
        layer: layer,
        md5: md5,
        qrcode: qrcode,

        isAndroid: (/android/gi).test(navigator.appVersion),
        uzStorage: function () {
            var ls = window.localStorage;
            if (that.isAndroid) {
                ls = os.localStorage();
            }
            return ls;
        },

        /**
         * tool 工具初始化
         */
        init: function () {
            Log("init");
            Log("当前接口地址是" + $url.host);
            //检查用户是否登录
            //this.checkLogin();
            that = this;
            console.log(this)
        },
        /**
         * endProgress
         */
        endProgress: function () {
            lod().end();
        },
        /**
         * 获取用户访问UA
         */
        getUa: function () {
            var ua = window.navigator.userAgent.toLocaleLowerCase(), isApple = !!ua.match(/(ipad|iphone|mac)/i), isAndroid = !!ua.match(/android/i), isWinPhone = !!ua.match(/MSIE/i), ios6 = !!ua.match(/os 6.1/i), isWeixin = !!ua.match(/MicroMessenger/i);
            return {isApple: isApple, isAndroid: isAndroid, isWinPhone: isWinPhone, ios6: ios6, isweixin: isWeixin}
        },


        is_weixin: function () {
            var ua = navigator.userAgent.toLowerCase();
            if (ua.match(/MicroMessenger/i) == "micromessenger") {
                return true;
            } else {
                return false;
            }
        },
        /**
         * getMode 从URL地址栏中获取model的参数
         * @param name  参数的名称
         * @returns {null} 返回参数的值
         */
        getModel: function (name) {
            var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
            var r = window.location.search.substr(1).match(reg);
            if (r != null) {
                return unescape(r[2]);
            }
            return null;
        },
        /**
         *
         * @param str
         * @returns {boolean}
         */
        isCellphone: function (str) {
            /**
             *@descrition:手机号码段规则
             * 13段：130、131、132、133、134、135、136、137、138、139
             * 14段：145、147
             * 15段：150、151、152、153、155、156、157、158、159
             * 17段：170、176、177、178
             * 18段：180、181、182、183、184、185、186、187、188、189
             *
             */
            var pattern = /^(13[0-9]|14[57]|15[012356789]|17[0678]|18[0-9])\d{8}$/;
            return pattern.test(str);
        },
        /**
         * 简易AJAX封装
         * @param url
         * @param data
         * @param success
         * @param error
         */
        getAjax: function (url, data, success, errorF) {
            var aurl = $url.host + url;
            console.log("请求地址是:" + aurl);
            $.ajax({
                type: "POST",
                url: aurl,
                data: data,
                dataType: 'json',
                timeout: 5000,
                success: function (data) {
                    //console.log( "Data Saved: " + data );
                    return success(data);
                },
                error: function (data) {
                    if (_.isFunction(errorF)) {
                        return errorF(url, data);
                    } else {
                        that.getError(url, data);
                    }

                },
                complete: function (XMLHttpRequest, textStatus) {
                    //console.log(XMLHttpRequest)
                    //console.log(textStatus)
                    //当前方法为.请求返回的详情
                }

            });


        },
        /**
         *
         */
        getError: function (url, data) {
            console.log("出错的地址是:" + url + "::::" + "返回值是" + JSON.stringify(data));
            //that.openW("网络错误",'html/error/nonet.html','',false)
            api.toast({
                msg: data.msg || "网络错误",
                duration: 2000,
                location: 'bottom'
            });
        },
        /**
         * 检验用户是否已经登录
         */
        checkLogin: function () {
            console.log("检验用户是否已经登录")
            if (!ck.get("token")) {
                window.location.href = "index.html?m=login";
            }

        },
        /**
         * 用户退出 清除 cookies
         */
        userOut: function () {
            ck.remove('token');
            ck.remove('userinfo');
            window.location.href = "index.html?m=login";
        },
        /**
         * 截取字符串
         * @param e
         * @param num
         * @returns {string}
         */
        getStr: function (e, num) {
            var more = '';
            if (e.length >= 12) {
                more = '...';
            }
            var data = e.substr(0, num) + more;
            return data.toString();
        },
        /**
         * 先启动APP, 如果启动不成功 则 打开下载链接 ,暂时有很多的APP的不行..但大部分原生的都已经支持了
         * @param url
         */
        openApp: function (e) {
            var loadDateTime = _.now();
            var postid = this.getModel("id");

            if (isWeixin) {
                /**
                 * 微信打开提示窗
                 */
                $('#weixin-tip').show();
                $('#close').on('click', function () {
                    $('#weixin-tip').hide();
                });

            } else {
                setTimeout(function () {
                    var timeOutDateTime = new Date();
                    if (!loadDateTime || timeOutDateTime - loadDateTime < 2010) {
                        window.location.href = "http://bbs.ttq.com/dl";
                    }
                }, 2000);
                //scheme : 固定为  szttq1023319867
                window.location = 'szttq1023319867://post/detail?post_id=' + postid;
            }


        },
        /**
         * 判断字符串长度
         * @param str
         * @param len
         */
        strLen: function (str, len) {
            if (str.length < len) {
                console.log(str.length + "----" + len);
                return true;
            }
            return false;
        },
        /**
         * 格式化时间
         * @param time   unix时间戳
         * @param e   返回的时间样式 默认返回  "yyyy-mm-dd hh:mm:ss "
         */
        formatDate: function (time, e) {
            time = new Date(time);

            function fixZero(num, length) {
                var str = "" + num;
                var len = str.length;
                var s = "";
                for (var i = length; i-- > len;) {
                    s += "0";
                }
                return s + str;
            }

            return time.getFullYear() + "-" + fixZero(time.getMonth() + 1, 2) + "-" + fixZero(time.getDate(), 2) + " " + fixZero(time.getHours(), 2) + ":" + fixZero(time.getMinutes(), 2) + ":" + fixZero(time.getSeconds(), 2);

        },
        /**
         *
         * @param dateStr
         * @returns   默认返回 unix时间戳
         */
        formatDatetoU: function (dateStr) {
            var dateStr = dateStr || '2016-07-23 09:00:00';
            var newstr = dateStr.replace(/\-/g, '/');
            var date = new Date(newstr);
            //var time_str = date.getTime().toString();
            var time_str = date.getTime();
            return time_str;
        },

        /**
         * 删除帖子
         * @param e
         */

        dellArticle: function (e) {

            console.log(e);


            var token = ck.get('token');
            var pdata = {
                postid: e,
                token: token
            };
            $app.getAjax($app.apiurl.service.expert_article_del, pdata, successF, errorF)

            function successF(data) {
                if (data.success) {
                    layer.msg("删除成功");
                    var item = '#article' + e;

                    $(item).fadeOut("slow", function () {
                        $(item).remove();
                    });


                } else {
                    layer.msg(data.msg);
                }

            }

            function errorF(data) {
                layer.msg(data.msg);
            }

            //阻止冒泡事件
            event.stopPropagation();


        },
        /**
         * 滑动固定
         * @param e 为div   ID
         */
        getFixed: function (eid) {

            window.onscroll = function (e) {
                var e = e || window.event;
                var scrolltop = document.documentElement.scrollTop || document.body.scrollTop;
                var headDom = document.getElementById(eid);
                if (scrolltop > 10) {
                    var op = scrolltop / 100;
                    headDom.style.opacity = op + 0.2;
                    headDom.className = "container-full newHeader";

                } else {

                    headDom.style.opacity = 1;
                    headDom.className = "container-full newHeader"
                }
            };

        },
        /**
         * 页面的跳转
         * @param url
         */
        gotoUrl: function (url) {

            window.location.href = url;

            //阻击事件冒泡
            event.stopPropagation();

        },
        /**
         * 重写log 方法 输出指定前缀
         * @param str
         */
        log: function (str) {
            var args = Array.prototype.slice.call(arguments);
            args.unshift('(app)');
            console.log.apply(console, args);
        },

        /**
         * getBase64Image 获取base64
         * @param img
         * @returns {string}
         */

        getBase64Image: function (img) {
            var canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;

            var ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, img.width, img.height);

            var dataURL = canvas.toDataURL("image/png");
            return dataURL
            // return dataURL.replace("data:image/png;base64,", "");
        },

        /**
         * 格式化 金钱
         * @param num
         * @retun 返回的是'元' 保留两位小数 '9999.00'
         */
        formatMoney: function (num) {

            //num = num.toString().replace(/\$|\,/g,'');
            if (isNaN(num) || num == null) {
                num = 0;
            }
            num = parseInt(num) / 100;//以整型计算
            return Number(num);
        },

        /**
         * 格式化 兑奖的状态
         * @param e    status 状态 0、待审核  1、已兑换
         */
        formatStatus: function (e) {
            if (isNaN(e)) {
                e = 0;
                return "待审核";
            }
            if (e == 1) {
                return "已兑换";
            } else {
                return "待审核";
            }
        },
        /**
         * 格式化 兑奖时间
         * @param dataStr
         */
        getExchangeTime: function (dataStr) {
            var newtime = this.formatDatetoU(dataStr);
            var time = new Date(newtime);

            function fixZero(num, length) {
                var str = "" + num;
                var len = str.length;
                var s = "";
                for (var i = length; i-- > len;) {
                    s += "0";
                }
                return s + str;
            }

            return fixZero(time.getMonth() + 1, 2) + "月" + fixZero(time.getDate(), 2) + "日" + fixZero(time.getHours(), 2) + ":" + fixZero(time.getMinutes(), 2);

        },

        /**
         * 返回或是关闭当前面
         */
        goBack: function (e, name) {

            var mod = that.getModel("m") || 0;

            if (mod) {
                window.history.back(-1);
            } else {
                api.closeWin();
            }
            //if (isdebug) {
            //    window.history.back(-1);
            //} else {
            //
            //    if (e == "win") {
            //        api.closeWin(
            //            {
            //                name: name
            //            }
            //        );
            //    } else {
            //        api.closeFrame(
            //            {
            //                name: name
            //            }
            //        );
            //    }
            //
            //}

        },


        /**
         * 用于保存用户头像
         */
        oneImgCahce: function (url) {
            api.imageCache({
                url: url,
                thumbnail: true
            }, function (ret, err) {
                console.log(ret.url);

            });
        },
        /**
         * 下载图像
         * @param url
         * @param name
         */
        downUimg: function (url, name) {
            var cacheDir = api.cacheDir;
            var saveUrl = cacheDir + '/' + name + '.png';
            console.log(saveUrl);
            api.download({
                url: url,
                savePath: saveUrl.toString(),
                report: true,
                cache: true,
                allowResume: true
            }, function (ret, err) {
                if (ret.state == 1) {
                    //下载成功
                    console.log(ret.savePath);
                    console.log("下载 成功")
                } else {
                    //
                    console.log(err)
                }
            });
        },


        /**
         * 生成带头像的二维码
         * @param img
         * @param url
         */
        drawQrcode: function (url, size, select) {
            var imga = document.createElement('img');
            //imga.src = '/storage/emulated/0/Android/data/com.apicloud.apploader/cache/disk/thumb/3e453cb2';
            imga.src = that.getStorage('userimg') || './upload/avatar_default.png';
            console.log("getStorage('userimg'):::" + that.getStorage('userimg'));
            var imgb = document.createElement('img');
            var ndata;
            imga.onload = function () {
                ndata = that.getBase64Image(imga);
                imgb.id = 'img-buffer';
                imgb.src = ndata;
                $('#imgDiv').append(imgb);
                console.log(ndata);
                $(select).empty().qrcode({
                    render: 'image',
                    mode: 4,
                    size: size,
                    fill: '#000',
                    background: '#ffffff',
                    text: url+4,
                    ecLevel: 'H',
                    minVersion: 5,
                    quiet: 2,
                    mSize: 0.2,
                    mPosX: 0.5,
                    mPosY: 0.5,
                    image: $('#img-buffer')[0]
                });


            };


        },


        /**
         * storage
         */
        setStorage: function (key, value) {
            if (arguments.length === 2) {
                var v = value;
                if (typeof v == 'object') {
                    v = JSON.stringify(v);
                    v = 'obj-' + v;
                } else {
                    v = 'str-' + v;
                }
                var ls = that.uzStorage();
                if (ls) {
                    ls.setItem(key, v);
                }
            }
        },

        getStorage: function (key) {
            var ls = that.uzStorage();
            if (ls) {
                var v = ls.getItem(key);
                if (!v) {
                    return;
                }
                if (v.indexOf('obj-') === 0) {
                    v = v.slice(4);
                    return JSON.parse(v);
                } else if (v.indexOf('str-') === 0) {
                    return v.slice(4);
                }
            }
        },

        rmStorage: function (key) {
            var ls = that.uzStorage();
            if (ls && key) {
                ls.removeItem(key);
            }
        },
        clearStorage: function () {
            var ls = that.uzStorage();
            if (ls) {
                ls.clear();
            }
        },


        //**

        /**
         * 公共跳转方法,主要用于 H5 to Native ,与原生的
         * @param name
         * {
     *  name:
     *      openYEY           ====>  摇一摇
     *      openSFL           ====>  送福利
     *      openDZP           ====>  大转盘
     *      openGame          ====>  打开游戏
     *      toRecommendModule ====>  推荐有礼
     *      toLoginModule     ====>  用户登录
     *      openUserInfo      ====>  用户基本信息
     *      openExchangeRecoord   ====>  核销记录
     *      toRevenueModel          ====> 跳到我的收益模块
     *      toServerStationMsgModel ====>  跳到消息模块
     *      openWebview             ====>  打开新的WEBview
     *      showDetailImages        ====> 查看图片大图
     * }
         *
         * @param data 可以当JSON对像传入
         *  {
     *  data:
     *      name:name
     *      extra:{
     *          id:id
     *          metainfo:data
       *          ....
     *      }
     *
     *  }
         *
         */
        goAccessNative: function (name, data) {

            if (typeof(data) == "object" && data != undefined) {
                console.log("go_accessNative:::" + name + "::data:::" + data);
                api.accessNative(data, function (ret, err) {
                    console.log(JSON.stringify(err))
                });

            } else {
                console.log("go_accessNative:::" + name);
                api.accessNative({
                    name: name,
                    extra: {}
                }, function (ret, err) {
                    console.log("err:::::" + JSON.stringify(err))
                });

            }


        },
        /**
         *  在打开文章详情,或是别类详情
         * @param name 窗口名称
         * @param url  模版地址
         * @param data 传参数据
         * @param e   扩展 是否可刷新  true or false
         */
        openW: function (name, url, data, e) {

            console.log("打开" + name);
            api.openWin({
                name: name,
                url: url,
                rect: {
                    x: 0,
                    y: 0,
                    w: 'auto',
                    h: 'auto'
                },
                pageParam: data,
                bounces: e,
                reload: false,
                animation: {
                    type: "push",                //动画类型（详见动画类型常量）
                    duration: 200                //动画过渡时间，默认300毫秒
                }

            });


        },
        /**
         * IOS 调用 原生 插件生成二维码 并返回   <img src="ssss.png">
         * @param data
         *          {
         *              txturl:""  // 生成二维码的内容
         *              imgurl:""  //中间的头像
         *              bigSize:240 //默认大小
         *              smallSize:40 //默认头像  大小
         *
         *              }
         * @param select   返回的插入的DIV.selector
         */
        //TODO IOS新加二维码生成 并返回 本地图片地址
        getNativeQrcode: function (data, select) {
            var nQrcode = api.require('ttqNative') || {};
            var edata = {
                txturl: data.txturl,
                imgurl: that.getStorage('userimg') || './upload/avatar_default.png',
                bigSize: data.bigSize || 240,
                smallSize: data.smallSize || 40
            };
            //生成一个图片并返回 html
            var inImg = document.createElement('img');
            nQrcode.qcoder(edata, function (ret) {
                if(ret.imageData){
                    inImg.src=ret.imageData
                    $(select).append(inImg);
                }else{
                    inImg.src='../image/05_01blankpage_img05.png';
                    $(select).append(inImg);
                    api.toast({
                        msg: '生成二维码失败',
                        duration: 2000,
                        location: 'bottom'
                    });
                }
            });

        }


    };


});