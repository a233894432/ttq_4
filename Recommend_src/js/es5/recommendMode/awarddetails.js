/**
 * Created by diogoxiang on 2016/7/5.
 */
define(['text!html/default/header.html', 'text!html/recommendMode/awarddetails.html'],function (head_tpl,main_tpl) {
    /**
     * 初始化一些参数
      */
    var headHtml,
        mainHtml;
    var mainDate={
        isshow: 0  // 默认是不显示数据
    };
    var headData={
        title:'奖品详情',//顶部Title
        leftAction:true,    //左侧 退回
        rightAction:false,   //是否显示 右侧
        rightText:'我的奖品'
    };

    var controller=function(){
        headHtml = _.template(head_tpl);
        mainHtml = _.template(main_tpl);

        appView.html(headHtml(headData) + mainHtml(mainDate));
    };




    return controller
});