/**
 * Created by diogoxiang on 2016/5/30.
 */
define(['text!html/default/header.html','text!html/article/article.html','text!html/article/comment.html'], function (header_tpl,article_tpl,comment_tpl) {
    var headdata,token,form,headhtml,shtml,
        articleId;//文章ID
    var page=1; //当前评论页
    var pagesize=30;
    //默认帖子不存在
    var articleData,commentData;
    var controller = function () {
        shtml=_.template(article_tpl);
        headhtml= _.template(header_tpl);
        commentHtml= _.template(comment_tpl);
        token=ck.get("token");
        var data=ck.getJSON("userinfo");
        articleId=$app.getModel("id");
        form=$app.getModel("form");//来源
        if(form=='app' || isMoblie){
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
        //取文章信息
        var pdata={
              token:token,
              postid:articleId
        };
        //取评论信息
        var  cdata={
            token:token,
            postid:articleId,
            pageno:page,
            pagesize:pagesize
        };
        if(token || form!='app'){
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
                    articleData.createat==undefined   && ( articleData.createat=$app.formatDate(articleData.created));
                    if (token){
                        articleData.imgs == undefined && (articleData.imgs = 0);
                    }


                    console.log(articleData.author);

                    //获取数据成功后渲染页面
                    appView.html(headhtml(headdata) + shtml(articleData));
                    var des=$app.getStr(articleData.content,40)|| "田田圈让种植更轻松";
                    //更新 title.与description
                    modifyTitle(articleData.title,des);

                    hideMoblie();



                    if(token) {
                        $app.getAjax($app.apiurl.service.expert_article_comment, cdata, successS);
                    }else{
                        $app.getAjax($app.apiurl.service.post_clist, cdata, successS);
                    }



                }else if(data.code=="0008"){
                        ck.remove('token');
                        ck.remove('userinfo');
                        $app.layer.alert("请重新登录");
                        window.location='index.html?m=login';
                }else{
                    //当帖子不存在的时候显示空并返回上一页
                    articleData={isshow:0}
                    appView.html(headhtml(headdata)+shtml(articleData));
                    hideMoblie()
                }

        }
        function errorF(url,data){
            articleData={isshow:0};
            appView.html(headhtml(headdata)+shtml(articleData))
            hideMoblie()

        }
        //增加阅读数据
        $app.getAjax($app.apiurl.service.addread,pdata,successT);
        function successT(data){
            console.log(data)
        }

        function successS(data){
            console.log(data)
            if(data.success && token){
                commentData=data.data;
                for(var i=0;i<commentData.list.length;i++){
                    commentData.list[i].created=$app.formatDate(commentData.list[i].created);
                }
                commentData.isshow=1;
                appView.append(commentHtml(commentData));
            }else if(data.success){
                commentData=data;
                commentData.isshow=1;
                commentData.totalCount=data.num;
                commentData.list=data.data;
                for(var i=0;i<commentData.list.length;i++){
                    commentData.list[i].created=commentData.list[i].createat;
                    commentData.list[i].nickname=commentData.list[i].username;
                    if(commentData.list[i].parentid!="0"){
                        commentData.list[i].isComment=1;
                        commentData.list[i].comment={
                            nickname:commentData.list[i].parentname,
                            content:commentData.list[i].parentcomment
                        }
                    }
                }
                appView.append(commentHtml(commentData));
            }else{
                commentData={isshow:0}
                appView.append(commentHtml(commentData));
            }

        }

        /**
         * 默认显示 class= .am-isPC
         */
        function hideMoblie(){

            if(isMoblie){
                $('.am-isPC').hide();
                //$app.getFixed('am-ismoblie');
            }else {
                $('#am-ismoblie').hide();
                $('.am-ismb').hide();
                $('.am-isPC').show();
            }
        }

        /**
         * 更改 Title
         */
        function modifyTitle(title,des){
            var t= title || "田田圈让种植更轻松";
            var d= des   || "田田圈让种植更轻松";
            //更改title
            document.title=title;

            var metaArry=document.getElementsByTagName("meta");
            var head = document.getElementsByTagName('head')[0];
            //更改 description
            if(metaArry[4].name="description"){
                metaArry[4].content=des;
            }else{
                var metaDes=document.createElement("meta");
                metaDes.name="description";
                metaDes.content=des;

                head.appendChild(metaDes);
            }





        }


    };



    return  controller
});