/**
 * Created by diogoxiang on 2016/5/30.
 */
define(['text!html/default/header.html', 'text!html/index/index.html', 'text!html/default/footer.html'], function (header_tpl, main_tpl, foot_tpl) {
    var headdata, shtml, headhtml, token,plistdata;
    var controller = function () {
        shtml = _.template(main_tpl);
        headhtml = _.template(header_tpl);
        console.log(ck.get("token"));
        token=ck.get("token");
        var data = ck.getJSON("userinfo");
        if (data == undefined) {
            headdata = {
                isshow: 0
            }
        } else {
            console.log(data)
            data.isshow = 1;
            headdata = data;//转换数据
        }
        var pdata = {
            token: token
        };

        $app.getAjax($app.apiurl.service.expert_list, pdata, successF, errorF);

        function successF(data){

            console.log(data);
            if(data.success){
                plistdata=data.data;

                appView.html(headhtml(headdata) + shtml({userinfo: headdata, listdata: plistdata}) + foot_tpl);
            }else{

                appView.html(headhtml(headdata) + shtml({userinfo: headdata, listdata: "00022"}) + foot_tpl);
            }





        }

        function errorF(data){
            console.log(data);

            appView.html(headhtml(headdata) + shtml({userinfo: headdata, listdata: "00022"}) + foot_tpl);

        }




    };

    return controller
});