const fs = require('fs')
const querystring = require('querystring')
// 创建文件
let createFile= function(){

   const file = fs.createWriteStream('big.file')

   for(let i =1; i<33; i++){

   file.write('xixixi hahah xixi \n')

   file.close()

   }
}

//读取文件

 let readFile = function(){
     fs.readFile('big.file','utf-8',function (err,res) {
         console.log(res)
     })
 }

// 简单服务器的创建

let simpleServe = function () {
     const express = require('express')
    const app = express()
    const port = 8888
    app.get('/get',(req,res)=>{
        res.send('heelo world')
    })
    app.listen(port)
}

    function test(a,b) {
        console.log(b)
        return {
            test:function (c) {
                return test(c,a)
            }
        }
    }
    let retA = test(0);
    retA.test(2)
retA.test(4)
retA.test(8)
// little diffcult