/**
 * Created by diogoxiang on 2016/5/20.
 * modify  : 2016年5月30日15:44:55
 * version : 0.0.1 版本
 * anthor : diogoxiang
 */

define(['zepto', 'underscore', 'progress','domReady'], function ($, _,lod,doc) {
    //默认开启顶部加载进度条

    /**
     * 使用 {{xx}}  模版
     * @type {{interpolate: RegExp}}
     */
    _.templateSettings = {
        interpolate: /\{\{(.+?)\}\}/g
    };

    return {
        version: '0.0.1',   //当前工具的版本
        progress:lod,
        /**
         * tool 工具初始化
         */
        init:function(){

            console.log("init")

        },
        /**
         * endProgress
         */
        endProgress: function () {

            lod().end();
            //if (window.attachEvent) {
            //    window.attachEvent('onload', function () {
            //        lod().end();
            //    });
            //} else {
            //    if (window.onload) {
            //        var curronload = window.onload;
            //        var newonload = function () {
            //            curronload();
            //            lod().end();
            //        };
            //        window.onload = newonload;
            //    } else {
            //        console.log("window.onload")
            //        window.onload = function () {
            //            lod().end();
            //        };
            //    }
            //}
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
        }


    };



});