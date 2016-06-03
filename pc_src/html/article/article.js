/**
 * Created by diogoxiang on 2016/5/30.
 */
define(['text!html/default/header.html','text!html/article/article.html'], function (header_tpl,article_tpl) {
    var headdata;
    var controller = function () {
        var shtml=_.template(article_tpl);
        var headhtml= _.template(header_tpl);
            console.log(ck.get("token"));
        var data=ck.getJSON("userinfo");
        if(data==undefined){
            headdata={
                isshow:0
            }
        }else{
            console.log(data)
            data.isshow=1;
            headdata= data;//转换数据
        }

        console.log(data)
        appView.html(headhtml(headdata)+shtml({name:"diogoxiang",page:"11"}))

    };

    return  controller
});