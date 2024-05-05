# 사용자 관리 웹페이지
#### - 이 프로젝트는 개발 완료 단계까지 작업 중 플랫폼 사업이 원만하지 않아 배포되지는 않게 된 작업물입니다.
#### - 실제 전화번호로 가입 테스트는 불가 합니다.
#### - firbase에 임의로 등록한 아래에 기재한 가상의 전화번호를 사용하여 테스트 로그인이 가능합니다.

## 소개
O2O(Online to Offline) 플랫폼을 사업자들에게 알리기 위한 웹 페이지

1. **사업자 상담신청 기능**:
- 사업자가 플랫폼에 등록하기 전 상담을 요청할 수 있는 기능
- 실시간 대화 또는 예약을 통해 플랫폼 담당자와 상담 가능

2. **개인 페이지 기능**:
- 플랫폼을 사용하여 사업자들을 광고하는 사용자들의 개인 페이지 생성
- 비즈니스 정보, 계약 정보, 계약 건 수, 제품/서비스 소개, 연락처 정보, 위치 등 포함 가능

3. **관리자 페이지 기능**:
- 사업자들의 등록 신청 승인/거절, 사용자 정보 관리, 콘텐츠 관리, 통계 및 분석 기능 포함

## 테스트용 전화번호 / 인증번호(사용자)
0101234567 /
123456

## 테스트용 전화번호 / 인증번호(관리자)
0101234569 /
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
