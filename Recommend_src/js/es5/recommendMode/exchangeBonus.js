/**
 * Created by diogoxiang on 2016/6/24.
 */
define(['text!html/default/header.html', 'text!html/recommendMode/exchangeBonus.html'], function (header_tpl, main_tpl) {
    var cname,
        headHtml,
        mainHtml,
        headData,
        mNum=1000,// 默认对换1000=10元
        myBonus=0;
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
            };
            myBonus=data.data.bonus || 0;
            appView.html(headHtml(headData) + mainHtml(mainDate));
            AtionInit();
        } else {
            appView.html(headHtml(headData) + mainHtml(mainDate));
            AtionInit();
        }

    }

    /**
     * 如果不是10的倍数 则 false
     * @param e
     * @returns {boolean}
     */
    var pareExchange=function pareExchange(e){
        console.log("ss");
        if(e % 10 == 0){
            return true
        }else{
           return false
        }
    };
    /**
     * 初始化再执行的动作
     * @constructor
     */
    var AtionInit = function () {

        $('#sendExchange').on('click', function (num) {

            mNum=parseInt($('#exchangeNum').val()) || 100;
            var e= _.isNumber(parseInt($('#exchangeNum').val()));
            var data = {
                token: token,
                exchangenum: mNum*100
            }

            if(e && pareExchange(mNum) && (mNum*100 <= myBonus)){
                console.log(myBonus);
                $app.getAjax($url.service.recommend_exchangeBonus, data, successE);
            }else if(e && pareExchange(mNum) && (mNum*100 >myBonus)){
                $app.layer.msg("你没有那么多钱申请兑换");
            }else{
                $app.layer.msg("请输入10的倍数");
            }

        });

        $('#minusAction').on('click',function(){
            mNum= parseInt($('#exchangeNum').val()) || 100;
            if(mNum<0){
                $('#exchangeNum').val(0)
                return false
            }

            var e= _.isNumber(mNum);
            if(e&&pareExchange(mNum)){
                $('#exchangeNum').val(mNum-10)
            }else{
                $app.layer.msg("请输入10的倍数");
            }

        });

        $('#addAction').on('click',function(){
            mNum= parseInt($('#exchangeNum').val()) || 100;
            var e= _.isNumber(mNum);
            if(e&&pareExchange(mNum)){
                $('#exchangeNum').val(mNum+10)
            }else{
                $app.layer.msg("请输入10的倍数");
            }


        });



    };


    function successE(data) {
        console.log(data);
        if(data.success){
            $app.layer.msg("申请成功,等待审核");
            myBonus=myBonus - parseInt($('#exchangeNum').val())*100;

            console.log(myBonus);


            var newmyBonus=myBonus/100;

                var lshtml='<li><span class=\"col-xxs-5 pt10\">'+'<p class=\"text-xxs-pull\">'+data.data.order+'</p>'+
                '<p class=\"text-xxs-pull\">'+data.data.create_at+'</p> </span>'+
                    '<span class=\"col-xxs-4\">'+$app.formatMoney(data.data.bonus)+'元</span>'+
                    '<span class=\"col-xxs-3 tcolor2\">'+$app.formatStatus(data.data.status)+'</span></li>'

            $('#historyList').prepend(lshtml);
            console.log(newmyBonus);
            if(isNaN(newmyBonus) && newmyBonus==0){
                newmyBonus=0;
            }
            $('#myBonus').text(newmyBonus)
        }else{
            $app.layer.msg(data.msg)
        }

    }

    return controller;
});