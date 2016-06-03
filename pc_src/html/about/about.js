/**
 * Created by diogoxiang on 2016/5/30.
 */
define(['text!html/about/about.html','text!html/about/expert.html'], function (about_tpl,expert_tpl) {

    var cname,//c的名称
        tpl,
        shtml;

    var controller = function () {

        cname=$app.getModel("c");
        if(cname=="about"){
            shtml=_.template(about_tpl);
        }else{
            shtml=_.template(expert_tpl);
        }


        appView.html(shtml({name:"diogoxiang",page:"11"}))



    };

    return  controller
});