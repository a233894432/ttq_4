<?php

require_once './Library/AliyunUpload.class.php';
/**
 * Created by JetBrains PhpStorm.
 * User: taoqili
 * Date: 12-7-18
 * Time: 上午11: 32
 * UEditor编辑器通用上传类
 */
class Uploader
{
    private $fileField; //文件域名
    private $file; //文件上传对象
    private $base64; //文件上传对象
    private $config; //配置信息
    private $oriName; //原始文件名
    private $fileName; //新文件名
    private $fullName; //完整文件名,即从当前配置目录开始的URL
    private $filePath; //完整文件名,即从当前配置目录开始的URL
    private $fileSize; //文件大小
    private $fileType; //文件类型
    private $stateInfo; //上传状态信息,
    private $stateMap = array( //上传状态映射表，国际化用户需考虑此处数据的国际化
        "SUCCESS", //上传成功标记，在UEditor中内不可改变，否则flash判断会出错
        "文件大小超出 upload_max_filesize 限制",
        "文件大小超出 MAX_FILE_SIZE 限制",
        "文件未被完整上传",
        "没有文件被上传",
        "上传文件为空",
        "ERROR_TMP_FILE" => "临时文件错误",
        "ERROR_TMP_FILE_NOT_FOUND" => "找不到临时文件",
        "ERROR_SIZE_EXCEED" => "文件大小超出网站限制",
        "ERROR_TYPE_NOT_ALLOWED" => "文件类型不允许",
        "ERROR_CREATE_DIR" => "目录创建失败",
        "ERROR_DIR_NOT_WRITEABLE" => "目录没有写权限",
        "ERROR_FILE_MOVE" => "文件保存时出错",
        "ERROR_FILE_NOT_FOUND" => "找不到上传文件",
        "ERROR_WRITE_CONTENT" => "写入文件内容错误",
        "ERROR_UNKNOWN" => "未知错误",
        "ERROR_DEAD_LINK" => "链接不可用",
        "ERROR_HTTP_LINK" => "链接不是http链接",
        "ERROR_HTTP_CONTENTTYPE" => "链接contentType不正确",
        "INVALID_URL" => "非法 URL",
        "INVALID_IP" => "非法 IP",
        "ERROR_UPLOAD"=>'文件上传失败',
    );
    private $aliyun;

    /**
     * 构造函数
     * @param string $fileField 表单名称
     * @param array $config 配置项
     * @param bool $base64 是否解析base64编码，可省略。若开启，则$fileField代表的是base64编码的字符串表单名
     */
    public function __construct($fileField, $config, $type = "upload")
    {
        $this->aliyun = new AliyunUpload();
        $this->fileField = $fileField;
        $this->config = $config;
        $this->type = $type;
        if ($type == "remote") {
            $this->saveRemote();
        } else if($type == "base64") {
            $this->upBase64();
        } else {
            $this->upFile();
        }

        $this->stateMap['ERROR_TYPE_NOT_ALLOWED'] = iconv('unicode', 'utf-8', $this->stateMap['ERROR_TYPE_NOT_ALLOWED']);
    }

