const app = require("express")();
const redis = require("redis");
const path = require("path");
const axios = require("axios");

let redis_client = redis.createClient(6379, "127.0.0.1");

// API endpoint
const API_URL = "https://swapi.co/api/films/";

app.listen(3000);

app.get("/", (req, res) => {
  res.sendFile(path.resolve(__dirname, "public", "index.html"));
});

const checkCache = (req, res, next) => {
  redis_client.get(req.params.id, (err, data) => {
    if (err) {
      console.log(err);
      res.status(500).send(err);
    }
    console.log("D", data);
    if (data != null) {
      res.json(JSON.parse(data));
    } else {
      next();
    }
  });
};

app.get("/id/:id", checkCache, (req, res) => {
  // console.log()
  const id = req.params.id;
  // console.log(`${API_URL}/${id}`);
  // console.log(${API_URL}/${id})
  axios
    .get(`${API_URL}${id}`)
    .then(response => {
      const results = response.data;
      // console.log("R", results);
      // add data to redis
      redis_client.set(id, JSON.stringify(results), function(err, result) {
        if (err) console.log(err);
      });

      redis_client.expire(id, 3600);

      return res.json(results);
    })
    .catch(error => {
      console.log(error);
    });
});

// client.on("error", err => {
//   console.error(err);
// });

// client.set("name", "max", redis.print);
// client.get("name", redis.print);

// 在redis中模拟对象操作
// client.hset("person", "name", "max", redis.print);
// client.hset("person", "age", 15, redis.print);
// hgetall 获取不到 Reply: [object Object] 需要遍历keys
// client.hgetall("person", redis.print);
// client.hkeys("person", (err, res) => {
//   let person = {};
//   res.forEach(key => {
//     client.hget("person", key, (err, reply) => {
//       console.log("reply", reply, key);
//       person[key] = reply;

//       console.log(person);
//     });
// });
// 拿不到 异步的
//   console.log("person: ", person);
// });

// redis发布订阅
// 消息通信模式
// 发送者发送消息， 订阅者接收消息，客户端可以订阅任意数量的频道

// redis事物
// redis一次执行多个任务
// 多个命令可以在exec

// multi account 1

// // 备份与恢复
// 数据放内存的 save 退出时候会把内存中的数据写在硬盘上
// dump.rdb

// // 安全

// M=》redis（过期时间）

// cllient 《=》
