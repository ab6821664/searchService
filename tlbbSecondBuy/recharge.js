let mysql = require('mysql');
let connectionConfig ={
    host:'106.12.103.25',
    user:'root',
    password:'ab6821664',
    database:'jiajiaf',
    useConnectionPooling: true
}

let connection=null


function handleDisconnect() {
    connection = mysql.createConnection(connectionConfig); // Recreate the connection, since
    // the old one cannot be reused.

    connection.connect(function(err) {              // The server is either down
        if(err) {                                     // or restarting (takes a while sometimes).
            console.log('error when connecting to db:', err);
            setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
        }                                     // to avoid a hot loop, and to allow our node script to
    });                                     // process asynchronous requests in the meantime.
                                            // If you're also serving http, display a 503 error.
    connection.on('error', function(err) {
        console.log('db error', err);
        if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
            handleDisconnect();                         // lost due to either server restart, or a
        } else {
            // connnection idle timeout (the wait_timeout
            throw err;                                  // server variable configures this)
        }
    });
}
// 创建数据库连接
handleDisconnect()

// 充值卡片表
function recharge(account,card,current){

    let queryIsExist = `select * from pass where id = ? and used= "0"`
    return new Promise((resolve,reject)=>{
        connection.query(queryIsExist,[card],function(err,res){
            if(res &&  res.length>0){
                let destroyPass = 'UPDATE pass SET used = ?  WHERE id = ?'
                connection.query(destroyPass,[account,card],function (err) {
                      if(err){
                          console.log(err)
                      }else {
                          console.log('destroy success')
                      }
                })
                let time = res[0].type * 24 * 60 * 60 *1000;

                let queryUser = `select * from buy_account where user = ?`
                connection.query(queryUser,[account],function (err,userData) {
                    console.log(userData)
                    let userTime = userData[0].time;
                    let addScore = 5 *res[0].type
                    let score = userData[0].score<100?100+addScore:userData[0].score+addScore
                    userTime = userTime>current?userTime:current
                    userTime = userTime+time;

                    let updateSetSql = 'UPDATE buy_account SET time = ?, score= ?  WHERE user = ?'
                    connection.query(updateSetSql,[userTime,score,account],function (err,rechargeRes) {
                        console.log(rechargeRes)
                        if(err){
                            console.log(err)
                        }else {

                            resolve('充值成功')
                        }

                    })
                })

            }else{
                resolve('卡号不存在或者已经被使用')
            }
        })
    })

}

module.exports={
    recharge
}