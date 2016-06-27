/**
 * Created by diogoxiang on 2016/5/20.
 * modify  : 2016年5月30日15:44:55
 * version : 0.0.1 版本
 * anthor : diogoxiang
 */

define(['jquery', 'underscore', 'progress', 'domReady', 'layer', 'md5','qrcode'], function ($, _, lod, doc, layer, md5,qrcode) {

    /**
     * 使用 {{xx}}  模版
     * @type {{interpolate: RegExp}}
     */
    _.templateSettings = {
        evaluate: /<%([\s\S]+?)%>/g,
        interpolate: /<%=([\s\S]+?)%>/g,
        escape: /<%-([\s\S]+?)%>/g
    };



    //提共接口外调
    return {
        version: '0.0.1',   //当前工具的版本
        progress: lod,
        layer: layer,
        md5: md5,
        qrcode:qrcode,
        /**
         * tool 工具初始化
         */
        init: function () {
            Log("init");
            Log("当前接口地址是" + $url.host);
            //检查用户是否登录
            //this.checkLogin();
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


        is_weixin:function(){
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
                        $app.getError(url, data);
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
            console.log("出错的地址是:" + url + "::::" + "返回值是" + data);
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

            if(isWeixin){
                /**
                 * 微信打开提示窗
                 */
                $('#weixin-tip').show();
                $('#close').on('click',function(){
                    $('#weixin-tip').hide();
                });

            }else{
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
        formatDatetoU:function(dateStr) {
            var newstr = dateStr.replace(/-/g,'/');
            var date =  new Date(newstr);
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
                    headDom.style.opacity = op+0.2;
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
        log:function(str){
                var args = Array.prototype.slice.call(arguments);
                args.unshift('(app)');
                console.log.apply(console, args);
        },

        /**
         * getBase64Image 获取base64
         * @param img
         * @returns {string}
         */

        getBase64Image:function (img) {
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
        formatMoney:function(num){

            //num = num.toString().replace(/\$|\,/g,'');
            if(isNaN(num)){
                num=0;
            }
            num=parseInt(num)/100;//以整型计算
            return num
        },

        /**
         * 格式化 兑奖的状态
         * @param e    status 状态 0、待审核  1、已兑换
         */
        formatStatus:function(e){
            if(isNaN(e)){
                e=0;
                return "待审核";
            }
            if(e==1){
                return "已兑换";
            }else{
                return "待审核";
            }
        },
        /**
         * 格式化 兑奖时间
         * @param dataStr
         */
        getExchangeTime:function(dataStr){
            var newtime=this.formatDatetoU(dataStr);
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

            return  fixZero(time.getMonth() + 1, 2) + "月" + fixZero(time.getDate(), 2) + "日" + fixZero(time.getHours(), 2) + ":" + fixZero(time.getMinutes(), 2);

        },

        /**
         * 返回或是关闭当前面
         */
        goBack: function (e, name) {
            if (isdebug) {
                window.history.back(-1);
            } else {

                if (e == "win") {
                    api.closeWin(
                        {
                            name: name
                        }
                    );
                } else {
                    api.closeFrame(
                        {
                            name: name
                        }
                    );
                }


            }



        }


    };


});