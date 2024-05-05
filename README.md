# 사용자 관리 웹페이지


## 소개
- 이 프로젝트는 개발은 완료되었지만 플랫폼 사업이 원만하지 않아 배포되지는 않게 된 작업물입니다.
- 가상의 전화번호를 사용하여 테스트 로그인이 가능합니다.
- 실제 전화번호로 가입 테스트는 불가 합니다.
- 관리자 테스트용 전화번호는 비공개 입니다.

## 테스트용 전화번호
0101234567
## 테스트용 전화번호 인증번호
123456

## Firebase 설정

이 프로젝트는 Firebase를 사용합니다. Firebase 구성 정보는 프로젝트의 `firebaseConfig` 객체에 설정되어 있습니다.

**Firebase 구성 정보 설정 방법**

1. Firebase 콘솔(https://console.firebase.google.com/)에 접속하여 새 프로젝트를 생성하십시오.
2. 프로젝트 설정 페이지로 이동하여 Firebase 구성 정보를 확인하십시오.
3. 해당 정보를 아래의 `firebaseConfig` 객체에 적절히 설정하십시오.

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
