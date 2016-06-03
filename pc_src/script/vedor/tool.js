/**
 * Created by diogoxiang on 2016/5/20.
 * modify  : 2016年5月30日15:44:55
 * version : 0.0.1 版本
 * anthor : diogoxiang
 */

define(['jquery', 'underscore', 'progress','domReady','layer','md5'], function ($, _,lod,doc,layer,md5) {

    /**
     * 使用 {{xx}}  模版
     * @type {{interpolate: RegExp}}
     */
    _.templateSettings = {
        evaluate    : /<%([\s\S]+?)%>/g,
        interpolate : /<%=([\s\S]+?)%>/g,
        escape      : /<%-([\s\S]+?)%>/g
    };
    //接口地址:
    var u = {};
    u.isdebug=true; //PC调试的开关,PC调试要为true
    u.deploy = {
        localhost:'http://localhost/api',//本地反向代理
        forecast:'http://ttkapi.ttq.com:900',//远程测试环境
        hxpreRelease:'http://ttc.ttq.com'//预发布地址 的核销权限地址
    };
    u.host = u.deploy.localhost; //现网接口

    u.version ="10";

    u.service = {
        //服务站接口
        store_alist: '/store/alist', // 8.1.活动商品列表
        checkCode:'/member/checkImgVaildCode', //验证图形码
        validatcode:'/member/validatcode',    //发送验正码
        simlogin:'/member/simlogin',            //登录
        expert_detail:'/post/expertArticleDetail', //专家文章详情
        expert_list:'/post/expertArticleList ',//专家文章列表
        write_Article:'/post/writeArticle', //发表文章
        subscriptionList:'/post/subscriptionList',//作物圈
        expert_article_del:'/post/expertArticleDel',// 删除专家文章

        addread:'/post/addread',                    //增加阅读数
    //   帖子类
        post_detail:'/post/detail'              //帖子详情
    };

    //提共接口外调
    return {
        version: '0.0.1',   //当前工具的版本
        progress:lod,
        layer:layer,
        md5:md5,
        apiurl:u,//把u 外漏
        /**
         * tool 工具初始化
         */
        init:function(){

            console.log("init");
            console.log("当前接口地址是"+ u.host);
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
        getUa:function(){
            var ua = window.navigator.userAgent.toLocaleLowerCase(), isApple = !!ua.match(/(ipad|iphone|mac)/i), isAndroid = !!ua.match(/android/i), isWinPhone = !!ua.match(/MSIE/i), ios6 = !!ua.match(/os 6.1/i),isWeixin=!!ua.match(/MicroMessenger/i);
            return { isApple: isApple, isAndroid: isAndroid, isWinPhone: isWinPhone, ios6: ios6,isweixin:isWeixin }
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
        isCellphone: function(str) {
            /**
             *@descrition:手机号码段规则
             * 13段：130、131、132、133、134、135、136、137、138、139
             * 14段：145、147
             * 15段：150、151、152、153、155、156、157、158、159
             * 17段：170、176、177、178
             * 18段：180、181、182、183、184、185、186、187、188、189
             *
             */
            var pattern =  /^(13[0-9]|14[57]|15[012356789]|17[0678]|18[0-9])\d{8}$/;
            return pattern.test(str);
        },
        /**
         * 简易AJAX封装
         * @param url
         * @param data
         * @param success
         * @param error
         */
        getAjax:function(url,data,success,errorF){
            var aurl = u.host + url;
            console.log("请求地址是:"+aurl);
            $.ajax({
                type: "POST",
                url: aurl,
                data: data,
                dataType:'json',
                timeout:5000,
                success: function(data){
                    //console.log( "Data Saved: " + data );
                    return success(data);
                },
                error:function(data){
                    if(_.isFunction(errorF)){
                        return errorF(url,data);
                    }else{
                        $app.getError(url,data);
                    }

                },
                complete:function(XMLHttpRequest, textStatus){
                    //console.log(XMLHttpRequest)
                    //console.log(textStatus)
                    //当前方法为.请求返回的详情
                }

            });


        },
        /**
         *
         */
        getError:function(url,data){
            console.log("出错的地址是:"+url+"::::"+"返回值是"+data);
        },
        /**
         * 检验用户是否已经登录
         */
        checkLogin:function(){
            console.log("检验用户是否已经登录")
            if(!ck.get("token")){
                window.location.href="index.html?m=login";
            }

        },
        /**
         * 用户退出 清除 cookies
         */
        userOut:function(){
            ck.remove('token');
            ck.remove('userinfo');
            window.location.href="index.html?m=login";
        },
        /**
         * 截取字符串
         * @param e
         * @param num
         * @returns {string}
         */
        getStr:function(e,num) {
            var more='';
            if(e.length >=12){
                more='...';
            }
            var data=e.substr(0,num) + more;
            return data.toString();
        },
        /**
         * 先启动APP, 如果启动不成功 则 打开下载链接 ,暂时有很多的APP的不行..但大部分原生的都已经支持了
         * @param url
         */
        openApp:function(url){
            var loadDateTime= _.now();
            setTimeout(function () {
                var timeOutDateTime = new Date();
                if (!loadDateTime || timeOutDateTime - loadDateTime < 2010) {
                    window.location.href = "http://bbs.ttq.com/dl";
                }
            },2000);
            //scheme : 固定为  SZTTQ1023319867
            window.location = 'SZTTQ1023319867://'+ url;

        },
        /**
         * 判断字符串长度
         * @param str
         * @param len
         */
        strLen:function(str,len){
            if(str.length < len){
                console.log(str.length+"----"+len);
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

        }




};



});