    /**
     * 上传文件的主处理方法
     * @return mixed
     */
    private function upFile()
    {
        $file = $this->file = $_FILES[$this->fileField];
        if (!$file) {
            $this->stateInfo = $this->getStateInfo("ERROR_FILE_NOT_FOUND");
            return;
        }
        if ($this->file['error']) {
            $this->stateInfo = $this->getStateInfo($file['error']);
            return;
        } else if (!file_exists($file['tmp_name'])) {
            $this->stateInfo = $this->getStateInfo("ERROR_TMP_FILE_NOT_FOUND");
            return;
        } else if (!is_uploaded_file($file['tmp_name'])) {
            $this->stateInfo = $this->getStateInfo("ERROR_TMPFILE");
            return;
        }

        $this->oriName = $file['name'];
        $this->fileSize = $file['size'];
        $this->fileType = $this->getFileExt();
        $this->fullName = $this->getFullName();
        $this->filePath = $this->getFilePath();
        $this->fileName = $this->getFileName();
        $dirname = dirname($this->filePath);

        //检查文件大小是否超出限制
        if (!$this->checkSize()) {
            $this->stateInfo = $this->getStateInfo("ERROR_SIZE_EXCEED");
            return;
        }

        //检查是否不允许的文件格式
        if (!$this->checkType()) {
            $this->stateInfo = $this->getStateInfo("ERROR_TYPE_NOT_ALLOWED");
            return;
        }

        //创建目录失败
        if (!file_exists($dirname) && !mkdir($dirname, 0777, true)) {
            $this->stateInfo = $this->getStateInfo("ERROR_CREATE_DIR");
            return;
        } else if (!is_writeable($dirname)) {
            $this->stateInfo = $this->getStateInfo("ERROR_DIR_NOT_WRITEABLE");
            return;
        }

        //移动文件
        if (!(move_uploaded_file($file["tmp_name"], $this->filePath) && file_exists($this->filePath))) { //移动失败
            $this->stateInfo = $this->getStateInfo("ERROR_FILE_MOVE");
        } else { //移动成功
            if(in_array($this->fileType,array(".png", ".jpg", ".jpeg", ".gif"))) {
                $this->uploadImg($this->filePath);
            }else{
                $this->stateInfo = $this->stateMap[0];
            }
        }
    }

    /**
     * 上传图片至远程服务器
     * @author tianbin
     * @date 2016-05-24
     * @param $filePath
     */
    private function uploadImg($filePath)
    {
        //上传图片到阿里云
        //$result = $this->invoke_curl_img(array('acessToken'=>$this->config['uploadImgAcessToken'],'image'=>'@'.$filePath));
        //重命名文件

        $info = getimagesize($filePath);
        //文件重命名
        $fileInfo = pathinfo($filePath);
        $newName = $fileInfo['dirname'].'/'.$fileInfo['filename'].'_wh_'.$info[0].'_'.$info[1].'.'.$fileInfo['extension'];
        $result = rename($filePath,$newName);
        if($result) {
            $filePath = $newName;
        }

        $data = array();
        /*$data['acessToken'] = $this->config['uploadImgAcessToken'];
        $data['width'] = $info[0];
        $data['height'] = $info[1];
        $data['image'] = $filePath;*/



        $sourceUrl = 'http://'. $this->uploadCloud($filePath);
        $img = pathinfo($filePath);
        $w = 800;
        if($info[0] > $w) {//只压缩宽
            //计算等比
            $scale = $w/$info[0];
            $width = ceil($info[0]*$scale);
            $height = ceil($info[1]*$scale);
            $sourceUrl = $this->getAliyunThumb($sourceUrl,$width,$height);
        }

       /*

        //中图不在此处生成，另写脚本生成图片
        $middleImg = $this->cutImageResize($this->getAliyunThumb($sourceUrl,450,450),400,400,$fileInfo['dirname'].'_middle/',$img['basename']);
        $data['acessToken'] = $this->config['uploadImgAcessToken'];
        $data['sourceUrl'] = $sourceUrl;
        $data['middleUrl'] = $middleImg;*/

        $this->fullName = $sourceUrl;
        $this->stateInfo = $this->stateMap[0];

      /*  $result = $this->invoke_curl_img($data);
        $result = json_decode(($result),true);*/
      /*  if($result['code'] == '0000') {
            $w = 800;
            if($info[0] > $w) {//只压缩宽
                //计算等比
                $scale = $w/$info[0];
                $width = ceil($info[0]*$scale);
                $height = ceil($info[1]*$scale);
                $sourceUrl = $this->getAliyunThumb($sourceUrl,$width,$height);
            }
            $this->fullName = $sourceUrl;
            $this->stateInfo = $this->stateMap[0];
        } else {
            //失败
            $this->stateInfo = $this->getStateInfo("ERROR_UPLOAD");
        }*/
        //删除原图,该处不能操作删除，因还要上传方形图
        //@unlink($filePath);
    }

