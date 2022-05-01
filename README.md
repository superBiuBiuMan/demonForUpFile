

### 先安装基本的模块

$ npm init -y 

$ npm install express --save

$ npm install multer --save

#### 附上multer的github当中别人汉化的API文档

[github地址](https://github.com/expressjs/multer/blob/master/doc/README-zh-cn.md)

<p class="note note-info">我这使用的nodemon,如果那么使用node运行,修改记得重启</p>

### 开始创建基本express(上传图片)

当前目录下创建fileup.js文件

```javascript
const express = require("express");
const multer = require("multer");
var app = express();//创建express实例

//这里是为了后期没有跨域问题设置的静态资源目录
//__dirname为NodeJS全局变量: 返回运行当前js的文件夹的绝对路径
app.use("/",express.static(__dirname));

//后期ajax提交地址就为:http://localhost:3000/file 端口号可在下方自行设置
app.post("/file",(req, res) => {
    //前期测试接口发送数据,没有问题再进行下一步
    res.send("file ok");
})

//设置在本地端口3000
app.listen("3000", () => {
    console.log("-------------server start-------------------");
})
```

#### 测试是否正常

<p class="note note-info">这里使用postman测试</p>

<img src="https://dreamos.oss-cn-beijing.aliyuncs.com/gitblog/20220329212333.png"  />

<p class="note note-info">测试没有问题再继续,不然后期很难改</p>

### 前端部分

当前目录下创建up.html 

```html
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <script src="https://cdn.bootcdn.net/ajax/libs/jquery/3.6.0/jquery.min.js"></script>
</head>

<body>
    
    <input type="file" id="fileInput">
    <button id="btn">上传文件</button>
    <script>
        //这里不用jQuery获取是后期需要用到DOM元素,用jQuery也可以,用get或则[]就可以转为DOM元素
        var fileInput = document.getElementById("fileInput");
        var $btn = $("#btn");
        $btn.click(function () {
            //创建表单
            //这里new FormData不传入参数,因为这里只是上传一个图片,不存在其他数据,如果要传,传入form标签对应的DOM元素
            var formData = new FormData();
            //传入文件的key和value
            //fileInput.files[0]获取第一个文件,为什么是数组的我猜是因为开发js的为了和多文件上传一样用
            formData.append("fileusers", fileInput.files[0]); 
            //注意formData.append和formData.set区别,
            $.ajax({
                "type": "post",
                "url": "http://localhost:3000/file",
                //contentType:true;默认值,值为application/x-www-form-urlencoded
				//contentType:false;值为multipart/form-data
                //重要!!!!!!!!!!!!!!!!!!!!!!!!
                "contentType": false,
               	//重要!!!!!!!!!!!!!!!!!!!!!!!!
                "processData": false,
                "data": formData,
                "success": function (data) {
                    console.log(data);
                },
                "error": function (error) {
                    console.log("错误了", error);
                }
            });
        });
    </script>
</body>

</html>
```

#### 前端需要注意的

1. 注意formData.append和formData.set区别
   1. formData.append是如果存在值则会添加到后面,就像[{...},{...}]一样
   2. formData.set是会覆盖前面的,只保留一个

2. **jQuery上传数据的时候,记得设置下面二点**
   1. "processData": false
   2. "contentType": false
3. formData.append("**fileusers**", fileInput.files[0]); 当中**fileusers**在这里的作用
   1. 后端multer需要通过用户定义的key,在这里也就是**fileusers**来设置数据
4. new FormData();如果需要传入参数,是传入form标签对应的DOM元素

### multer使用

- 大体分为而部分
  - 根据multer({})创建一个变量(对文件的一些设置和过滤),比如说 var **fileOption** = multer({})
  - 依据这个变量创建单例fileOption.single(key)或者fileOption.array(key,maxcount)
  - 使用这个单例作为过滤器来对文件进行过滤和操作(也就是中间件)

#### multer({})创建一个变量当中一些可以设置的(具体可以参考官网)

1. **limits**{对象}(一个对象，指定一些数据大小的限制)

   | Key             | Description                                              | Default   |
   | --------------- | -------------------------------------------------------- | --------- |
   | `fieldNameSize` | field 名字最大长度                                       | 100 bytes |
   | `fieldSize`     | field 值的最大长度                                       | 1MB       |
   | `fields`        | 非文件 field 的最大数量                                  | 无限      |
   | `fileSize`      | 在 multipart 表单中，文件最大长度 (字节单位)             | 无限      |
   | `files`         | 在 multipart 表单中，文件最大数量                        | 无限      |
   | `parts`         | 在 multipart 表单中，part 传输的最大数量(fields + files) | 无限      |
   | `headerPairs`   | 在 multipart 表单中，键值对最大组数                      | 2000      |

2. **fileFilter**{函数}设置一个函数来控制什么文件可以上传以及什么文件应该跳过

   ```javascript
   function fileFilter (req, file, cb) {
   
     // 这个函数应该调用 `cb` 用boolean值来
     // 指示是否应接受该文件
   
     // 拒绝这个文件，使用`false`，像这样:
     cb(null, false)
   
     // 接受这个文件，使用`true`，像这样:
     cb(null, true)
   
     // 如果有问题，你可以总是这样发送一个错误:
     cb(new Error('I don\'t have a clue!'))
   
   }
   ```

3. **storage**{返回值} 为运行multer.diskStorage({设置参数})的返回值

   ```javascript
   const storage = multer.diskStorage({
     //定义文件存储位置
     destination: function (req, file, cb) {
       //回调函数file当中 
       /* file对象的内容{
          fieldname: 'fileusers',//通过formData.append(key,value)添加的key值
          originalname: '_1464815392_.bmp',//文件名
          encoding: '7bit',//编码
          mimetype: 'image/bmp'  //mimeType类型
        } */
       //cb(null,存储路径)
       cb(null, './myfile');//可能是以fileup.js在哪里运行为基准的参考的
     },
     //重定义上传的文件
     filename: function (req, file, cb) {
       //cb(null,新文件名称)
       cb(null, file.fieldname + '-' + Date.now())
     }
   })
   
   const upload = multer({ storage: storage })
   ```

#### multer代码

当前目录下创建fileup.js文件和myfile文件夹

```javascript
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
var fileOptionFunction=fileOption.single("fileusers");//传入通过formData.append(key,value)添加的key值
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
```

![](https://dreamos.oss-cn-beijing.aliyuncs.com/gitblog/20220329220433.png)

#### multer部分需要注意的

1. 如果使用app.post("/file", uploadOption.single("fileusers"),(req, res) => {      });好像无法处理文件过大时候的异常
2. 如果使用上面fileup.js文件当中的方式,可以在回调当中处理文件过大时候的异常
3. 如果设置了文件过滤,那么遇到不符合的文件扩展名,req.file的值会为undefined
4. 如果设置了fileFilter文件过滤,一定要设置cb(null,true)(通过),或者cb(null,false);(不通过),不然留空的话数据会一直处于"pending"状态

### 具体文件目录结构和参考完整代码下载

启动后浏览器输入http://localhost:3000/up.html

#### 目录文件结构

![](https://dreamos.oss-cn-beijing.aliyuncs.com/gitblog/20220329220518.png)

#### 参考完整代码下载

[express+multer+jQuery前端后端上传单个文件演示](https://github.com/superBiuBiuMan/demonForUpFile)
