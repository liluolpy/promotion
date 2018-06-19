import React from 'react';
import { Router, Route } from 'dva/router';

// import Index from './routes/app';
import {LayoutConnect} from './components/MainLayout/LayoutNew';
import LayoutBack from './routes/Index';

//import CouponList from './routes/Coupon/CouponList';
import CouponSave from './routes/Coupon/CouponSave';
import CouponEdit from './routes/Coupon/CouponEdit';
import CouponList from './routes/Coupon/CouponList';
import CouponDetail from './routes/Coupon/CouponDetail';
import CouponSA from './routes/Coupon/CouponSendAll';
import CouponSM from './routes/Coupon/CouponSendMore';
import CheckList from './routes/Coupon/CouponCkList';
import CouponList_iframe from './routes/Coupon/list_iframe';
import CouponCheckList_iframe from './routes/Coupon/checkList_iframe';
import MemberCoupon from './routes/Coupon/MemberCoupon';
import MemberDetail from './routes/Coupon/CouponMemberDetail';
import CouponRecord from './routes/Coupon/CouponRecord';

import SalesList from './routes/Sales/SalesList';
import SalesSave from './routes/Sales/NewSalesSave';
import SalesDetail from './routes/Sales/NewSalesDetail';
import SalesCkeckList from './routes/Sales/SalesCheckList';

function RouterConfig({ history }) {
    const terminal = localStorage.getItem('terminal');

    const renderLayout = props => {
        if(terminal == 'frontend'){
            return <LayoutConnect { ...props } />
        }else{
            return <LayoutBack { ...props } />
        }
    };
    return (
        <Router history={history}>
            <Route path="/" components={renderLayout}>
                <Route path="/coupon/list" component={CouponList} />
                <Route path="/coupon/save" component={CouponSave} />
                <Route path="/coupon/edit/:id" component={CouponEdit} />
                <Route path="/coupon/detail/:id/:type" component={CouponDetail} />
                <Route path="/coupon/sendall/:id" component={CouponSA} />
                <Route path="/coupon/sendmore/:id" component={CouponSM} />
                <Route path="/coupon/check" component={CheckList} />
                <Route path="/coupon/membercoupon" component={MemberCoupon} />
                <Route path="/coupon/memberdetail/:id/:type" component={MemberDetail} />
                <Route path="/coupon/couponRecord" component={CouponRecord} />

                <Route path="/sales/list" component={SalesList} />
                <Route path="/sales/save/:actionType/:shopid/:salesid" component={SalesSave} />
                <Route path="/sales/detail/:shopid/:salesid" component={SalesDetail} />
                <Route path="/sales/checklist" component={SalesCkeckList} />
            </Route>
        </Router>
    );
}

export default RouterConfig;
