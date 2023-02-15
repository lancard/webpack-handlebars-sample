const $ = require('jquery');
const dayjs = require('dayjs');
const queryString = require('query-string');
const mobileDeviceDetect = require('mobile-device-detect');
const path = require('path-webpack');

/**
 * 홈페이지에서 사용되는 글로벌 함수 모음
 * @module common
 */
module.exports = {
    /**
     * GA를 로딩합니다. (async로 로딩)
     */
    loadGoogleAnalytics: () => {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
            'gtm.start': new Date().getTime(),
            event: 'gtm.js'
        });
        const f = document.getElementsByTagName('script')[0];
        const j = document.createElement('script');
        j.async = true;
        j.src = 'https://www.googletagmanager.com/gtm.js?id=GTM-123456';
        f.parentNode.insertBefore(j, f);
    },
    /**
     * GET 방식의 파라메터를 가져옵니다.
     * @param {string} name 가져올 파라메터 이름
     * @returns {string} 해당 value
     */
    getUrlParameter: (name) => {
        const parsed = queryString.parse(location.search);
        if (name == undefined) { return parsed; }

        return parsed[name];
    },
    /**
     * 페이징 영역을 생성하는 객체입니다. (new로 생성) - 생성 후 변경 시 refresh 함수를 호출(currentPageNo, totalRowCount)
     * @param {string} selector jQuery 선택자
     * @param {number} totalRowCount 전체 아이템 개수
     * @param {string} callback 아이템 클릭 시 호출할 함수 - 클릭한 페이지 번호를 파라메터로 던짐
     */
    DefaultPaginator: function (selector, rowsPerPage, callback) {
        this.selector = selector;
        this.rowsPerPage = rowsPerPage;
        this.callback = callback;
        this.refresh = function (currentPageNo, totalRowCount) {
            function getOrderListItem(pageNo) {
                const aTag = $("<a>").attr('href', 'javascript: void(0);')
                    .on('click', function () { callback(+$(this).parents("li").attr('data-pageNo')); })
                    .text(pageNo);
                return $("<li>").attr('data-pageNo', pageNo).append(aTag);
            }

            const mainDiv = $("<div>").addClass("paging");
            const maxPageNo = Math.ceil(totalRowCount / rowsPerPage);
            const prevPageNo = Math.max(currentPageNo - 1, 1);
            const nextPageNo = Math.min(currentPageNo + 1, maxPageNo);
            let preAbbreviation = false; // 앞쪽 축약 표시
            let postAbbreviation = false; // 뒷쪽 축약 표시
            if (currentPageNo >= 5) { preAbbreviation = true; }
            if (currentPageNo <= maxPageNo - 4) { postAbbreviation = true; }

            // prev a tag
            const prevATag = $("<a>")
                .append('<span class="hidden">이전으로</span><span class="paging-ico"></span>')
                .addClass('paging-prev')
                .attr('href', 'javascript: void(0);')
                .on('click', function () { callback(prevPageNo); });
            if (currentPageNo <= 1) prevATag.addClass('is-disabled');

            // next a tag
            const nextATag = $("<a>")
                .append('<span class="hidden">다음으로</span><span class="paging-ico"></span>')
                .addClass('paging-next')
                .attr('href', 'javascript: void(0);')
                .on('click', function () { callback(nextPageNo); });
            if (currentPageNo == maxPageNo) nextATag.addClass('is-disabled');

            // ordered list
            const orderedListTag = $("<ol>").addClass("paging-list");

            // 현재 페이지 앞쪽
            if (preAbbreviation) {
                // 축약되는 형태
                orderedListTag.append(getOrderListItem(1).addClass("paging-first"));
                orderedListTag.append("<li class='paging-infinite'>...</li>");
                orderedListTag.append(getOrderListItem(currentPageNo - 2));
                orderedListTag.append(getOrderListItem(currentPageNo - 1));
            } else {
                // 축약되지 않는 형태
                let p = currentPageNo - 3;
                while (p < currentPageNo) {
                    if (p < 1) { p++; continue; }
                    orderedListTag.append(getOrderListItem(p));
                    p++;
                }
            }

            // 현재 아이템
            orderedListTag.append(getOrderListItem(currentPageNo).addClass("is-active"));

            // 현재 페이지 뒷쪽
            if (postAbbreviation) {
                // 축약되는 형태
                orderedListTag.append(getOrderListItem(currentPageNo + 1));
                orderedListTag.append(getOrderListItem(currentPageNo + 2));
                orderedListTag.append("<li class='paging-infinite'>...</li>");
                orderedListTag.append(getOrderListItem(maxPageNo).addClass("paging-total"));
            } else {
                // 축약되지 않는 형태
                let p = currentPageNo + 1;
                while (p <= maxPageNo) {
                    orderedListTag.append(getOrderListItem(p));
                    p++;
                }
            }

            // 최종적으로 다 붙임
            mainDiv.append(prevATag);
            mainDiv.append(orderedListTag);
            mainDiv.append(nextATag);

            $(selector).empty();
            $(selector).append(mainDiv);
        }
    },
    /**
     * 엔터키 핸들러를 등록합니다.
     * @param {string} selector 선택할 DOM 객체 selector
     * @param {function} callback 콜백 함수
     */
    addEnterKeyEventHandler: (selector, callback) => {
        $(selector).on("keyup", function (event) {
            const key = event.key || event.keyCode;

            if (key === 'Enter' || key === 13) {
                callback();
            }
        });
    }
};
