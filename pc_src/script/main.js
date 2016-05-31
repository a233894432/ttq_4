/**
 * Created by diogoxiang on 2016/5/20.
 */
'use strict';

(function (win) {
    //配置baseUrl
    //var baseUrl = document.getElementById('index').getAttribute('data-baseurl');
    var baseUrl="./";
    /*
     * 文件依赖
     */
    var config = {
        baseUrl: baseUrl,           //依赖相对路径
        paths: {                    //如果某个前缀的依赖不是按照baseUrl拼接这么简单，就需要在这里指出
            director: 'libs/director',
            zepto: 'libs/zepto.min', // 手机端用 zepto
            jquery:'libs/jquery.min', // PC端用 jquery
            underscore: 'libs/underscore',
            text: 'libs/text',             //用于requirejs导入html类型的依赖
            domReady:'libs/domReady',       //页面加载事件及DOM Ready
            layer:'libs/layer.min',         //弹窗
            progress:'libs/progress', //页面加载动画
            tool:'script/vedor/tool',  //工具箱
            api_amd:'script/vedor/api_amd' // apicloud的一些方法
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
            }
        }
    };

    require.config(config);
    require(['jquery', 'script/router', 'underscore','tool'], function($, router, _, tool){

        win.appView = $('#container');      //用于各个模块控制视图变化
        win.$ = $;                          //暴露必要的全局变量，没必要拘泥于requirejs的强制模块化
        win._ = _;                          //暴露必要的全局变量，
        router.init();                      //开始监控url变化
        tool.init();        //初始化工具  ,初始化页面加载
        //关闭动画
        // TODO progress 需要改造
        console.log(tool.version);
        tool.endProgress(); //关闭动画

        //  test
        //    tool.layer.alert("ssss")


    });

})(window);