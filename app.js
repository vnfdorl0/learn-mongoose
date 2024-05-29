const express = require('express'); // Express 모듈
const path = require('path'); // path 모듈 -> 파일 경로 관련 기능 제공
const morgan = require('morgan'); // morgan 모듈 -> HTTP 요청 로깅
const nunjucks = require('nunjucks'); // 템플릿 엔진으로 Nunjucks 사용

const connect = require('./schemas'); // MongoDB 연결 함수

const app = express(); // Express 애플리케이션 생성

// 포트 설정 -> 환경 변수에서 PORT를 가져오거나 포트 기본값을 3002로 설정
app.set('port', process.env.PORT || 3002);
app.set('view engine', 'html'); // 뷰 엔진 -> html로 설정

// Nunjucks 설정
nunjucks.configure('views', {
    express: app, // Express 애플리케이션 사용 설정
    watch: true, // 템플릿 파일 변경 검지 활성화
});

connect(); // MongoDB에 연결


app.use(morgan('dev')); // 로깅 미들웨어 사용 -> 개발 환경에서는 dev 포맷으로 로깅
// 정적 파일 미들웨어 등록 -> public 폴더의 파일에 접근 가능
app.use(express.static(path.join(__dirname, 'public')));
// JSON 파싱 미들웨어 등록
app.use(express.json());
// URL 인코딩 파싱 미들웨어 등록
app.use(express.urlencoded({ extended: false }));

// 404 에러 처리 미들웨어
app.use((req, res, next) => {
    // 요청이 들어온 HTTP 메서드와 URL을 이용 -> 해당하는 라우터가 없을을 나타내는 에러 생성
    const error = new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
    error.status = 404; // 에러 상태 코드 -> 404로 설정
    next(error); // 다음 미들웨어로 해당 에러 전달
});

// 에러 핸들일 미들웨어
app.use((err, req, res, next) => {
    // 에러 메시지와 환경에 따라 다르게 처리
    res.locals.message = err.message; // 에러 메시지를 지역 변수에 저장
    // 개발 환경에서만 에러 객체 전달
    res.locals.error = process.env.NODE_ENV !== 'production' ? err : {};
    res.status(err.status || 500); // 에러 상태 설정 -> 기본값은 500(서버 내부 오류)
    res.render('error'); // 에러 페이지 렌더링 -> 클라이언트에게 전달
});

// 특정 포트에서 서버 실행
app.listen(app.get('port'), () => {
    // 서버가 시작되었음을 콘솔에 출럭
    console.log(app.get('port'), '번 포트에서 대기 중')
});