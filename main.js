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

  let a =  [1,5,9,66,10,5,44,74,100,3,156,41,5,6,8,99,0,11,25,33]

  let b = []
for(let t=0;t<a.length-1;t++) {
    let temp = a[t]
    let index= t;
    for (let i = t; i < a.length ; i++) {
        if(a[i]<temp){
            temp = a[i]
            index = i
        }
    }
    let value = a[t]
    a[t] = a[index]
    a[index] = value
}
   console.log(a)
