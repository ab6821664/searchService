let request = require('request');
let cheerio = require('cheerio');
const { createCanvas } = require('canvas')


let acoundId = '202004271140585209';
let cookId= '297aa9cf-25fe-4ad2-a577-e2fc39ff90b0';

//  查询商品到期时间
      function searchGoodsTime(acoundId){
          let shopDetailUrl = 'http://tl.cyg.changyou.com/goods/char_detail?serial_num='+acoundId+'&t='+new Date().getTime(); // 商品链接
          request(shopDetailUrl,function (err,res,body) {
             let $ = cheerio.load(body);
             let  second = $($('.info-list').children()[4]).text();
             console.log( second)
          })
      }
searchGoodsTime(acoundId)

let verifyImgUrl = 'http://tl.cyg.changyou.com/transaction/captcha-image?goods_serial_num='+acoundId+'&t='+new Date().getTime();
const { loadImage } = require('canvas')

const { Image } = require('canvas')
const img = new Image();
img.src=verifyImgUrl;


const mycanvas = createCanvas(200, 200)
let ctx = mycanvas.getContext('2d');

img.onload=()=> {
    // do something with image
    ctx.drawImage(img, 0, 0)
}

// 设置cookie，
let j = request.jar();
request = request.defaults({jar:j})
let url='http://tl.cyg.changyou.com/transaction/buy';
let cookie = request.cookie('sid='+cookId);
j.setCookie(cookie, url);

// 获取商品公示期到期时间

// 获取图片验证码

function _initImg(){
    return new Promise((resolve) => {
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
            let base = body.toString('base64')
            resolve(base)
        })
    })
}


// 识别图片验证码

let getVerifyUrl = 'http://upload.chaojiying.net/Upload/Processing.php';
//let getVerifyUrl='http://pred.fateadm.com/api/capreg'
let getVerifyUrlOption = {
    url:getVerifyUrl,
    method:'post',
    headers:[
        {
            name: 'content-type',
            value: 'application/x-www-form-urlencoded; charset=UTF-8'
        }
    ],
    form:{user:'a6821664',pass:'a545108175',softid:'d798fa376fec23c60ab5d141be240985',codetype:'1902',file_base64:''}
    /*  form:{
          user_id:'112699',
          timestamp: parseInt(new Date().getTime()/1000),
          predict_type:'30400',
          sign:md5('112699' + parseInt(new Date().getTime()/1000) + md5( parseInt(new Date().getTime()/1000) + 'NMdrKJkyvQ48c19KQldpSyddXutS/kfo')),
          img_data:''
      }*/

}

function getVerifyAnswer(){
    return new Promise(resolve => {
        request(getVerifyUrlOption,(err, res, body)=>{
            if(!err){
                resolve(JSON.parse(body).pic_str)    // 返回验证码结果
            }
        })
    })
}


// 购买设置请求参数
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
let testTime=1;
let ifContin = false;
let intervalTime;
function wholeBuy(){
    if(!ifContin){
        if((arriveTime>1 && new Date().getTime()>arriveTime) || second===undefined) {
            ifContin = true;
            clearInterval(intervalTime)
        }else {
            return;
        }
    }
    testTime++;
    _initImg()
        .then(function (result) {
            getVerifyUrlOption.form.file_base64 = result;
            console.log(result)
            //  getVerifyUrlOption.form.img_data = result;
            return getVerifyAnswer()
        }).then(function (result) {
        options.form.captcha_code = result;
        if(testTime<10) wholeBuy()
        // 发送购买请求
        function buy(){
            request(options,function (err,response,body) {
                if(!err){
                    if(body=='captcha_error'){
                        //重新发起
                        console.log(body)
                        wholeBuy()
                    }else{
                        console.log(body)

                    }
                }else {
                    console.log(err)
                }
            })
        }
        buy();


    })
}
function queryTIme() {
    if(!ifContin){
        if((arriveTime>1 && new Date().getTime()>arriveTime-1000) || second===undefined) {
            ifContin = true;
            clearInterval(intervalTime)
        }else {
            return;
        }
    }
    let begin=new Date().getTime()
    request(shopDetailUrl,function (err,res,body) {
        if(!err){
            let $ = cheerio.load(body);
            console.log($(".btn-buy").text())
            if($(".btn-buy").text()=='立即购买'){
                console.log('can buy',new Date().getTime()-begin,new Date().getTime())
                console.log('delay',new Date().getTime()-arriveTime)
            }else{
                console.log('not buy',new Date().getTime()-begin,new Date().getTime())
                queryTIme()
            }
        }else {
            console.log(err)
        }

    })
}
 //  intervalTime = setInterval(wholeBuy,100)









