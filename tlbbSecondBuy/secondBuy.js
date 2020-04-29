let request = require('request');
let cheerio = require('cheerio');


let acoundId = '201906051812582830';
let cookId= 'ed99be31-cee0-45ef-a62c-c7b1d64e5de1';
let verifyImgUrl = 'http://tl.cyg.changyou.com/transaction/captcha-image?goods_serial_num='+acoundId+'&t='+new Date().getTime();
const { loadImage } = require('canvas')

const { Image } = require('canvas')
const img = new Image();
img.src=verifyImgUrl;

const { createCanvas } = require('canvas')
const mycanvas = createCanvas(200, 200)
let ctx = mycanvas.getContext('2d');

img.onload=()=> {
    // do something with image
    ctx.drawImage(img, 0, 0)
}



app.get('/',function (req,res) {
    let c=ctx.getImageData(0, 0, img.width, img.height);
    for(let i = 0; i < c.height; ++i){
        for(let j = 0; j < c.width; ++j){
            let x = i*4*c.width + 4*j,  //imagedata读取的像素数据存储在data属性里，是从上到下，从左到右的，每个像素需要占用4位数据，分别是r,g,b,alpha透明通道
                r = c.data[x],
                g = c.data[x+1],
                b = c.data[x+2];
            c.data[x+3] = 150;    //透明度设置为150,0表示完全透明
            //图片反相：
            let rgbAvrage = (c.data[x]+c.data[x+1]+c.data[x+2])/3
            c.data[x]= c.data[x+1]=c.data[x+2]= rgbAvrage>180?255:0;
        }
    }
    ctx.putImageData(c,0,0);
    res.send('<img src="' + mycanvas.toDataURL() + '" />')
})



// 设置cookie，
let j = request.jar();
request = request.defaults({jar:j})
let url='http://tl.cyg.changyou.com/transaction/buy';
let cookie = request.cookie('sid='+cookId);
j.setCookie(cookie, url);

// 获取商品公示期到期时间
let arriveTime=1; //到期毫秒数
let second = 1;
let shopDetailUrl = 'http://tl.cyg.changyou.com/goods/char_detail?serial_num='+acoundId+'&t='+new Date().getTime();
request(shopDetailUrl,function (err,res,body) {
    let $ = cheerio.load(body);
    second = $('.less-than-day').attr('data-second');
    console.log(second)
    second = second?Number(second):second;
    if(second)arriveTime = new Date().getTime()+(second)*1000;
    console.log(arriveTime)
})
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
   intervalTime = setInterval(wholeBuy,100)









