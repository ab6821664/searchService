const axios = require("axios");

//登录模块

//获取验证码图片

let imgUrl  = 'https://auth.changyou.com/servlet/ImageCode?t='+ Math.random();   // 验证码图片
// 网络图片转换为base64
function getBase64 (url) {
    return axios
        .get(url, {
            responseType: 'arraybuffer'
        })
        .then(response => new Buffer.from(response.data, 'binary').toString('base64'))
}
//  验证码识别
function get_pass(data) {
    return new Promise((resolve,reject)=>{
        // 图鉴
        let picture = axios.post('http://api.ttshitu.com/base64',
            {
                username:'a6821664',
                password:'a545108175',
                typeid:3,
                image:data,
            }
        )
        picture.then(res=>{
            let data = res.data;
            let str;
            str=data.data.result;
            resolve(str)
        })
    })
}

// 登录接口
function login(accound,password,str,cyAdd){
    let loginUrl = 'https://auth.changyou.com/external/secureLogin?s=https://cygsso.changyou.com/loginService';
    axios.post(loginUrl,{
        project: 'cyg',
        cn: accound,
        password: password,
        code: str
    }).then(res=>{
        console.log(res)
        axios.post('https://cygsso.changyou.com/checkonpalm',{
            password: cyAdd
        }).then(response=>{
            console.log('response',response)
        })
    }).catch(error=>{
        console.log(error)
    })
}

// 获取验证码图片
getBase64(imgUrl)
    .then(ret => {
        get_pass(ret).then(res=>{              //登录
            login('17674761082','15211471525',res,'500971')
        })

    })


