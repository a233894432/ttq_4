/**
 * Created by diogoxiang on 2016/6/24.
 */
define(['text!html/default/header.html', 'text!html/recommendMode/rank.html'],function (header_tpl, rank_tpl) {
    var cname,
        headHtml,
        mainHtml;
    var controller=function(){
        headHtml = _.template(header_tpl);
        mainHtml = _.template(rank_tpl);
        var headData={
            title:'店长推荐排名',//顶部Title
            leftAction:true,    //左侧 退回
            rightAction:false,   //是否显示 右侧
            rightText:'我的排名'
        };
        var mainDate={
            isshow:0  // 默认是不显示数据
        };
        var data = {
            token: token
        };
        $app.getAjax($url.service.recommend_getReferrerRank, data, successF,errorF);

        function successF(data) {
            console.log(data)

            if(data.success){
                mainDate={
                    isshow:1,
                    data:data.data
                }
                appView.html(headHtml(headData) + mainHtml(mainDate));

            }else{

                appView.html(headHtml(headData) + mainHtml(mainDate));
            }

        }

        /**
         * 请求失败与超时的时候
         * @param data
         */

        function errorF(data){

            appView.html(headHtml(headData) + mainHtml(mainDate));
        }




    };
    return controller;
});