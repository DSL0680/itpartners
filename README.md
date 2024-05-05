# 사용자 관리 웹페이지


## 소개
- ""이 프로젝트는 개발은 완료되었지만 플랫폼 사업이 원만하지 않아 배포되지는 않게 된 작업물입니다.""
- 실제 전화번호로 가입 테스트는 불가 합니다.
- firbase에 임의로 등록한 아래에 기재한 가상의 전화번호를 사용하여 테스트 로그인이 가능합니다.

## 테스트용 전화번호(사용자)
0101234567
## 테스트용 전화번호 인증번호(사용자)
123456

## 테스트용 전화번호(관리자)
0101234569
## 테스트용 전화번호 인증번호(관리자)
123123

## Firebase 설정

** firebaseConfig는 보안상 아래처럼 수정되어 있습니다. **

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID",
    measurementId: "YOUR_MEASUREMENT_ID"
};
