/**
 * Created by diogoxiang on 2016/6/24.
 */
define(['text!html/default/header.html', 'text!html/recommendMode/exchangeBonus.html'], function (header_tpl, main_tpl) {
    var cname,
        headHtml,
        mainHtml,
        headData;
    var mainDate={
        isshow: 0  // 默认是不显示数据
    }
    var controller = function () {
        headHtml = _.template(header_tpl);
        mainHtml = _.template(main_tpl);
        headData = {
            title: '申请兑奖',//顶部Title
            leftAction: true,    //左侧 退回
            rightAction: false,   //是否显示 右侧
            rightText: '我的排名'
        };

        var data = {
            token: token
        };
        $app.getAjax($url.service.recommend_getExchangeHistory, data, successF, errorF);


    };

    /**
     * 请求失败与超时的时候
     * @param data
     */

    function errorF(data) {
        appView.html(headHtml(headData) + mainHtml(mainDate));
    }

    function successF(data) {
        console.log(data)

        if (data.success) {
            mainDate = {
                isshow: 1,
                data: data.data
            }
            appView.html(headHtml(headData) + mainHtml(mainDate));
            AtionInit();
        } else {
            appView.html(headHtml(headData) + mainHtml(mainDate));
            AtionInit();
        }

    }

    /**
     * 初始化再执行的动作
     * @constructor
     */
    var AtionInit = function () {

        $('#sendExchange').on('click', function (num) {
            var data = {
                token: token,
                exchangenum: 100
            }
            console.log(this);
            $app.getAjax($url.service.recommend_exchangeBonus, data, successE);
        });


    };


    function successE(data) {
        console.log(data)
    }

    return controller;
});