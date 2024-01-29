//express 라이브러리 사용한다는 뜻
const express = require('express');
const app = express();

//수정하기 3 세팅
const methodOverride = require('method-override');

//수정하기 3 세팅
app.use(methodOverride('_method'));

/* 스타일경로 등록 */
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs'); //html 파일이 아닌 ejs파일을 만들어야 함

/* post 세팅 */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* 몽고디비 연동하기 위한 세팅 */
const { MongoClient, ObjectId } = require('mongodb');

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
  let result = await db.collection('post').find().toArray(); //db에서 자료를 전부 가져오는 방법
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
  //console.log(요청.body);

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

app.get('/detail/:id', async (요청, 응답) => {
  try {
    let result = await db.collection('post').findOne({ _id: new ObjectId(요청.params.id) }); //db에서 자료 하나만 가져오는 방법

    if (result == null) {
      응답.status(500).send('이상한 URL 입력했는데요');
    }

    응답.render('detail.ejs', { result: result });
  } catch (e) {
    응답.status(500).send('이상한 URL 입력했는데요');
  }
});

/* 수정하기 기능개발 */

app.get('/edit/:id', async (요청, 응답) => {
  let result = await db.collection('post').findOne({ _id: new ObjectId(요청.params.id) });

  //console.log(요청.body);
  응답.render('edit.ejs', { result: result });
});

app.put('/edit', async (요청, 응답) => {
  /* 글 수정하기 */
  // db.collection('post').updateOne({어떤 document},{$set:{어떤 내용으로 수정할지}})

  let result = await db.collection('post').updateOne({ _id: new ObjectId(요청.body.id) }, { $set: { title: 요청.body.title, content: 요청.body.content } });

  응답.redirect('/list');

  await db.collection('post').updateMany({ like: { $gt: 1 } }, { $inc: { like: +1 } });
});

/* 수정하기 만들기3 - form 태그를 이용해서 put/delete 요청하는 방법*/
//1. npm install method-override
//2. 상단에 const methodOverride = require('method-override') / app.use(methodOverride('_method'))  추가
//3. form태그에서 actions의 url+?_metohd=PUT 추가
//4. 서버js에서 post->put으로 수정

/* 좋아요 만들기 */
// 수정하기 중 $set => $int 로 변경 : 기존값에 +/- 하라는 뜻
// $mul = 곱하기
// $unset = 필드값 삭제 (거의 안씀)

/* updateOne vs updateMany vs 조건식(필터) */
//여러게 도큐먼트 수정 - updateMany
//조건 updateMany({ like: {$gt:10} }  - 좋아요 10이상

/* 글 삭제 버튼 만들기 */

app.delete('/delete', async (요청, 응답) => {
  //db에 있던 document 삭제하기
  console.log(요청.query.docid);

  await db.collection('post').deleteOne({ _id: new ObjectId(요청.query.docid) });
  응답.send('삭제완료');
});

/* 페이지네이션 만들기 */
/* app.get('/list/1', async (요청, 응답) => {
  //1~5 글 찾아 result 변수에 저장
  let result = await db.collection('post').find().limit(5).toArray();
  응답.render('list.ejs', { post: result });
});

app.get('/list/2', async (요청, 응답) => {
  //1~5 글 찾아 result 변수에 저장
  let result = await db.collection('post').find().skip(5).limit(5).toArray();
  응답.render('list.ejs', { post: result });
});

app.get('/list/3', async (요청, 응답) => {
  //1~5 글 찾아 result 변수에 저장
  let result = await db.collection('post').find().skip(15).limit(5).toArray();
  응답.render('list.ejs', { post: result });
}); */

app.get('/list/:id', async (요청, 응답) => {
  let result = await db
    .collection('post')
    .find()
    // skip의 단점 = 게시글 양이 많아질 경우 속도가현저히 저하됨
    .skip((요청.params.id - 1) * 5)
    .limit(5)
    .toArray();
  응답.render('list.ejs', { post: result });
});

/* skip 단점을 보완한 방법 */
//다음 버튼만 가능ㅋㅋ
app.get('/list/next/:id', async (요청, 응답) => {
  let result = await db
    .collection('post')
    .find({ _id: { $gt: new ObjectId(요청.params.id) } }) //방금 본 마지막 게시물보다 큰 document 모주 가져와달라
    .limit(5)
    .toArray();
  응답.render('list.ejs', { post: result });
});

/* 회원가입 기능 - session*/
//1. 회원가입
//2. 로그인기능
//3. 로그인 완료시 세션 만들기
//4. 로그인 완료시 유저에게 입장권 전달
//5. 로그인여부 체크를 위한 입장권 확인
//이 모든 것을 'passport 라이브러리'구현할 시 쉽게 가능
//npm install express-session passport

/* passport 라이브러리 세팅 */
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local');

//app.use 순서 중요
app.use(passport.initialize());
app.use(
  session({
    secret: '암호화에 쓸 비번', //세션의 document id는 암호화해서 유저에게 보냄 털리면 끝남
    resave: false, //유저가 요청할 때마다 세션 갱신할건지 의미. 일반적으로 'false'를 해둠
    saveUninitialized: false, //로그인을 안해도 세션을 만들 것인지를 의미
  })
);

app.use(passport.session());
/* //passport 라이브러리 세팅 */

app.get('/login', async (요청, 응답) => {
  응답.render('login.ejs');
});

//login.ejs에서 정보를 받은 뒤 db랑 비교 후 세션 생성 - passport 라이브러리
passport.use(
  new LocalStrategy(async (입력한아이디, 입력한비번, cb) => {
    let result = await db.collection('user').findOne({ username: 입력한아이디 });
    if (!result) {
      return cb(null, false, { message: '아이디 DB에 없음' });
    }
    if (result.password == 입력한비번) {
      return cb(null, result);
    } else {
      return cb(null, false, { message: '비번불일치' });
    }
  })
);

app.post('/login', async (요청, 응답, next) => {
  /* 위 passport.use 코드 실행 */
  passport.authenticate('local', (error, user, info) => {
    if (error) return 응답.status(500).json(error);
    if (!error) return 응답.status(401).json(info.message);
    요청.logIn(user, (err) => {
      if (err) return next(err);
      응답.redirect('/');
    });
  })(요청, 응답, next);
});
