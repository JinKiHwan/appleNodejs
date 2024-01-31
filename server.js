//express 라이브러리 사용한다는 뜻
const express = require('express');
const app = express();

//수정하기 3 세팅
const methodOverride = require('method-override');

//수정하기 3 세팅
app.use(methodOverride('_method'));

/* passport 라이브러리 세팅 */
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local');

/* bcrypt 해싱 세팅 */
const bcrypt = require('bcrypt');

/* 세션db 저장하기 세팅 */
const MongoStore = require('connect-mongo');

/* 환경변수 보관 세팅 */
require('dotenv').config();

//app.use 순서 중요
app.use(passport.initialize());
app.use(
  session({
    secret: '암호화에 쓸 비번', //세션의 document id는 암호화해서 유저에게 보냄 털리면 끝남
    resave: false, //유저가 요청할 때마다 세션 갱신할건지 의미. 일반적으로 'false'를 해둠
    saveUninitialized: false, //로그인을 안해도 세션을 만들 것인지를 의미
    cookie: { maxAge: 60 * 60 * 1000 }, //세션 유지 시간- 설정 안하면 기본 2주임
    store: MongoStore.create({
      mongoUrl:
        'mongodb+srv://admin:qwer1234@cluster0.qp8hxwp.mongodb.net/?retryWrites=true&w=majority', //DB접속용 URL
      dbName: 'forum', //db 이름
    }),
  })
);

app.use(passport.session());
/* //passport 라이브러리 세팅 */

/* aws s3 이미지 업로드 세팅*/
const { S3Client } = require('@aws-sdk/client-s3');
const multer = require('multer');
const multerS3 = require('multer-s3');
const s3 = new S3Client({
  region: 'ap-northeast-2',
  credentials: {
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.SECRET_ACCES_KEY,
  },
});

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'eljsh95forum',
    key: function (요청, file, cb) {
      cb(null, Date.now().toString()); //업로드시 파일명 변경가능
    },
  }),
});

/* //aws s3 이미지 업로드 세팅*/

/* 스타일경로 등록 */
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs'); //html 파일이 아닌 ejs파일을 만들어야 함

/* post 세팅 */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* 몽고디비 연동하기 위한 세팅 */
const { MongoClient, ObjectId } = require('mongodb');

let connectDB = require('./database.js');

let db;
connectDB
  .then((client) => {
    console.log('DB연결성공');
    db = client.db('forum');

    //포트란?
    //웹서비스를 이용하는 것 = 타인 컴퓨터에 접속하는 것과 동일
    //평소에는 접속 불가, Port는 타인이 접속할 수 있게 만드는 것이다.
    //고로 하단 listen은 타인 접속허가
    app.listen(process.env.PORT, () => {
      console.log('http://localhost:8080 에서 서버 실행중');
    });
  })
  .catch((err) => {
    console.log(err);
  });

function checkLogin(요청, 응답, next) {
  if (!요청.user) {
    응답.render('beforelogin.ejs');
  }
  next(); //다음으로 실행해주세요~
}

/* app.use(checkLogin); */ //이 하단에 있는 모든 api에 checkLogin 미들웨어 적용 해주십쇼~

/* app.use('제한사항',checkLogin); */
//제한사항에만 적용해주세요 (하위 URL 모두 적용)

