//express 라이브러리 사용한다는 뜻
const express = require('express');
const app = express();

/* 스타일경로 등록 */
app.use(express.static(__dirname + '/public'));

//포트란?
//웹서비스를 이용하는 것 = 타인 컴퓨터에 접속하는 것과 동일
//평소에는 접속 불가, Port는 타인이 접속할 수 있게 만드는 것이다.
//고로 하단 listen은 타인 접속허가
app.listen(8080, () => {
  console.log('http://localhost:8080 에서 서버 실행중');
});

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

/*node라이브러리  npm install -g nodemon */
/* nodemon server.js <-터미널 입력 */
