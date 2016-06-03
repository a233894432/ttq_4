/**
 * Created by diogoxiang on 2016/5/30.
 */
define(['text!html/default/header.html','text!html/article/article.html'], function (header_tpl,article_tpl) {
    var headdata,token,form,headhtml,shtml,
        articleId;//文章ID
    //默认帖子不存在
    var articleData;
    var controller = function () {
        shtml=_.template(article_tpl);
        headhtml= _.template(header_tpl);
        token=ck.get("token");
        var data=ck.getJSON("userinfo");
        articleId=$app.getModel("id");
        form=$app.getModel("form");//来源
        if(form=='app'){
            headhtml= _.template("");
        }
        if(data==undefined){
            headdata={
                isshow:0
            };
        }else{
            console.log(data);
            data.isshow=1;
            headdata= data;//转换数据
        }
        console.log(articleId);
        var pdata={
              token:token,
              postid:articleId
        };

        if(token){
            $app.getAjax($app.apiurl.service.expert_detail,pdata,successF,errorF);
        }else{
            $app.getAjax($app.apiurl.service.post_detail,pdata,successF,errorF);
        }


        function successF(data){
            console.log(data)
                if(data.success) {
                    articleData = data.data;
                    articleData.isshow = 1;
                    console.log(articleData);

                    if (!articleData.title && articleData.type != "1") {
                        articleData.title = $app.getStr(articleData.content, 20)
                    }
                    articleData.author == undefined && (articleData.author = 0);
                    articleData.isImg == "0" && (articleData.imgs = articleData.postImg);
                    articleData.readnum == undefined && (articleData.readnum = articleData.readNum);
                    articleData.commentnum == undefined && (articleData.commentnum = articleData.commentNum);
                    articleData.praisenum == undefined && (articleData.praisenum = articleData.praiseNum);
                    articleData.sharenum == undefined && (articleData.sharenum = articleData.shareNum);

                    console.log(articleData.author);

                    //获取数据成功后渲染页面
                    appView.html(headhtml(headdata) + shtml(articleData));
                }else if(data.code=="0008"){
                        ck.remove('token');
                        ck.remove('userinfo');
                        $app.layer.alert("请重新登录");
                        window.location='index.html?m=login';
                }else{
                    //当帖子不存在的时候显示空并返回上一页
                    articleData={isshow:0}
                    appView.html(headhtml(headdata)+shtml(articleData));
                }

        }
        function errorF(url,data){
            articleData={isshow:0};
            appView.html(headhtml(headdata)+shtml(articleData))

        }

        $app.getAjax($app.apiurl.service.addread,pdata,successT);
        function successT(data){
            console.log(data)
        }

    };

    return  controller
});