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
import { collectionGroup, getFirestore, collection, doc, orderBy, limit, startAfter, setDoc, addDoc, getDocs, query, where, serverTimestamp, getDoc, Timestamp } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-auth.js";




// Firebase 설정
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

// Firebase 앱 초기화
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Firestore 참조
const db = getFirestore(app);


// 로그인 상태 확인

document.addEventListener("DOMContentLoaded", async function () {




    auth.onAuthStateChanged(async function (user) {




        // 사용자가 로그인한 경우에만 데이터를 가져와서 테이블에 표시

        if (user) {

            const urlParams = new URLSearchParams(window.location.search);
            const phoneNumber = urlParams.get('staff');

            if (!phoneNumber) {
                console.error('URL에서 전화번호를 찾을 수 없습니다.');
                window.location.href = "stafflogin.html";
                return;
            }

            const staffCollection = collection(db, 'staff');
            const querySnapshot = await getDocs(query(staffCollection, where('전화번호', '==', phoneNumber)));
            const staffDoc = querySnapshot.docs[0];

            if (!querySnapshot.empty) {
                // const staffDoc = querySnapshot.docs[0];
                const staffData = staffDoc.data();
                document.getElementById('personalInfo').innerHTML = `
                            <p>이름: ${staffData.이름}</p>
                            <p>전화번호: ${staffData.전화번호}</p>
                            `;
            }


            let isLoadingData = false;
            let lastVisible;

            const pageSize = 5;
            let startDate;  // 전역 변수로 startDate 선언
            let endDate;    // 전역 변수로 endDate 선언


            $(function () {
                // Date Range Picker 초기화
                $('#dateRangePicker').daterangepicker({
                    locale: { format: 'YYYY. MM. DD' },
                    ranges: {
                        '오늘': [moment(), moment()],
                        '지난 7일': [moment().subtract(6, 'days'), moment()],
                        '이번 달': [moment().startOf('month'), moment().endOf('month')],
                        '지난 달': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
                    },
                    opens: 'center', // 모바일에서는 중앙에 달력이 열리도록 지정

                    showDropdowns: true, // 년 및 월의 드롭다운 메뉴 표시
                    autoApply: true // 날짜 선택 후 자동으로 적용
                });

                // 날짜 범위 선택 이벤트
                $('#dateRangePicker').on('apply.daterangepicker', async function (ev, picker) {
                    // 시작 및 종료 날짜 가져오기
                    startDate = picker.startDate.format('YYYY. MM. DD');
                    endDate = picker.endDate.format('YYYY. MM. DD');

                    console.log("선택된 날짜 범위:", startDate, "부터", endDate, "까지");


                    // 날짜 범위 변경 시 insta 엘리먼트 비우기
                    const instaElement = document.getElementById('insta');
                    instaElement.innerHTML = '';

                    await filterDataByDateRange(startDate, endDate);


                    window.onscroll = null; // 이벤트 비활성화


                });
            });



            async function filterDataByDateRange(startDate, endDate) {
                // Firestore Timestamp로 변환
                const startTimestamp = new Date(startDate);
                const endTimestamp = new Date(endDate);

                startTimestamp.setHours(0, 0, 0, 0);
                endTimestamp.setHours(23, 59, 59, 999);

                console.log("Firestore 쿼리 실행: 시작 Timestamp -", startTimestamp, "종료 Timestamp -", endTimestamp);

                // Firestore 쿼리 실행
                const q = query(collection(db, 'cs'), where('체결날짜', '>=', startTimestamp), where('체결날짜', '<=', endTimestamp), orderBy('체결날짜', 'desc'));
                // 데이터를 받아오고 화면에 표시하는 로직 추가

                const documentSnapshots = await getDocs(q);
                if (documentSnapshots.empty) {
                    console.log("해당 날짜 범위에 데이터가 없습니다.");
                    console.log("검색된 문서 갯수:", documentSnapshots.size);


                    addDataToTable(documentSnapshots, true);

                    const completedCountElement = document.getElementById('personalInfo');
                    if (completedCountElement) {
                        let htmlContent = '';

                        // staffData 정보 추가
                        if (!querySnapshot.empty) {
                            const staffData = staffDoc.data();
                            htmlContent += `
                                <p>이름: ${staffData.이름}</p>
                                <p>전화번호: ${staffData.전화번호}</p>
                                `;
                        }

                        // 계약 정보 추가
                        htmlContent += `<p>${startDate} ~ ${endDate} ---> 해당 날짜 범위에 데이터가 없습니다.</p>`;

                        completedCountElement.innerHTML = htmlContent;
                    }

                }

                else {
                    document.getElementById('loadMoreButtonContainer').style.display = 'none';
                    addDataToTable(documentSnapshots, true); // replace = true로 설정하여 기존 데이터를 새 데이터로 교체
                    console.log("검색된 문서 갯수:", documentSnapshots.size);
                }
            }






            async function loadMoreData() {
                if (isLoadingData) return;
                isLoadingData = true;

                try {
                    let queryConfig;
                    if (lastVisible) {
                        queryConfig = query(collection(db, 'cs'), orderBy('신청날짜', 'desc'), startAfter(lastVisible), limit(pageSize));
                    } else {
                        queryConfig = query(collection(db, 'cs'), orderBy('신청날짜', 'desc'), limit(pageSize));
                    }

                    const documentSnapshots = await getDocs(queryConfig);

                    if (!documentSnapshots.empty) {
                        lastVisible = documentSnapshots.docs[documentSnapshots.docs.length - 1];
                        addDataToTable(documentSnapshots, false);
                    } else {
                        console.log("더 이상 불러올 데이터가 없습니다.");
                    }
                } catch (error) {
                    console.error("데이터 로드 중 오류 발생:", error);
                } finally {
                    isLoadingData = false;
                }
            }

            window.onscroll = function () {
                // 페이지 끝에 도달했는지 확인

                // 페이지 바닥에 도달했음
                if (!isLoadingData) {
                    // 1초 대기 후 loadMoreData 함수 호출
                    setTimeout(function () {
                        loadMoreData();
                    }, 500); // 1000 밀리초 = 1초

                }
            };


            const loadMoreButton = document.getElementById('loadMoreButton');

            // "더 보기" 버튼에 클릭 이벤트 리스너 추가
            loadMoreButton.addEventListener('click', function () {

                if (!isLoadingData) {
                    // 버튼 클릭 시 loadMoreData 함수 호출
                    loadMoreData();
                }

            });

            loadMoreData();





            async function addDataToTable(documentSnapshots, replace = false) {
                const tableBody = document.getElementById('tbody');

                if (replace) {
                    // 테이블의 현재 내용을 지웁니다.
                    tableBody.innerHTML = '';
                }

                if (tableBody) {





                    documentSnapshots.docs.forEach((csDoc) => {
                        // "상담신청내역" 서브컬렉션에서 데이터 가져오기




                        const consultationData = csDoc.data();
                        const row = tableBody.insertRow(-1);
                        // 여기에서 각 셀에 데이터 추가
                        const cellDate = row.insertCell(0);
                        const cellName = row.insertCell(1);
                        const cellPlace = row.insertCell(2);
                        const cellCEO = row.insertCell(3);
                        const cellNum = row.insertCell(4);
                        const cellIndustry = row.insertCell(5);
                        const cellConsultationTime = row.insertCell(6);
                        const cellReferrer = row.insertCell(7);
                        const cellContractStatus = row.insertCell(8);
                        const cellTime = row.insertCell(9);

                        // 데이터를 적절한 셀에 할당
                        const options = {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                            hour12: true
                        };

                        cellDate.innerHTML = consultationData.신청날짜.toDate().toLocaleString('ko-KR', options) || '';
                        cellName.innerHTML = consultationData.업체명 || '';
                        cellPlace.innerHTML = consultationData.위치 || '';
                        cellCEO.innerHTML = consultationData.대표자성함 || '';
                        cellNum.innerHTML = consultationData.전화번호 || '';
                        cellIndustry.innerHTML = consultationData.업종 || '';
                        cellConsultationTime.innerHTML = consultationData.상담시간 || '';
                        cellReferrer.innerHTML = `<a href="#" class="referrer-link">${consultationData.추천인}</a>` || '';
                        cellContractStatus.innerHTML = consultationData.계약여부 || '';
                        cellTime.innerHTML = (consultationData.체결날짜 || '') && consultationData.체결날짜.toDate().toLocaleString('ko-KR', options);



                        // 추천인 클릭 시 실행할 함수
                        cellReferrer.addEventListener('click', async () => {
                            // 추천인 ID 가져오기
                            const referrerId = consultationData.추천인;

                            // users 컬렉션에서 추천인 정보 가져오기
                            const referrerDoc = await getDoc(doc(db, 'users', referrerId));

                            if (referrerDoc.exists()) {
                                const referrerData = referrerDoc.data();

                                // 날짜 범위 입력이 있는 경우에만 계약 정보 가져오기
                                let referrerCompletedCount = 0;
                                let referrerStartDate = startDate;
                                let referrerEndDate = endDate;

                                if (startDate && endDate) {
                                    // 해당 추천인이 완료한 계약 수와 날짜 범위 가져오기
                                    const result = await getReferrerCompletedCount(referrerId, startDate, endDate);
                                    referrerCompletedCount = result.referrerCompletedCount;
                                    referrerStartDate = result.referrerStartDate;
                                    referrerEndDate = result.referrerEndDate;
                                }

                                // 가져온 정보 및 계약 수를 insta 요소에 표시
                                document.getElementById('insta').innerHTML = `
                                                <p>추천인 인스타: ${consultationData.추천인}<br>
                                                    추천인 이름: ${referrerData.이름}</p>
                                                
                                                <p>추천인 은행: ${referrerData.은행}<br>
                                                    추천인 계좌번호: ${referrerData.계좌번호}</p>
                                                
                                                ${startDate && endDate ? `<p>${referrerStartDate} ~ ${referrerEndDate} ---> 계약 완료: ${referrerCompletedCount}<br></p>` : ''}
                                                <!-- 여기에 필요한 정보를 추가할 수 있습니다. -->
                                            `;
                            }
                            else {
                                console.error('추천인 정보를 찾을 수 없습니다.');
                            }
                        });


                        async function getReferrerCompletedCount(referrerId, startDate, endDate) {
                            let referrerCompletedCount = 0;

                            // 시작 및 종료 날짜 설정
                            const startDateObj = new Date(startDate);
                            const endDateObj = new Date(endDate);
                            startDateObj.setHours(0, 0, 0, 0);
                            endDateObj.setHours(23, 59, 59, 999);

                            // 해당 추천인의 상담신청내역 쿼리
                            const referrerConsultationsQuerySnapshot = await getDocs(
                                query(collection(db, 'cs'), orderBy('체결날짜', 'desc'), where('추천인', '==', referrerId),
                                    where('체결날짜', '>=', startDateObj), where('체결날짜', '<=', endDateObj))
                            );

                            // 완료된 계약 수 계산
                            referrerConsultationsQuerySnapshot.forEach((csDoc) => {
                                const consultationData = csDoc.data();
                                const consultationDate = consultationData.체결날짜.toDate();

                                // 완료된 계약이며 날짜 범위 내에 있는 경우
                                if (consultationData.계약여부.includes('완료') && consultationDate >= startDateObj && consultationDate <= endDateObj) {
                                    referrerCompletedCount++; // 완료된 계약이면 개수를 증가
                                }
                            });

                            return { referrerCompletedCount, referrerStartDate: startDate, referrerEndDate: endDate };
                        }






                        // 날짜 검색 결과가 있을 때만 completedCount 초기화
                        let completedCount = 0;

                        if (startDate && endDate) {
                            // 검색된 문서 갯수만큼 반복
                            documentSnapshots.docs.forEach((csDoc) => {
                                const consultationData = csDoc.data();

                                // 완료된 계약이면 개수를 증가
                                if (consultationData.계약여부.includes('완료')) {
                                    completedCount++;
                                }
                            });

                            // 결과를 표시할 엘리먼트 가져오기
                            const completedCountElement = document.getElementById('personalInfo');
                            if (completedCountElement) {
                                let htmlContent = '';

                                // staffData 정보 추가
                                if (!querySnapshot.empty) {
                                    const staffData = staffDoc.data();
                                    htmlContent += `
                                                    <p>이름: ${staffData.이름}</p>
                                                    <p>전화번호: ${staffData.전화번호}</p>
                                                `;
                                }

                                // 계약 정보 추가
                                htmlContent += `<p>${startDate} ~ ${endDate} ---> 계약완료: ${completedCount}</p>`;

                                completedCountElement.innerHTML = htmlContent;
                            }
                        } else {
                            // 날짜 검색 결과가 없을 때 초기화
                            completedCount = 0;
                            // staffData 정보 추가

                        }








                        // 검색 창 요소 가져오기
                        const searchInput = document.getElementById('searchInput');

                        // 사용자가 검색어를 입력할 때마다 이벤트 처리
                        searchInput.addEventListener('input', function () {
                            const searchTerm = searchInput.value.trim().toLowerCase();

                            // 모든 행을 가져와서 검색어에 맞는 것만 표시
                            const rows = document.querySelectorAll('#companyTable tbody tr');
                            rows.forEach(row => {
                                let matchFound = false;

                                // 각 열에서 검색어에 맞는 것이 있는지 확인
                                Array.from(row.cells).forEach(cell => {
                                    const cellContent = cell.textContent.toLowerCase();
                                    if (cellContent.includes(searchTerm)) {
                                        matchFound = true;
                                    }
                                });

                                if (matchFound) {
                                    row.style.display = '';
                                } else {
                                    row.style.display = 'none';
                                }
                            });
                        });











                        // 완료 버튼
                        const completeButton = document.createElement('button');
                        completeButton.innerText = '완 료';
                        completeButton.addEventListener('click', async () => {
                            const confirmed = confirm('완료 버튼을 누르시겠습니까?');
                            if (confirmed) {
                                const staffData = staffDoc.data();
                                const statusText = `완료(${staffData.이름})`;


                                // 계약 상태 업데이트
                                await setDoc(doc(db, 'cs', csDoc.id), { 계약여부: statusText }, { merge: true });

                                // 업데이트된 내용을 계약여부 셀에 바로 표시
                                cellContractStatus.innerHTML = statusText;

                                // 시간을 표시할 셀 생성 및 업데이트
                                const timeCell = document.createElement('div');
                                const currentDate = new Date();

                                // 계약 상태 업데이트
                                await setDoc(
                                    doc(db, 'cs', csDoc.id),
                                    { 체결날짜: currentDate },
                                    { merge: true }
                                );

                                // 업데이트된 내용을 계약여부 셀에 바로 표시

                                const formattedDateTime = currentDate.toLocaleString('ko-KR', options);
                                timeCell.innerHTML = formattedDateTime;
                                cellTime.appendChild(timeCell);

                                // HTML에는 문자열 형태로 표시
                                cellTime.innerHTML = formattedDateTime;
                            }
                        });

                        // 진행중 버튼
                        const waitingButton = document.createElement('button');
                        waitingButton.innerText = '진행 중';
                        waitingButton.addEventListener('click', async () => {
                            const confirmed = confirm('진행중 버튼을 누르시겠습니까?');

                            if (confirmed) {
                                const staffData = staffDoc.data();
                                const statusText = `진행중(${staffData.이름})`;

                                // 계약 상태 업데이트
                                await setDoc(doc(db, 'cs', csDoc.id), { 계약여부: statusText }, { merge: true });

                                // 업데이트된 내용을 계약여부 셀에 바로 표시
                                cellContractStatus.innerHTML = statusText;


                                // 시간을 표시할 셀 생성 및 업데이트
                                const timeCell = document.createElement('div');
                                const currentDate = new Date();

                                // 계약 상태 업데이트
                                await setDoc(
                                    doc(db, 'cs', csDoc.id),
                                    { 체결날짜: currentDate },
                                    { merge: true }
                                );

                                // 업데이트된 내용을 계약여부 셀에 바로 표시

                                const formattedDateTime = currentDate.toLocaleString('ko-KR', options);
                                timeCell.innerHTML = formattedDateTime;
                                cellTime.appendChild(timeCell);

                                // HTML에는 문자열 형태로 표시
                                cellTime.innerHTML = formattedDateTime;



                                cellContractStatus.appendChild(completeButton);
                                cellContractStatus.appendChild(failButton);


                            }
                        });

                        // 실패 버튼
                        const failButton = document.createElement('button');
                        failButton.innerText = '실 패';
                        failButton.addEventListener('click', async () => {
                            const confirmed = confirm('실패 버튼을 누르시겠습니까?');
                            if (confirmed) {
                                const staffData = staffDoc.data();
                                const statusText = `실패(${staffData.이름})`;

                                // 계약 상태 업데이트
                                await setDoc(doc(db, 'cs', csDoc.id), { 계약여부: statusText }, { merge: true });

                                // 업데이트된 내용을 계약여부 셀에 바로 표시
                                cellContractStatus.innerHTML = statusText;

                                // 시간을 표시할 셀 생성 및 업데이트
                                const timeCell = document.createElement('div');
                                const currentDate = new Date();

                                // 계약 상태 업데이트
                                await setDoc(
                                    doc(db, 'cs', csDoc.id),
                                    { 체결날짜: currentDate },
                                    { merge: true }
                                );

                                // 업데이트된 내용을 계약여부 셀에 바로 표시

                                const formattedDateTime = currentDate.toLocaleString('ko-KR', options);
                                timeCell.innerHTML = formattedDateTime;
                                cellTime.appendChild(timeCell);

                                // HTML에는 문자열 형태로 표시
                                cellTime.innerHTML = formattedDateTime;
                            }
                        });


                        const staffData = staffDoc.data();

                        // 각 버튼을 셀에 추가
                        if (!cellContractStatus.hasChildNodes()) {
                            // 셀이 이미 버튼을 포함하고 있지 않을 경우에만 버튼 추가
                            cellContractStatus.appendChild(completeButton);
                            cellContractStatus.appendChild(failButton);
                            cellContractStatus.appendChild(waitingButton);

                        } if (cellContractStatus.innerHTML === `진행중(${staffData.이름})`) {
                            cellContractStatus.appendChild(completeButton);
                            cellContractStatus.appendChild(failButton);
                        }



                    });
                } else {
                    console.error("테이블 요소를 찾을 수 없습니다.");
                }
            }
        } else {
            // 사용자가 로그인하지 않은 경우, 로그인 페이지로 리다이렉션 또는 경고 메시지 등을 처리할 수 있습니다.
            console.log("사용자가 로그인하지 않았습니다.");
            alert('로그인이 필요합니다.');
            window.location.href = "stafflogin.html";
        }

    });





    // 로그아웃 버튼에 클릭 이벤트 리스너 추가
    const logoutButton = document.getElementById('logoutButton');
    logoutButton.addEventListener('click', () => {
        signOut(auth)
            .then(() => {
                console.log('로그아웃 성공');
                history.replaceState({}, '', 'stafflogin.html');
                window.location.href = "stafflogin.html";
                // 로그아웃 후 필요한 동작을 추가할 수 있습니다.
            })
            .catch((error) => {
                console.error('로그아웃 실패:', error.message);
            });
    });
});




