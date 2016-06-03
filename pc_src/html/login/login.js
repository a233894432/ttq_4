/**
 * Created by diogoxiang on 2016/5/30.
 */
define(['text!html/login/login.html'], function (tpl) {

    var controller = function () {
        var shtml=_.template(tpl);
        appView.html(shtml());
        if(ck.get("token")){
            window.location.href="index.html?m=index";
        }

        var isCodeTrue=false;
        var userphone,pcvcode,vcode;
        //第一步先校验手机与图形码
        $('#checkPcvode').on('click',function(e){
            e.preventDefault();
            userphone=$('#phone').val();//输入的手机号
           pcvcode=$('#pcvcode').val();
            if($app.isCellphone(userphone)){
                console.log(userphone + pcvcode);
                var data={
                    pcvcode:pcvcode
                };
                $app.getAjax($app.apiurl.service.checkCode,data,successF)

            }else{
                $app.layer.alert('请输入正确的手机号')
            }
        });

        /**
         * 提交登录
         */
        $('#regbtn').on('click',function(e){
            e.preventDefault();
            userphone=$('#phone').val();//输入的手机号
            pcvcode=$('#pcvcode').val();
            vcode=$('#vcode').val();
            var pid="0000";
            if($app.isCellphone(userphone)){
                console.log(userphone + pcvcode);
                var data={
                    phone:userphone,
                    vcode:vcode,
                    pid:pid,
                    source:"c4f3d10768bb66621f4a7899cea87df6",
                    pcvcode:pcvcode,
                    check:$app.md5(userphone+pid+vcode)
                };
                console.log(data.check);

                $app.getAjax($app.apiurl.service.simlogin,data,successLogin)

            }else{
                $app.layer.alert('请输入正确的手机号或是验证码')
            }

        });


        /**
         * 校验图形验证码 并发送短信
         * @param data
         */
       function successF(data){
           console.log(data);
            if (data.success){
                var check=$app.md5(userphone+"_check");
                console.log(check);
                var data={
                    phone:userphone,
                    check:check
                };
                $app.getAjax($app.apiurl.service.validatcode,data,successV);


            }else{
                console.log(data.msg)
                $app.layer.alert("输入的图形码有错请重新输入")
            }



       }

        /**
         * 发送验证码成功
         * @param data
         */
        function successV(data){
            console.log(data);
            if(data.code=="0000"){
                $app.layer.alert("发送验证码成功.请注意查收")
            }else {
                $app.layer.alert(data.msg)
            }

        }

        /**
         *登录成功后
         * @param data
         */
        function successLogin(data){
            console.log("请求成功------");
            console.log(data)
            if(data.code=="0000"){
                /**
                 * 登录成功存储登录信息
                 */
                ck.set("token",data.token);
                ck.set("userinfo",data.user)
                //跳转到首页
                window.location.href="index.html?m=index";

            }else{
                $app.layer.alert(data.msg)
            }


        }

    };

    return  controller
});