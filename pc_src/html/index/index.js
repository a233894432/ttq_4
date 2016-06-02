/**
 * Created by diogoxiang on 2016/5/30.
 */
define(['text!html/default/header.html','text!html/index/index.html','text!html/default/footer.html'], function (header_tpl,main_tpl,foot_tpl) {

    var controller = function () {
        var shtml = _.template(main_tpl);
        var headhtml= _.template(header_tpl);
        console.log(ck.get("token"));
        var headdata=JSON.parse(ck.get("userinfo"));//转换数据
        console.log(headdata);

        appView.html(headhtml(headdata)+shtml({userinfo:headdata,listdata:"00022"})+foot_tpl);






    };

    return controller
});