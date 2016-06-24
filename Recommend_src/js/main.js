/**
 * Created by diogoxiang on 2016/5/20.
 */
'use strict';

(function (win) {
    //配置baseUrl
    //var baseUrl = document.getElementById('index').getAttribute('data-baseurl');
    var baseUrl="./";
    var mod,containerDiv;
    var checkLogin=true;//检查用户是否登录
    containerDiv=document.getElementById('container');
    var mode=['login','index','article','list','default','user','edit','about','rank','exchangeBonus'] ; //现有模块

    var isdebug=true; //是否开启debug 与开启 console.log
    //win.token='Y2sxNDY2NTgwODkwMTUy';//开发的时候

    win.token='Y2sxNDY2NzYxNzA2MzI4';
    /**
     *
     * @param str
     * @returns {string}
     */
    win.Log=function(str){
        if(isdebug){
            var args = Array.prototype.slice.call(arguments);
            args.unshift('(dio)');
            console.log.apply(console, args);

        }else{
            //开关 console.log
            window.console.log=function(str){
                return "";
            };
        }
    };

    /**
     * 取URL上面的参数
     * @param name
     * @returns {null}
     */
    var getMode= function (name) {
        var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
        var r = window.location.search.substr(1).match(reg);
        if (r != null) {
            return unescape(r[2]);
        }
        return null;
    };
    /**
     * 判断是否为现有模块
     * @param mode 模块数组
     * @param e    key值
     */
    var isInmode=function(arr,e){
        for(var i=0; i<arr.length; i++){
            if(arr[i] == e)
                return true;
        }
        return false;
    };
    /**
     * 指定 mod
     */
    if(isInmode(mode,getMode("m"))){
        mod=getMode("m");
    }else{
        mod="recommend";//用户默认跳转到 登录
    }
    console.log("当前模块:"+mod);
    if(mod=="article" || mod=="login" || mod=="about"){
        checkLogin=false
    }
    /**
     * 更新class
     */
    if(mod=="login"){
        containerDiv.className='am-loging-wrapper container-full';
    }else if(mod=="article" || mod=="edit" ){
        containerDiv.className='am-article-wrapper';
    }else{
        containerDiv.className='am-wrapper';
    }
    /*
     * 文件依赖
     */
    var config = {
        baseUrl: baseUrl,           //依赖相对路径
        paths: {                    //如果某个前缀的依赖不是按照baseUrl拼接这么简单，就需要在这里指出
            director: 'libs/director',
            zepto: 'libs/zepto.min', // 手机端用 zepto
            jquery:'libs/jquery-1.9.0.min', // PC端用 jquery
            underscore: 'libs/underscore',
            text: 'libs/text',             //用于requirejs导入html类型的依赖
            css: 'libs/css',             //用于requirejs导入html类型的依赖
            domReady:'libs/domReady',       //页面加载事件及DOM Ready
            layer:'libs/layer.min',         //弹窗
            progress:'libs/progress', //页面加载动画
            tool:'js/vendor/tool',  //工具箱
            api_amd:'js/vendor/api_amd', // apicloud的一些方法

            cookies:'libs/Cookies',
            md5:'libs/md5_require',//MD5加密
            //生成QRcode
            qrcode:'libs/jquery-qrcode',//生成QRcode

            //各功能模块的js
            recommend:'js/es5/recommendMode/index',
            rank:'js/es5/recommendMode/rank',
            exchangeBonus:'js/es5/recommendMode/exchangeBonus'
        },
        shim: {                     //引入没有使用requirejs模块写法的类库。
            underscore: {
                exports: '_'
            },
            zepto: {
                exports: '$'
            },
            director: {
                exports: 'Router'
            },
            layer:{
                deps: ['jquery']
            },
            cookies:{
                deps: ['jquery']
            },
            qrcode:{
                deps: ['jquery']
            }
        }
    };

    require.config(config);
    require(['jquery', 'underscore','tool',mod,'cookies'], function($, _, tool,mod,ck){
        win.appView = $('#container');      //用于各个模块控制视图变化
        win.$ = $;                          //暴露必要的全局变量，没必要拘泥于requirejs的强制模块化
        win._ = _;                          //暴露必要的全局变量，
        win.ck=ck;
        win.$app=tool;
        $app.init();
        //if(checkLogin){
        //    $app.checkLogin();
        //}
         mod();//页面初始化

        $app.endProgress(); //关闭动画

    });

    //暂时不用router
    //require(['jquery', 'script/router', 'underscore','tool'], function($, router, _, tool){
    //
    //    win.appView = $('#container');      //用于各个模块控制视图变化
    //    win.$ = $;                          //暴露必要的全局变量，没必要拘泥于requirejs的强制模块化
    //    win._ = _;                          //暴露必要的全局变量，
    //    router.init();                      //开始监控url变化
    //    tool.init();        //初始化工具  ,初始化页面加载
    //    //关闭动画
    //    // TODO progress 需要改造
    //    console.log(tool.version);
    //    tool.endProgress(); //关闭动画
    //
    //    //  test
    //    //    tool.layer.alert("ssss")
    //
    //
    //});

})(window);