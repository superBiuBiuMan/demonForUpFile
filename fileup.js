//当前目录下创建fileup.js文件
const express = require("express");
const multer = require("multer");
var app = express(); //创建express实例

//这里是为了后期没有跨域问题设置的静态资源目录
//__dirname为NodeJS全局变量: 返回运行当前js的文件夹的绝对路径
app.use("/", express.static(__dirname));

//根据multer({})创建一个变量(对文件的一些设置和过滤)
var fileOption = multer({
    //上传限制
    limits: {
        fileSize: 5 * 1024 * 1024 * 1024,
        files: 1
    },
    //存储位置
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, './myfile');
        },
        //重定义上传的文件
        filename: function (req, file, cb) {
            //cb(null,新文件名称)
            cb(null, file.fieldname + '-' + Date.now()+"-"+file.originalname);
        }
    }),
    //过滤
    fileFilter: function (req, file, cb) {
        //这里就不写了~,如果添加了这个对象,一定要设置cb(null,true);不然数据过不去
        cb(null,true);
    }
});

//依据这个变量创建单例multer.single(key)或者multer.array(key,maxcount)
var fileOptionFunction=fileOption.single("fileusers");
//后期ajax提交地址就为:http://localhost:3000/file 端口号可在下方自行设置
app.post("/file", (req, res) => {
    //这里传入的是app.post当中的req,和res
    fileOptionFunction(req,res,(error)=>{
        if (error) {
            return res.send({err:-1,msg:'上传图片不能大于5M'})
        }
        res.send({error:0,msg:"文件上传成功"})
    })
})

//设置在本地端口3000
app.listen("3000", () => {
    console.log("-------------server start-------------------");
})