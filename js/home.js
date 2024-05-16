

$(document).ready(function () {
    $('#fullpage').fullpage({
        sectionsColor: ['#ff5733', '#2980b9', '#27ae60', '#451fad'],
        navigation: true,
        scrollingSpeed: 500,
        touchSensitivity: 10,
        controlArrows: false,
        slidesNavigation: true,
        slidesNavPosition: 'right',
        responsiveWidth: 300,
        responsiveHeight: 400,


    });
});

// 토글 메뉴
document.addEventListener('DOMContentLoaded', function () {
    var menuIcon = document.getElementById('menu-icon');
    var subMenu = document.querySelector('.sub-menu');

    menuIcon.addEventListener('click', function () {
        subMenu.classList.toggle('active'); // 메뉴를 토글
    });
});