/**
 * Created by diogoxiang on 2016/6/23.
 */
define(['text!html/default/header.html', 'text!html/recommendMode/index.html','text!html/recommendMode/myrank.html','text!html/default/imgshow.html'], function (header_tpl, index_tpl,my_tpl,img_tpl) {

    var cnmae,
        headHtml,
        mainHtml,
        myHtml,
        imgHtml;


    var controller = function () {

        headHtml = _.template(header_tpl);
        mainHtml = _.template(index_tpl);
        myHtml= _.template(my_tpl);
        imgHtml= _.template(img_tpl);
        var headData={
            title:'专属二维码',//顶部Title
            leftAction:true,    //左侧 退回
            rightAction:true,   //是否显示 右侧
            rightText:'我的排名'
        };
        var data = {
            token: token
        };
        $app.getAjax($url.service.recommend_main, data, successF);

        appView.html(headHtml(headData) + mainHtml());
        //oneImgCahce();
        //downUimg('http://120.76.165.155:9085/userupload/20160414/CoolShow_Z000010.jpg','userimg')


    };

    function successF(data) {
        console.log(data)
        if(data.success){
            //生成二维码
            //存URL
            //
            $app.setStorage('shareUrl',data.data.shorturl);

           $app.drawQrcode(data.data.shorturl,240,'#myQcrode');


            btnAction();

            var adata={
                token:token
            }
            $app.getAjax($url.service.recommend_getReferrerRank, adata, successE);

        }else{
            console.log("00")
        }
    }

    /**
     * 输出我的推荐数据
     * @param data
     */
    function successE(data){
        console.log(data)
        if(data.success){
            var edata={
                isshow:1,
                data:data.data
            }
            $('#myRank').html(myHtml(edata))
            btnAction()
        }else{
            var edata={
                isshow:0
            }
            $('#myRank').html(myHtml(edata))
            btnAction()
        }

    }


    /**
     * 初始化. 一些点击动作  或重新绑定事件
     *
     */
    var btnAction=function(){
        $('#myQcrode').on('click',function(e){
           console.log(this)
            window.location.href='index.html?m=imgshow'
        });

        $('#goMyrank').on('click',function(e){
            console.log(this);


            /**
             * android 参数 :  com.ttq8.spmcard.activity.recommend.RecommendRecordActivity
             * IOS参数 : RecommendRecordVC
             */
            var goData;
            if(apicloud.version=="android"){
                goData={
                    name:"toNativeMode",
                    metainfo:'com.ttq8.spmcard.activity.recommend.RecommendRecordActivity',
                    extra:{
                        metainfo:'com.ttq8.spmcard.activity.recommend.RecommendRecordActivity'
                    }
                }

            }else{
                goData={
                    name:"toNativeMode",
                    metainfo:'RecommendRecordVC',
                    extra:{
                        metainfo:'RecommendRecordVC'
                    }
                }
            }
            $app.goAccessNative('gotoRecommend',goData)


        });


    };



    return controller
});