

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-analytics.js";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-auth.js";
import { getFirestore, collection, doc, setDoc, addDoc, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyB6lLauz5qNXixxnGEug0wQ_UVbEwAe1vU",
    authDomain: "infl-87a81.firebaseapp.com",
    databaseURL: "https://infl-87a81-default-rtdb.firebaseio.com",
    projectId: "infl-87a81",
    storageBucket: "infl-87a81.appspot.com",
    messagingSenderId: "958612048140",
    appId: "1:958612048140:web:92f0d91e7e9e6e60142129",
    measurementId: "G-TWT4R8KLEV"
};

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
                alert('인증번호가 전송되었습니다.');
            }).catch((error) => {
                console.log(error)
                // Error; SMS not sent
                alert('인증번호 전송에 실패했습니다.');
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
        document.getElementById('loginButton').removeAttribute('disabled');

        alert('인증이 완료되었습니다.');

    }).catch((error) => {
        console.log(error);
        // 사용자가 로그인하지 못함 (잘못된 인증 코드 등)
        // 플래그를 재설정하고 제출 버튼을 비활성화
        isPhoneNumberVerified = false;
        document.getElementById('loginButton').setAttribute('disabled', true);
        alert('잘못된 인증 코드');
    });
});

function onSignUpSubmit() {
    // 사용자 입력 가져오기
    const phoneNumber = document.getElementById('phoneNumber').value;

}


document.getElementById('login').addEventListener('submit', async (event) => {
    event.preventDefault();
    // 전화번호 인증이 성공했는지 확인
    if (isPhoneNumberVerified) {
        // 사용자의 전화번호 가져오기
        const phoneNumber = document.getElementById('phoneNumber').value;

        try {
            // Firestore 컬렉션에서 문서를 동적으로 선택
            const usersCollection = collection(db, 'users');
            const querySnapshot = await getDocs(query(usersCollection, where('전화번호', '==', phoneNumber)));


            if (querySnapshot.size > 0) {
                // 전화번호가 컬렉션에 존재하면 로그인 진행
                console.log(querySnapshot)

                alert('로그인 성공!');

                const phoneNumber = document.getElementById('phoneNumber').value;
                window.location.href = `mypage.html?phoneNumber=${phoneNumber}`;


            } else {
                // 전화번호가 컬렉션에 존재하지 않음
                alert('등록되지 않은 전화번호입니다. 회원가입이 필요합니다.');
            }
        } catch (error) {
            console.error('Firestore에서 전화번호 확인 중 오류 발생:', error);
            alert('로그인 중 오류가 발생했습니다.');
        }
    } else {
        // 전화번호 인증이 성공하지 않음
        alert('전화번호 인증을 먼저 완료해주세요.');
    }
});