    function getAliyunThumb($url, $width, $height) {
        $suffixArray = explode('.',$url);
        $suffix = strtolower($suffixArray[count($suffixArray)-1]);
        $thumb = $url . "@1e_{$width}w_{$height}h_0c_0i_1o_100Q_1x." . $suffix;
        return $thumb;
    }
    /**
     * 上传图片至阿里云
     * @param $filePath
     * @param $thumb
     * @return mixed|返回上传后的url
     */
    function uploadCloud($filePath,$thumb) {
        $url = $this->aliyun->putFile($filePath);
        if($thumb){
            $url = str_replace('http://', '', getAliyunThumb($url,900));//编辑器图片超过900等比例缩放到900px
        }
        return $url;
    }

    /**
     * 裁剪正方形图保存
     * @param $sourceImg 原图地址
     * @param $width 裁剪宽
     * @param $height 裁剪高
     * @param null $saveFileDir 保存路径
     * @param null $filename 文件名
     * @return null|string
     */
    public function cutImageResize($sourceImg,$width, $height,$saveFileDir = null,$filename = null)
    {
        $temp = array(1=>'gif', 2=>'jpeg', 3=>'png',6=>'bmp');
        $info = getimagesize($sourceImg);
        $fWidth = $info[0];
        $fHeight = $info[1];
        $imageType = $info[2];//1 = GIF，2 = JPG，3 = PNG 6 = BMP
        $mime = $info['mime'];
        if(!in_array($imageType,array(1,2,3,6))) {
            return null;
        }
        $tmp = $temp[$imageType];
        $infunc = "imagecreatefrom$tmp";
        $outfunc = "image$tmp";
        $fimg = $infunc($sourceImg);

        $minWidth = min($fWidth,$width);
        $minHeight = min($fHeight,$height);
        if($minWidth > $minHeight) {
            $height = $minHeight;
            $width = $minHeight;
        } else {
            $height = $minWidth;
            $width = $minWidth;
        }

        // 把图片铺满要缩放的区域
        if($fWidth/$width > $fHeight/$height){
            $zh = $height;
            $zw = $zh*($fWidth/$fHeight);
            $_zw = ($zw-$width)/2;
        }else{
            $zw = $width;
            $zh = $zw*($fHeight/$fWidth);
            $_zh = ($zh-$height)/2;
        }
        $zimg = imagecreatetruecolor($zw, $zh);
        //创建白色画布
        imagefill($zimg, 0, 0,imagecolorallocate($zimg, 255,255,255));
        // 先把图像放满区域
        imagecopyresampled($zimg, $fimg, 0,0, 0,0, $zw,$zh, $fWidth,$fHeight);

        // 再截取到指定的宽高度
        $timg = imagecreatetruecolor($width, $height);
        imagefill($timg, 0, 0, imagecolorallocate($timg, 255,255,255));
        imagecopyresampled($timg, $zimg, 0,0, 0+$_zw,0+$_zh, $width,$height, $zw-$_zw*2,$zh-$_zh*2);

        $name = strstr($filename,'wh_',true);
        $extName = strstr($filename,'.');
        if(empty($name)) {
            $name = strstr($filename,'.',true);
            $filename = $name.'_wh_'.$width.'_'.$height.$extName;
        } else {
            $filename = $name.'wh_'.$width.'_'.$height.$extName;
        }
        //创建目录
        mkdir($saveFileDir, 0777, true);
        $filename = $saveFileDir.$filename;
        switch ($imageType)
        {
            case 1  :
                imagegif($timg,$filename);
                break;
            case 2 :
                imagejpeg($timg, $filename, 100);
                break;
            case 3  :
                imagepng($timg, $filename, 0);
                break;
            case 6  :
                image2wbmp($timg, $filename, 0);
                break;
        }
        imagedestroy($timg);
        imagedestroy($zimg);
        $imgUrl =  'http://'. $this->uploadCloud($filename);
        //删除本地原图
        /* @unlink($sourceImg);
        @unlink($filename);*/
        return $imgUrl;
    }

