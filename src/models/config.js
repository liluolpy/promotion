const domain = document.domain;
let base = "https://" + (/dev\./.test(domain) ? "api-dev" : (/uat\./.test(domain) ? "api-sandbox" : "api")) + ".unifiedcloud.lenovo.com/";
const couponIp = "http://" + (/dev\./.test(domain) ? "10.120.113.14:8081" : (/uat\./.test(domain) ? "10.120.113.14:8081" : "10.96.104.21:8081"));

if (domain.indexOf('localhost') != -1) {
    base = '/api/';
}

export default {
    "couponIp": couponIp,
    "domain": base,
    "couponapi": base + "pcsd-hs-coupon-web/",
    "/sales": "促销方案管理",
    "/sales/list": "促销方案列表",
    "/sales/detail": "促销方案详情",
    "/sales/save": "编辑促销方案",
    "/sales/checklist": "促销方案审核列表",

    "/coupon": "优惠券管理",
    "/coupon/list": "优惠券列表",
    "/coupon/check": "优惠券审核列表",
    "/coupon/save": "新建优惠卷",
    "/coupon/edit": "修改优惠卷",
    "/coupon/membercoupon": "用户优惠券",
    "/coupon/couponRecord": "用户消费历史",
}
