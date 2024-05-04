



import { initializeApp } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-analytics.js";
import { getAuth, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-auth.js";
import { getFirestore, collection, query, getDocs, where, serverTimestamp, orderBy } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-firestore.js";

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

// 로그인 상태 확인
onAuthStateChanged(auth, async (user) => {
    if (user) {
        // 사용자가 로그인된 경우
        const urlParams = new URLSearchParams(window.location.search);
        const phoneNumber = urlParams.get('phoneNumber');

        if (!phoneNumber) {
            console.error('URL에서 전화번호를 찾을 수 없습니다.');
            alert('로그인이 필요합니다.');
            window.location.href = "mylogin.html";
            return;
        }

        const usersCollection = collection(db, 'users');
        const querySnapshot = await getDocs(query(usersCollection, where('전화번호', '==', phoneNumber)));
        const serverAddress = 'https://itpartners.netlify.app'; // 실제 서버 주소로 변경해야 합니다.
        const options = {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        };


        if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0];
            const userData = userDoc.data();
            document.getElementById('personalInfo').innerHTML = `
                <p>이름: ${userData.이름}</p>
                <p>인스타ID: ${userData.인스타ID}</p>
                <p>전화번호: ${userData.전화번호}</p>
                <p>은행: ${userData.은행}</p>
                <p>계좌번호: ${userData.계좌번호}</p>
                <p>개인URL: ${serverAddress}/cs.html?user=${userData.인스타ID}</p>
            `;

            const recommendedBy = userData.인스타ID;
            const progressCollection = collection(db, `cs`);
            const progressSnapshot = await getDocs(query(progressCollection, where('추천인', '==', recommendedBy), orderBy('신청날짜', 'desc')));


            if (!progressSnapshot.empty) {
                progressSnapshot.forEach((progressDoc) => {
                    const progressData = progressDoc.data();

                    console.log('현재 데이터:', progressData);


                    const tableRow = document.createElement('tr');
                    tableRow.innerHTML = `
                        <td>${progressData.신청날짜.toDate().toLocaleString('ko-KR', options)}</td>
                        <td>${progressData.업체명}</td>
                        <td>${progressData.위치}</td>
                        <td>${progressData.계약여부 ? progressData.계약여부 : ''}</td>
                        <td>${progressData.체결날짜 ? progressData.체결날짜.toDate().toLocaleString('ko-KR', options) : ''}</td>
                    `;
                    document.getElementById('progressTableBody').appendChild(tableRow);

                    console.log('테이블에 추가된 데이터:', progressData);

                });




                let isAscending = true; // 초기 정렬 순서: 오름차순

                const sortedByApplicationDate = progressSnapshot.docs
                    .map((progressDoc) => progressDoc.data())
                    .sort((a, b) => isAscending ? a.신청날짜.toDate() - b.신청날짜.toDate() : b.신청날짜.toDate() - a.신청날짜.toDate());

                function addRowsToTable(sortedData) {
                    sortedData.forEach((progressData) => {

                        const tableRow = document.createElement('tr');
                        tableRow.innerHTML = `
                            <td>${progressData.신청날짜.toDate().toLocaleString('ko-KR', options)}</td>
                            <td>${progressData.업체명}</td>
                            <td>${progressData.위치}</td>
                            <td>${progressData.계약여부 ? progressData.계약여부 : ''}</td>
                            <td>${progressData.체결날짜 ? progressData.체결날짜.toDate().toLocaleString('ko-KR', options) : ''}</td>
                        `;
                        document.getElementById('progressTableBody').appendChild(tableRow);

                    });
                }

                document.getElementById('sortButton').addEventListener('click', function () {
                    // 기존 행 삭제
                    document.getElementById('progressTableBody').innerHTML = '';

                    // 정렬된 데이터를 테이블에 추가
                    isAscending = !isAscending; // 토글: 오름차순 <-> 내림차순
                    sortedByApplicationDate.sort((a, b) => isAscending ? a.신청날짜.toDate() - b.신청날짜.toDate() : b.신청날짜.toDate() - a.신청날짜.toDate());
                    addRowsToTable(sortedByApplicationDate);

                    sortButton.textContent = isAscending ? '▼' : '▲';
                });


            } else {
                console.error('진행현황을 찾을 수 없습니다.');
            }
        } else {
            console.error('해당 사용자를 찾을 수 없습니다.');
        }
    } else {
        // 로그인하지 않은 경우, 로그인 페이지로 리다이렉트 또는 다른 처리를 수행
        console.error('로그인이 필요합니다.');
        alert('로그인이 필요합니다.');
        window.location.href = "mylogin.html";
    }
});

// 로그아웃 버튼에 클릭 이벤트 리스너 추가
const logoutButton = document.getElementById('logoutButton');
logoutButton.addEventListener('click', () => {
    signOut(auth)
        .then(() => {
            console.log('로그아웃 성공');
            history.replaceState({}, '', 'mylogin.html');
            window.location.href = "mylogin.html";
            // 로그아웃 후 필요한 동작을 추가할 수 있습니다.
        })
        .catch((error) => {
            console.error('로그아웃 실패:', error.message);
        });



});