    /**
     * 上传图片至远程服务器
     * @author tianbin
     * @date 2016-05-24
     * @param $data
     * @return mixed
     */
    private function invoke_curl_img($data)
    {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_HTTP_VERSION, CURL_HTTP_VERSION_1_0);
        curl_setopt($ch,CURLOPT_URL,$this->config['uploadImgApiService']);
        curl_setopt($ch,CURLOPT_RETURNTRANSFER,true);
        curl_setopt($ch,CURLOPT_POST,true);
        curl_setopt($ch,CURLOPT_POSTFIELDS,$data);
        return curl_exec($ch);
    }

    /**
     * 处理base64编码的图片上传
     * @return mixed
     */
    private function upBase64()
    {
        $base64Data = $_POST[$this->fileField];
        $img = base64_decode($base64Data);

        $this->oriName = $this->config['oriName'];
        $this->fileSize = strlen($img);
        $this->fileType = $this->getFileExt();
        $this->fullName = $this->getFullName();
        $this->filePath = $this->getFilePath();
        $this->fileName = $this->getFileName();
        $dirname = dirname($this->filePath);

        //检查文件大小是否超出限制
        if (!$this->checkSize()) {
            $this->stateInfo = $this->getStateInfo("ERROR_SIZE_EXCEED");
            return;
        }

        //创建目录失败
        if (!file_exists($dirname) && !mkdir($dirname, 0777, true)) {
            $this->stateInfo = $this->getStateInfo("ERROR_CREATE_DIR");
            return;
        } else if (!is_writeable($dirname)) {
            $this->stateInfo = $this->getStateInfo("ERROR_DIR_NOT_WRITEABLE");
            return;
        }

        //移动文件
        if (!(file_put_contents($this->filePath, $img) && file_exists($this->filePath))) { //移动失败
            $this->stateInfo = $this->getStateInfo("ERROR_WRITE_CONTENT");
        } else { //移动成功
            $this->uploadImg($this->filePath);
        }

    }

    /**
     * 拉取远程图片
     * @return mixed
     */
    private function saveRemote()
    {
        $imgUrl = htmlspecialchars($this->fileField);
        $imgUrl = str_replace("&amp;", "&", $imgUrl);

        //http开头验证
        if (strpos($imgUrl, "http") !== 0) {
            $this->stateInfo = $this->getStateInfo("ERROR_HTTP_LINK");
            return;
        }

        preg_match('/(^https*:\/\/[^:\/]+)/', $imgUrl, $matches);
        $host_with_protocol = count($matches) > 1 ? $matches[1] : '';

        // 判断是否是合法 url
        if (!filter_var($host_with_protocol, FILTER_VALIDATE_URL)) {
            $this->stateInfo = $this->getStateInfo("INVALID_URL");
            return;
        }

        preg_match('/^https*:\/\/(.+)/', $host_with_protocol, $matches);
        $host_without_protocol = count($matches) > 1 ? $matches[1] : '';

        // 此时提取出来的可能是 ip 也有可能是域名，先获取 ip
        $ip = gethostbyname($host_without_protocol);
        // 判断是否是私有 ip
        if(!filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE)) {
            $this->stateInfo = $this->getStateInfo("INVALID_IP");
            return;
        }

        //获取请求头并检测死链
        $heads = get_headers($imgUrl, 1);
        if (!(stristr($heads[0], "200") && stristr($heads[0], "OK"))) {
            $this->stateInfo = $this->getStateInfo("ERROR_DEAD_LINK");
            return;
        }
        //格式验证(扩展名验证和Content-Type验证)
        $fileType = strtolower(strrchr($imgUrl, '.'));
        if (!in_array($fileType, $this->config['allowFiles']) || !isset($heads['Content-Type']) || !stristr($heads['Content-Type'], "image")) {
            $this->stateInfo = $this->getStateInfo("ERROR_HTTP_CONTENTTYPE");
            return;
        }

        //打开输出缓冲区并获取远程图片
        ob_start();
        $context = stream_context_create(
            array('http' => array(
                'follow_location' => false // don't follow redirects
            ))
        );
        readfile($imgUrl, false, $context);
        $img = ob_get_contents();
        ob_end_clean();
        preg_match("/[\/]([^\/]*)[\.]?[^\.\/]*$/", $imgUrl, $m);

        $this->oriName = $m ? $m[1]:"";
        $this->fileSize = strlen($img);
        $this->fileType = $this->getFileExt();
        $this->fullName = $this->getFullName();
        $this->filePath = $this->getFilePath();
        $this->fileName = $this->getFileName();
        $dirname = dirname($this->filePath);

        //检查文件大小是否超出限制
        if (!$this->checkSize()) {
            $this->stateInfo = $this->getStateInfo("ERROR_SIZE_EXCEED");
            return;
        }

        //创建目录失败
        if (!file_exists($dirname) && !mkdir($dirname, 0777, true)) {
            $this->stateInfo = $this->getStateInfo("ERROR_CREATE_DIR");
            return;
        } else if (!is_writeable($dirname)) {
            $this->stateInfo = $this->getStateInfo("ERROR_DIR_NOT_WRITEABLE");
            return;
        }

        //移动文件
        if (!(file_put_contents($this->filePath, $img) && file_exists($this->filePath))) { //移动失败
            $this->stateInfo = $this->getStateInfo("ERROR_WRITE_CONTENT");
        } else { //移动成功
            $this->uploadImg($this->filePath);
        }

    }

    /**
     * 上传错误检查
     * @param $errCode
     * @return string
     */
    private function getStateInfo($errCode)
    {
        return !$this->stateMap[$errCode] ? $this->stateMap["ERROR_UNKNOWN"] : $this->stateMap[$errCode];
    }

    /**
     * 获取文件扩展名
     * @return string
     */
    private function getFileExt()
    {
        return strtolower(strrchr($this->oriName, '.'));
    }

    /**
     * 重命名文件
     * @return string
     */
    private function getFullName()
    {
        //替换日期事件
        $t = time();
        $d = explode('-', date("Y-y-m-d-H-i-s"));
        $format = $this->config["pathFormat"];
        $format = str_replace("{yyyy}", $d[0], $format);
        $format = str_replace("{yy}", $d[1], $format);
        $format = str_replace("{mm}", $d[2], $format);
        $format = str_replace("{dd}", $d[3], $format);
        $format = str_replace("{hh}", $d[4], $format);
        $format = str_replace("{ii}", $d[5], $format);
        $format = str_replace("{ss}", $d[6], $format);
        $format = str_replace("{time}", $t, $format);

        //过滤文件名的非法自负,并替换文件名
        $oriName = substr($this->oriName, 0, strrpos($this->oriName, '.'));
        $oriName = preg_replace("/[\|\?\"\<\>\/\*\\\\]+/", '', $oriName);
        $format = str_replace("{filename}", $oriName, $format);

        //替换随机字符串
        $randNum = rand(1, 10000000000) . rand(1, 10000000000);
        if (preg_match("/\{rand\:([\d]*)\}/i", $format, $matches)) {
            $format = preg_replace("/\{rand\:[\d]*\}/i", substr($randNum, 0, $matches[1]), $format);
        }

        $ext = $this->getFileExt();
        return $format . $ext;
    }

    /**
     * 获取文件名
     * @return string
     */
    private function getFileName () {
        return substr($this->filePath, strrpos($this->filePath, '/') + 1);
    }

    /**
     * 获取文件完整路径
     * @return string
     */
    private function getFilePath()
    {
        $fullname = $this->fullName;
        $rootPath = $_SERVER['DOCUMENT_ROOT'];

        if (substr($fullname, 0, 1) != '/') {
            $fullname = '/' . $fullname;
        }

        return $rootPath . $fullname;
    }

    /**
     * 文件类型检测
     * @return bool
     */
    private function checkType()
    {
        return in_array($this->getFileExt(), $this->config["allowFiles"]);
    }

    /**
     * 文件大小检测
     * @return bool
     */
    private function  checkSize()
    {
        return $this->fileSize <= ($this->config["maxSize"]);
    }

    /**
     * 获取当前上传成功文件的各项信息
     * @return array
     */
    public function getFileInfo()
    {
        return array(
            "state" => $this->stateInfo,
            "url" => $this->fullName,
            "title" => $this->fileName,
            "original" => $this->oriName,
            "type" => $this->fileType,
            "size" => $this->fileSize
        );
    }

}