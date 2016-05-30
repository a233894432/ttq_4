/**
 * Created by diogoxiang on 2016/5/30.
 */
define(['text!html/list/list.html'], function (tpl) {

    var controller = function () {
        var shtml=_.template(tpl);
        appView.html(shtml({name:"diogoxiang",page:"11"}))

    };

    return  controller
});