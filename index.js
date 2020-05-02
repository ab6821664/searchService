
const express = require('express')
const second = require('./tlbbSecondBuy/secondBuy.js')
const bodyParser = require('body-parser');

let app = express()
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

app.use(function(req, res, next) {
     res.header("Access-Control-Allow-Origin", "*");
     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
     next();
});


app.get('/searchGoods',(req,res)=>{
     second.searchGoodsTime(req.query.goodsId).then(data=>{
          res.send(data)
     })
})


app.post('/commitBuyService', function (req, res) {
     second.commitBuyService(req.body.acoundId,req.body.cookId).then(data=>{
          console.log('data',data)
          let obj = {
               "success": true,
               "msg":data
          }
          res.json(obj);
     })
})
app.listen('8000')