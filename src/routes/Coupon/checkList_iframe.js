/**
 * Created by liuyc14 on 2017/11/28.
 */
import React from 'react';
import { couponIp } from '../../models/config';

export default class CheckList_iframe extends React.Component {
    render(){
        return (
            <iframe src={`${couponIp}/sales/returnCouponChecksList.jhtm`} style={{height:580, width:'99%'}} frameBorder="0"></iframe>
        );
    }
}