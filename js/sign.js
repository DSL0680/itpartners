// 토글 메뉴
document.addEventListener('DOMContentLoaded', function () {
    var menuIcon = document.getElementById('menu-icon');
    var subMenu = document.querySelector('.sub-menu');

    menuIcon.addEventListener('click', function () {
        subMenu.classList.toggle('active'); // 메뉴를 토글
    });
});





// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-analytics.js";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-auth.js";
import { getFirestore, collection, doc, setDoc, addDoc } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-firestore.js";
import { serverTimestamp } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-firestore.js";



// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries   

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID",
    measurementId: "YOUR_MEASUREMENT_ID",
    databaseURL: "your_database_URL"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);


const auth = getAuth();
const db = getFirestore();

auth.languageCode = 'ko';
let isPhoneNumberVerified = false;

// 보이지 않는 리케스트(봇 사람 구별) 
window.recaptchaVerifier = new RecaptchaVerifier(
    auth, 'phoneNumberButton', {
    'size': 'invisible',
    'callback': (response) => {
        // reCAPTCHA solved, allow signInWithPhoneNumber.
        onSignInSubmit();
    }
});
document.getElementById('phoneNumberButton').
    addEventListener('click', (event) => {
        event.preventDefault()

        const phoneNumber = document.getElementById('phoneNumber').value
        const appVerifier = window.recaptchaVerifier;
        // 전화번호 보내기
        signInWithPhoneNumber(auth, '+1' + phoneNumber, appVerifier)
            .then((confirmationResult) => {
                // SMS sent. Prompt user to type the code from the message, then sign the
                // user in with confirmationResult.confirm(code).
                window.confirmationResult = confirmationResult;
                console.log(confirmationResult)
                alert('인증번호가 전송 되었습니다.');
                // ...
            }).catch((error) => {
                console.log(error)
                // Error; SMS not sent
                // ...
                alert('인증번호 전송 실패했습니다.');
            });


    })


// 인증번호 확인 
document.getElementById('confirmCodeButton').addEventListener('click', (event) => {
    const code = document.getElementById('confirmCode').value
    confirmationResult.confirm(code).then((result) => {
        // 사용자가 성공적으로 로그인함.
        const user = result.user;
        console.log(result);
        isPhoneNumberVerified = true; // 인증이 성공했을 때 플래그를 true로 설정
        // 제출 버튼을 활성화
        document.getElementById('joinButton').removeAttribute('disabled');

        alert('인증 성공');

    }).catch((error) => {
        console.log(error);
        // 사용자가 로그인하지 못함 (잘못된 인증 코드 등)
        // 플래그를 재설정하고 제출 버튼을 비활성화
        isPhoneNumberVerified = false;
        document.getElementById('joinButton').setAttribute('disabled', true);

        alert('인증 실패, 인증 코드를 확인하세요.')
    });
});


// 회원가입 양식 제출 시 호출되는 함수
function onSignUpSubmit() {
    // 사용자 입력 가져오기
    const name = document.getElementById('name').value;
    const username = document.getElementById('username').value;
    const phoneNumber = document.getElementById('phoneNumber').value;
    const bank = document.getElementById('bank').value;
    const account = document.getElementById('account').value;

    // Firestore에 데이터 추가
    const usersCollection = collection(db, 'users');
    const userDoc = doc(usersCollection, username,); // 'username'을 문서 이름으로 사용


    setDoc(userDoc, {
        이름: name,
        인스타ID: username,
        전화번호: phoneNumber,
        은행: bank,
        계좌번호: account,
        가입날짜: serverTimestamp() // 서버 시간을 Firestore에 저장
    })
        .then(() => {
            console.log('Document successfully written with ID: ', username);
            // 여기서 필요한 추가 작업 수행 가능
            const consultationLink = `cs.html?user=${username}`;
            window.location.href = consultationLink;

        })
        .catch((error) => {
            console.error('Error writing document: ', error);
        });
}



// 제출 버튼 클릭 시 함수 호출
document.getElementById('join').addEventListener('submit', (event) => {
    event.preventDefault();
    onSignUpSubmit();
    if (isPhoneNumberVerified) {
        onSignUpSubmit();
        alert('회원가입 완료');
    } else {
        alert('전화번호를 먼저 인증하세요.');
    }
});







