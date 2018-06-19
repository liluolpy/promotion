/**
 * Created by chaoqin on 17/10/17.
 */
import React from 'react';
import { couponIp } from '../../models/config';

export default class CouponRecord_iframe extends React.Component {
    render(){
        return (
            <iframe src={`${couponIp}/log/memberCouponTransferPage.jhtm`} style={{height:580, width:'99%'}} frameBorder="0"></iframe>
        );
    }
}
