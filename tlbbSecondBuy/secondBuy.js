let request = require('request');
let cheerio = require('cheerio');
let axios = require('axios')
const qs = require('qs')
const { createCanvas } = require('canvas')
// 监控异常
process.on('uncaughtException', function (err) {
    console.log('Caught exception: ' + err);
});


//  查询商品到期时间
      function searchGoodsTime(acoundId){
          let shopDetailUrl = 'http://tl.cyg.changyou.com/goods/char_detail?serial_num='+acoundId+'&t='+new Date().getTime(); // 商品链接
          return new Promise((resolve,reject)=>{
              request(shopDetailUrl,function (err,res,body) {
                  if(err || body.indexOf('查无此物')>-1){
                      let data = {success:false};
                      resolve(data) ;
                      return
                  }
                  let start=body.indexOf("weiboText:");
                  let over=body.indexOf("bdComment:");
                  let msg=body.substring(start+11,over).trim();
                  let data = {msg:msg,success:true};
                  if(body.indexOf('立即购买')>-1){
                      data.expire = true;
                      data.time = ''
                  }else {
                      let $ = cheerio.load(body);
                      let  second = $($('.info-list').children()[4]).text();
                      data.expire = false;
                      data.time = second.trim()
                  }
                  resolve(data) ;
              })
          })

      }

// 下单商品

     function commitBuy(acoundId,cookId,resolve){
         // 设置cookie，
         let j = request.jar();
         request = request.defaults({jar:j})
         let url='http://tl.cyg.changyou.com/transaction/buy';
         let cookie = request.cookie('sid='+cookId);
         j.setCookie(cookie, url);

          // 提交购买请求
         function sec_buy(value){
             let msg = '';
             let options = {
                 url:url,
                 method:'post',
                 jar: j,
                 headers: [{
                     name:'User-Agent',
                     value:'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.102 Safari/537.36'
                 },{
                     name: 'content-type',
                     value: 'application/x-www-form-urlencoded; charset=UTF-8'
                 },{
                     name:'Connection',
                     value:'keep-alive'
                 },{
                     name:'Accept',
                     value:'text/plain, */*; q=0.01'
                 },{
                     name:'Accept-Encoding',
                     value:'gzip, deflate'
                 },{
                     name:'Accept-Language',
                     value:'zh-CN,zh;q=0.9'
                 },{
                     name:'Referer',
                     value:'http://tl.cyg.changyou.com/goods/char_detail?serial_num='+acoundId
                 },{
                     name:'X-Requested-With',
                     value:'XMLHttpRequest'
                 }],
                 form:{goods_serial_num:acoundId,captcha_code:''}

             };
             options.form.captcha_code = value;
             request(options,(err,response,body)=>{
                 if(err){
                     msg = '服务器连接超时，请稍后再试';
                     resolve(msg)
                     return
                 }
                 if(body=='captcha_error'){
                     commitBuy(acoundId,cookId,resolve)
                 }else if(body.indexOf('success')>-1){
                     msg = '抢购成功，请回到畅易阁自行支付'
                     resolve(msg)
                 }else if(body.indexOf('登录')>-1){
                     msg = 'sid错误或者过期'
                     resolve(msg)
                 }
                 else {
                     msg = '抢购结果为'+body;
                     resolve(msg)
                 }
             })
         }

          // 获取商品验证码
         const { loadImage } = require('canvas');
         let verifyImgUrl = 'http://tl.cyg.changyou.com/transaction/captcha-image?goods_serial_num='+acoundId+'&t='+new Date().getTime();
         const { Image } = require('canvas')
         const img = new Image();
         img.src=verifyImgUrl;
         const mycanvas = createCanvas(200, 200)
         let ctx = mycanvas.getContext('2d');
         img.onload=()=> {
             // do something with image
             ctx.drawImage(img, 0, 0)
         }

         // 获取图片验证码
         function _initImg(){
             return new Promise((resolve,reject) => {
                 request.get({
                     url: verifyImgUrl,
                     headers: {
                         'Host': 'tl.cyg.changyou.com',
                         'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.132 Safari/537.36',
                         'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
                         'Referer': 'http://tl.cyg.changyou.com/goods/char_detail?serial_num=201905201309252201',
                     },
                     encoding: null
                 }, (err, res, body) => {
                     if(err){
                         reject()
                         return
                     }
                     let base = body.toString('base64')
                     resolve(base)
                 })
             })
         }

         // 识别图片验证码
         _initImg().then((res)=> {
               let option = {
                   username:'a6821664',
                   password:'a545108175',
                   typeid:3,
                   image:res,
               }
               axios.post('http://api.ttshitu.com/base64',option).then((res)=>{
                   let data = res.data;
                   let str;
                   str=data.data.result
                   sec_buy(str)
                //   item.value = str;
                 //  sec_buy(str);
               }).catch((err)=>{
                   sec_buy(1234)
                   console.log('err','识别验证码出错')
               })
         })
      }


     function commitBuyService(acoundId,cookId){
          return new Promise((resolve,reject)=>{
               commitBuy(acoundId,cookId,resolve)
          })
     }




module.exports = {
    searchGoodsTime,commitBuyService
}






