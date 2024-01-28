//express 라이브러리 사용한다는 뜻
const express = require('express');
const app = express();

/* 스타일경로 등록 */
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs'); //html 파일이 아닌 ejs파일을 만들어야 함

/* post 세팅 */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* 몽고디비 연동하기 위한 세팅 */
const { MongoClient } = require('mongodb');

let db;
const url = 'mongodb+srv://admin:qwer1234@cluster0.qp8hxwp.mongodb.net/?retryWrites=true&w=majority'; //몽고디비 database -> connect -> drivers
new MongoClient(url)
  .connect()
  .then((client) => {
    console.log('DB연결성공');
    db = client.db('forum');

    //포트란?
    //웹서비스를 이용하는 것 = 타인 컴퓨터에 접속하는 것과 동일
    //평소에는 접속 불가, Port는 타인이 접속할 수 있게 만드는 것이다.
    //고로 하단 listen은 타인 접속허가
    app.listen(8080, () => {
      console.log('http://localhost:8080 에서 서버 실행중');
    });
  })
  .catch((err) => {
    console.log(err);
  });
/* //몽고디비 연동하기 위한 세팅 */

app.get('/', (요청, 응답) => {
  응답.sendFile(__dirname + '/index.html');
});
app.get('/news', (요청, 응답) => {
  응답.send('오늘비옴~~');
});

app.get('/about', (요청, 응답) => {
  응답.sendFile(__dirname + '/about.html');
});

app.get('/shop', (요청, 응답) => {
  응답.send('쇼핑페이지입니다');
});

app.get('/list', async (요청, 응답) => {
  let result = await db.collection('post').find().toArray(); //db에서 출력하는 방법
  //await 는 자바스크립트가 실행되기 전에 다음 코드가 진행되는걸 막는 코드
  응답.render('list.ejs', { post: result });
});

/* 숙제 - /time 이라고 접속하면 현재 서버의 시간을 보내주는 기능을 만들어봅시다. */
app.get('/time', (요청, 응답) => {
  let whatTimeIsNow = new Date();
  console.log(whatTimeIsNow);
  응답.render('time.ejs', { time: whatTimeIsNow });
});

/*node라이브러리  npm install -g nodemon */
/* nodemon server.js <-터미널 입력 */

/* 몽고DB 연동 */
// npm install mongodb@5

/*  html안에 데이터를 꽂아넣는 법 */
//템플릿 엔진 : ejs - npm install ejs
//1. ejs 사용하여 서버에 데이터 꽂아넣기
//2. ejs 파일은 views폴더에 만들기
//3. 응답.render로 유저한테 보낼 수 있음
//4. ejs 파일로 서버데이터 전송하여 html에 박아넣기도 가능

/* 글작성 페이지 */

//수업 요약
//1. 코드 짤 때는 한글로 먼저 적은 뒤 코드로 번역
//2. form 쓰면 POST 요청 가능
//3. 서버에서 요청.body 쓸 수 있음
//4. DB Document 발행은 .insertOne()
//5. 유저가 보낸 데이터 검사는 if else
//6. 에러상황 처리는 try catch

app.get('/write', (요청, 응답) => {
  응답.render('write.ejs');
});

app.post('/add', async (요청, 응답) => {
  console.log(요청.body);

  /* 서버가 만약 다운된다던지 문제가 있었을 경우 try/catch*/
  try {
    //먼저 실행해보고

    if (요청.body.title == '' || 요청.body.content == '') {
      응답.send('제목입력안했음;');
    } else {
      await db.collection('post').insertOne({ title: 요청.body.title, content: 요청.body.content });
      응답.redirect('/list');
    }
  } catch (e) {
    //에러시 이거 ㄱㄱ
    console.log(e);
    응답.status(500).send('서버 에러나써요');
  }
});