/* //몽고디비 연동하기 위한 세팅 */
app.get('/', checkLogin, (요청, 응답) => {
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

app.post('/add', upload.single('img1'), async (요청, 응답) => {
  //console.log(요청.body);

  /* 서버가 만약 다운된다던지 문제가 있었을 경우 try/catch*/
  try {
    //먼저 실행해보고

    if (요청.body.title == '' || 요청.body.content == '') {
      응답.send('제목입력안했음;');
    } else {
      await db.collection('post').insertOne({
        title: 요청.body.title,
        content: 요청.body.content,
        img: 요청.file.location,
      });
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
    let result = await db
      .collection('post')
      .findOne({ _id: new ObjectId(요청.params.id) }); //db에서 자료 하나만 가져오는 방법

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
  let result = await db
    .collection('post')
    .findOne({ _id: new ObjectId(요청.params.id) });

  //console.log(요청.body);
  응답.render('edit.ejs', { result: result });
});

app.put('/edit', async (요청, 응답) => {
  /* 글 수정하기 */
  // db.collection('post').updateOne({어떤 document},{$set:{어떤 내용으로 수정할지}})

  let result = await db
    .collection('post')
    .updateOne(
      { _id: new ObjectId(요청.body.id) },
      { $set: { title: 요청.body.title, content: 요청.body.content } }
    );

  응답.redirect('/list');

  await db
    .collection('post')
    .updateMany({ like: { $gt: 1 } }, { $inc: { like: +1 } });
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

  await db
    .collection('post')
    .deleteOne({ _id: new ObjectId(요청.query.docid) });
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

//login.ejs에서 정보를 받은 뒤 db랑 비교 후 세션 생성 - passport 라이브러리
passport.use(
  new LocalStrategy(async (입력한아이디, 입력한비번, cb) => {
    let result = await db
      .collection('user')
      .findOne({ username: 입력한아이디 });
    if (!result) {
      return cb(null, false, { message: '아이디 DB에 없음' });
    }

    if (await bcrypt.compare(입력한비번, result.password)) {
      return cb(null, result);
    } else {
      console.log(입력한비번, result.password);
      return cb(null, false, { message: '비번불일치' });
    }
  })
);

//db 매칭 후 성공이면 세션 생성
passport.serializeUser((user, done) => {
  //console.log(user);
  process.nextTick(() => {
    //node.js에서 내부 코드를 비동기적으로 처리 / 유사품 queueMicrotask()
    done(null, { id: user._id, username: user.username });
  });
});

// 쿠키를 분석하는 역할
passport.deserializeUser(async (user, done) => {
  //db랑 비교해서 아이디 전송
  let result = await db
    .collection('user')
    .findOne({ _id: new ObjectId(user.id) });
  //패스워드는 삭제
  delete result.password;
  process.nextTick(() => {
    done(null, result);
  });
});

//위 세팅을 마친 뒤 login api기능개발 해야 함
app.get('/login', async (요청, 응답) => {
  console.log(요청.user);
  응답.render('login.ejs');
});

app.post('/login', async (요청, 응답, next) => {
  /* 위 passport.use 코드 실행 */
  passport.authenticate('local', (error, user, info) => {
    if (error) return 응답.status(500).json(error);
    if (!user) return 응답.status(401).json(info.message);
    요청.logIn(user, (err) => {
      if (err) return next(err);
      응답.redirect('/');
    });
  })(요청, 응답, next);
});

//가입기능, connect-mongo
app.get('/register', (요청, 응답) => {
  응답.render('register.ejs');
});

app.post('/register', async (요청, 응답) => {
  /* await bcrypt.hash('문자', 10<-몇번 해싱할지 정하는 것) */
  let 해시 = await bcrypt.hash(요청.body.password, 10);

  await db.collection('user').insertOne({
    username: 요청.body.username,
    password: 해시,
  });

  //조건을 거는게 좋음. 예: input 빈칸일 경우, password 짧을경우, 아이디 중복일 경우 등등

  //패스워드의 경우 해싱하여 저장해야 함
  //npm install bcrypt
  응답.redirect('/');
});

// 세션 db 저장방법 : 라이브러리 기능인 connect-mongo 사용
// npm install connect-mongo
// 상단에 세팅 const MongoStore = require('connect-mongo')

/* 환경변수 */
//db 접속 url, 세션 암호화 비번 등을 환경변수라고 함
//이러한 환경변수들은 별도보관이 좋음 (안전성 문제)
//npm install dotenv

/* API 분리하기(ROUTER) */
// 1. server랑 동일한 위치에 routes 폴더 생성
// 2. shop.js 파일 생성
// 3. shop.js 세팅하기
// 4. server.js로 import 하기(미들웨어 식으로)
//app.use('/', require('./routes/shop.js'));
// 5. 라우터의 공통된 URL 축약가능
app.use('/shop', require('./routes/shop.js'));

// *단점 => db.collection 과 같은 db변수를 쓰기 복잡
// *server.js에서 export하여 상호참조할 경우 문제 생길 수 있음
// => db생성 파일을 따로 만들어 뿌려주면 해결

/* app.get('/shop/shirts', (응답, 요청) => {
  응답.send('셔츠 파는 페이지임');
}); */

/* app.get('/shop/pants', (응답, 요청) => {
  응답.send('바지 파는 페이지임');
}); */
