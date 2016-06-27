/**
 * Created by diogoxiang on 2016/3/7.
 */
(function(window){
    'use strict';
    var u = {};
    u.isdebug=true; //PC调试的开关,PC调试要为true
    u.deploy = {
        online: 'http://ttk.ttq8.com:9086',//现网PHP接口
        test:'http://172.168.3.207:900', //本地测试接口
        localhost:'http://localhost:82/api',//Nginx 反代
        forecast:'http://120.76.165.155:900',//远程测试环境
        hxforecast:'http://120.76.165.155:94',//远程测试环境 的核销权限地址
        hxpreRelease:'http://ttc.ttq.com',//预发布地址 的核销权限地址
        preRelease:'http://112.74.143.113:9086'//预发布地址

    };
    u.host = u.deploy.localhost; // 接口地址

    u.version ="11";//小版本 主要用于 区别 IOS 审核

    u.appversion="4";//APP 大版本

    u.isAndroid= (/android/gi).test(navigator.appVersion); //用于判断 os

    u.service = {
        //抢购模块接口
        store_alist: '/store/alist', // 8.1.活动商品列表
        store_adetail:'/store/adetail',//8.2.活动商品详情
        store_order:'/store/order',//8.3.订单生成
        store_order_detail:'/store/order_detail', //8.4.订单详情
        store_order_cancelOrder:'/order/cancleOrder',//8.7.取消订单
        store_wpay_conf:"/wpay/wpayconf", //8.5.微信支付的配置
        post_groupBuyOrder:'/order/orderList',
        cancelOrder:'/order/cancelOrder',
        //服务站的接口
        post_myplist:'/post/myplist',//7.11.发帖列表（我的）
        post_myclist:'/post/myclist',//7.20.我的回复
        post_mybclist:'/post/mybclist',//7.21.评论我的
        post_myFocus:'/post/myFocus',//7.12.关注列表
        post_focusExpert:'/post/focusExpert',//7.9.点击关注/取消关注专家号
        post_focussp:'/post/focussp',//7.10.点击关注/取消关注订阅号
        post_collectionList:'/post/collectionList',//7.23.帖子收藏列表
        post_collection:'/post/collection',//7.24.帖子收藏
        post_cancelCollection:'/post/cancelCollection',//取消收藏
        //首页banner 广告接口
        ad_index_banner:'/ad/topList',
        //推荐模块
        recommend_main:'/recommend/main',//推荐
        recommend_getReferrerRank:'/recommend/getReferrerRank',//4.7.7.店长推荐排名
        recommend_getExchangeHistory:'/recommend/getExchangeHistory',//4.7.8.历史兑换接口
        recommend_exchangeBonus:'/recommend/exchangeBonus'    //4.7.9.兑换接口
    };


    //ajax
    u.getAjax = function(url,data,successFun, errFun, ajaxType) {
        console.log('ajax' + '---------------开始');
        console.log(url);
        api.ajax({
            data:{values:data},
            url:url,
            method:ajaxType,
            timeout:30
        },function(result,err){
            if(result){
                return successFun(result);
            }else{
                return errFun(err);
            }
        });
    };
    /**
     * 带文件上传的 Ajax
     * @param url
     * @param data
     * @param successFun
     * @param errFun
     * @param ajaxType
     * @param files
     */
    u.getAjaxText = function(url,data,successFun, errFun, ajaxType,files) {
        console.log('ajax' + '---------------开始');
        console.log(url);
        api.ajax({
            data:{values:data,files:files},
            url:url,
            method:ajaxType,
            timeout:30
        },function(result,err){
            //alert(JSON.stringify(result))
            if(result){
                return successFun(result);
            }else{
                return errFun();
            }
        });
    };



    window.$url=u;

    /**
     * 控制全局的alert
     * @type {boolean} true 关闭
     */
    var isalert=false;
    if(isalert){
        window.alert=function(txt){
            return txt;
        }
    }
    //服务站ajax封装
    var data = {
        requestdata:function(url,argument,callback){
            var urls = u.host+'/'+url;//测试请求地址
            console.log(urls);
            api.ajax({
                url:urls,
                method: 'post',
                cache: true,
                timeout: 20,
                data: {
                    values: argument
                }
            },function(ret,err){
                if(ret){
                    if (ret.code == '0008'){
                        toLoginModule(callback);
                    }else{
                        !!ret && typeof callback === 'function' && callback(ret,err);
                    }
                }else{
                    api.toast({
                        msg: err.msg,
                        duration: 2000,
                        location: 'bottom'
                    });
                }
            });
        },
        updataPic:function(url,argument,callback){
            api.showProgress({
                style: 'default',
                animationType: 'fade',
                text: '上传中。。。',
                modal: true
            });
            var urls = u.host+'/'+url;//测试请求地址
            console.log(urls);
            api.ajax({
                url:urls,
                method: 'post',
                cache: true,
                timeout: 20,
                data: argument
            },function(ret,err){
                api.hideProgress();
                !!ret && typeof callback === 'function' && callback(ret,err);
            });
        },
        getLoginStatus:function(callback){
            var ttq = api.require('ttqPlugin');
            var login = arguments[1];
            ttq.isLogin(function(ret){
                if(ret.isLogin){
                    ttq.getToken(function(ret){
                        var token = ret.token;
                        !!ret && typeof callback === 'function' && callback(token);
                    });
                }else if(!login){
                    toLoginModule(callback);
                }else{
                    !!ret && typeof callback === 'function' && callback();
                }
            });
        }
    };
    window.data = data;

})(window);