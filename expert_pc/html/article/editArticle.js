/**
 * Created by diogoxiang on 2016/6/1.
 * 编辑文章模块
 */

define(['text!html/default/header.html','text!html/article/edit.html','baidueditor','zeroclipboard','bdlang'], function (header_tpl,edit_tpl,UE,zcl) {
    window.ZeroClipboard = zcl;
    var headdata,token,form,headhtml,shtml,cropdata, ue;
    var article_title,
        article_description,
        article_content,
        article_crop,
        article_tag;
    var controller = function () {
        shtml=_.template(edit_tpl);
        headhtml= _.template(header_tpl);
        token=ck.get("token");
        console.log(token);
        var data=ck.getJSON("userinfo");
        if(data==undefined){
            headdata={
                isshow:0
            };
        }else{
            console.log(data);
            data.isshow=1;
            headdata= data;//转换数据
        }
        var pdata={
            token:token
        };

        $app.getAjax($app.apiurl.service.subscriptionList,pdata,successF,errorF);

        function successF(data){

            console.log(data);
            if(data.success){
                cropdata=data;
                appView.html(headhtml(headdata)+shtml(cropdata));
                ue = UE.getEditor('myeditor');
                initBtn();

            }else{
                appView.html(headhtml(headdata)+shtml({name:"000"}));
                 ue = UE.getEditor('myeditor');
                initBtn();
            }


        }

        function errorF(data){
            console.log(data)
            appView.html(headhtml(headdata)+shtml({name:"000"}));
             ue = UE.getEditor('myeditor');
            initBtn();
        }



        /**
         * 初始化按钮
         */
        function initBtn(){
            /**
             * 点击发布.
             */
            $('#sendPost').on('click',function(e){

                article_title=$('#article-title').val();
                article_description=$('#article-description').val();
                article_crop=$("#article-crop option:selected").val();
                article_content=ue.getContent();
                article_tag=$('#article-tag').val();

                _.isEmpty(article_title) && $app.layer.alert("帖子标题不能为空");
                _.isEmpty(article_description) && $app.layer.alert("摘要 不能为空");
                _.isEmpty(article_content) && $app.layer.alert("内容 不能为空");


                !$app.strLen(article_title,50) &&  $app.layer.alert("帖子标题不能超过25个字");
                !$app.strLen(article_description,100) && $app.layer.alert("摘要不能超过100个字");


                var sendData={
                    token:token,
                    source:'c4f3d10768bb66621f4a7899cea87df6',
                    topic:article_title,
                    digest:article_description,
                    subscriptionId:article_crop,
                    content:article_content,
                    labels:article_tag

                };


                console.log(article_content)

                $app.getAjax($app.apiurl.service.write_Article,sendData,successT,errorT);

            });
            /**
             * 点击取消
             */
            $('#btnCancel').on('click',function(e){
                console.log("btnCancel")
                history.back(-1);
            });
        }

        function successT(data){
            console.log(data)
            if(data.success){
                //询问框
                layer.confirm('发送成功', {
                    btn: ['返回首页','再发送一篇'] //按钮
                }, function(){
                    window.location='index.html?m=index'
                }, function(){
                     window.location.reload();
                });

            }else{
                $app.layer.alert(data.msg);
            }

        }

        function errorT(data){
            console.log(data)
            //window.location.reload();
        }

    };


    return  controller
});
