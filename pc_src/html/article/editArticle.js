/**
 * Created by diogoxiang on 2016/6/1.
 * 编辑文章模块
 */
define(['text!html/article/edit.html','baidueditor','zeroclipboard','bdlang'], function (tpl,UE,zcl) {
    window.ZeroClipboard = zcl;

    var controller = function () {
        var shtml=_.template(tpl);
        appView.html(shtml({name:"diogoxiang",page:"11"}))


        var ue = UE.getEditor('myeditor');

    };



    return  controller
});
