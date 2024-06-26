
function validateForm() {
    const placename = document.getElementById("placename").value;
    const name = document.getElementById("name").value;
    const phoneNumber = document.getElementById("phoneNumber").value;
    const category = document.getElementById("category").value;
    const time = document.getElementById("time").value;

    if (placename === "" || name === "" || phoneNumber === "" || category === "" || time === "") {
        alert("모든 필수 항목을 입력해주세요.");
        return false;
    }
}

// 토글 메뉴
document.addEventListener('DOMContentLoaded', function () {
    var menuIcon = document.getElementById('menu-icon');
    var subMenu = document.querySelector('.sub-menu');

    menuIcon.addEventListener('click', function () {
        subMenu.classList.toggle('active'); // 메뉴를 토글
    });
});


import { initializeApp } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-analytics.js";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-auth.js";
import { getFirestore, collection, doc, setDoc, addDoc } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-firestore.js";
import { serverTimestamp } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-firestore.js";


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

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const auth = getAuth();
const db = getFirestore();

auth.languageCode = 'ko';

// URL에서 사용자 아이디 가져오기
const params = new URLSearchParams(window.location.search);
const userId = params.get('user');
console.log(userId);

document.getElementById('consultationForm').addEventListener('submit', function (event) {
    event.preventDefault();

    // 상담 신청 내역 객체 생성
    const consultationDetails = {
        업체명: document.getElementById("placename").value,
        위치: document.getElementById("place").value,
        대표자성함: document.getElementById("name").value,
        전화번호: document.getElementById("phoneNumber").value,
        업종: document.getElementById("category").value,
        상담시간: document.getElementById("time").value,
        // 추가 필요한 필드들을 여기에 추가
    };

    if (userId) {
        // 사용자 아이디가 있을 때는 해당 사용자의 문서에 상담 내역을 추가
        // userId 문서의 consultations 서브컬렉션에 상담 내역 추가
        const usersCollection = collection(db, 'cs');
        const userDoc = doc(usersCollection, userId,);



        setDoc(userDoc, {
            ...consultationDetails,
            신청날짜: serverTimestamp(),
            추천인: userId
        })
            .then(() => {
                console.log('상담 내역이 성공적으로 저장되었습니다.');
                // 여기서 필요한 추가 작업 수행 가능

                alert('상담 신청이 성공적으로 접수되었습니다.');

                window.location.href = 'home.html';
            })
            .catch((error) => {
                console.error('상담 내역 저장 중 오류 발생: ', error);
                alert('상담 내역 저장 중 오류 발생');
            });
    } else {
        console.log('링크에 사용자 아이디가 없습니다.');
        const userId = 'unknown'

        const usersCollections = collection(db, 'cs');
        const userDocs = doc(usersCollections, userId);



        setDoc(userDocs, {
            ...consultationDetails,
            신청날짜: serverTimestamp(),
            추천인: userId
        })
            .then(() => {
                console.log('상담 내역이 성공적으로 저장되었습니다.');
                // 여기서 필요한 추가 작업 수행 가능

                alert('상담 신청이 성공적으로 접수되었습니다.');

                window.location.href = 'home.html';
            })
            .catch((error) => {
                console.error('상담 내역 저장 중 오류 발생: ', error);
                alert('상담 내역 저장 중 오류 발생');
            });
    }

});

