/**
 * Created by chaoqin on 17/10/12.
 */

import React from 'react';
import {Table, Col, Row, Button} from 'antd';
import styles from './sales.css';
import request from '../../utils/request';
import { domain } from '../../models/config';
import base from '../../models/base';

class SalesDetail extends React.Component {
    constructor(props){
        super(props);

        this.state = {
            loading: false,
            role: {},
            mainProducts: [],
            relProducts: [],
            group: {}
        }
    }

    componentDidMount() {
        const { params } = this.props;

        this.getDetail(params.shopid, params.salesid);
    }

    getDetail = (shopId, salesId) => {
        this.setState({loading: true});
        let body = {
            "faIds": null,
            "userid": loginInfo.loginId,
            "shopIds": base.getShopIds()
        };

        request(`${domain}pcsd-hs-promotion-admin/api/promotion/get.jhtm?id=${salesId}&shopId=${shopId}`,{
                method: 'POST',
                headers: {'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'},
                body: 'authdata='+JSON.stringify(body)
            }
        ).then((res)=>{
            this.setState({loading: false});
            if(res.data.resultCode == '0'){
                this.setState({
                    role: res.data.t.role,
                    mainProducts: res.data.t.mainProducts,
                    relProducts: res.data.t.relProducts,
                    group: res.data.t.groups[0]
                });
            }else{
                base.openNotification('error', '查询订单详情失败，请稍后重试！');
            }
        });
    };

    backList = () => {
        location.hash = '/sales/list';
    };

    render () {
        const type = this.state.role.promotiontype;

        let mainTxt = '主品',
            relTxt = '',
            mainCol = [
                {title: '商品名称', dataIndex: 'name'},
                {title: '物料编码', dataIndex: 'materialNumber'},
                {title: '商品编码', dataIndex: 'gcode'},
                {title: '商品价格', dataIndex: 'salePrice'},
            ],
            relCol = [
                {title: '商品名称', dataIndex: 'name'},
                {title: '物料编码', dataIndex: 'materialNumber'},
                {title: '商品编码', dataIndex: 'gcode'},
                {title: '商品价格', dataIndex: 'salePrice'}
            ],
            couponCol = [
                {title: '券ID', dataIndex: 'id'},
                {title: '券名称', dataIndex: 'name'},
                {title: '总库存', dataIndex: 'totalStock'},
                {title: '可用库存', dataIndex: 'availableStock'},
                {title: '有效期范围', render: (text, record) => { return (record.beginTime + '--' + record.endTime) }},
                {title: '优惠券类型', render: (text, record) => base.transformCoupon(text, record) },
                {title: '金额', dataIndex: 'cost'},
                {title: '描述', dataIndex: 'description', width: 300},
            ];

        if(type == 1){
            relTxt = '赠品';
            relCol.splice(4, 0, {title: '数量', dataIndex: 'quantity'});
        }else if(type == 3){
            relTxt = '关联品';
            relCol.splice(4, 0, {title: '优惠价格', dataIndex: 'discount'});
        }else if(type == 4){
            relTxt = '赠券';
        }else if(type == 7){
            mainTxt = '下单立减商品';
            mainCol.splice(4, 0, {title: '优惠价格', dataIndex: 'discount'},)
        }

        return (
            <div className={styles.salesDetail}>
                <h5>促销信息</h5>
                <Row gutter={16} className={styles.rows}>
                    <Col span={8} className={styles.lineStyle}><span>商城:</span>{ base.transformNameById(base.shopsData, this.state.role.shopid) }</Col>
                    <Col span={8} className={styles.lineStyle}><span>促销名称:</span>{ this.state.role.promotionname }</Col>
                    <Col span={8} className={styles.lineStyle}><span>促销类型:</span>{ base.transformNameById(base.salesType, this.state.role.promotiontype) }</Col>
                    <Col span={8} className={styles.lineStyle}><span>推广平台:</span>{ this.state.role.terminalName }</Col>
                    <Col span={8} className={styles.lineStyle}><span>启用状态:</span>{ this.state.role.disabled == 1 ? "启用" : "停用" }</Col>
                    <Col span={8} className={styles.lineStyle}><span>店铺:</span>{ this.state.group.groupName }</Col>
                    <Col span={8} className={styles.lineStyle}><span>开始日期:</span>{ this.state.role.fromtime }</Col>
                    <Col span={16} className={styles.lineStyle}><span>结束日期:</span>{ this.state.role.totime }</Col>
                    <Col span={24} className={styles.lineStyle}><span>描述:</span>{ this.state.role.description }</Col>
                </Row>

                <div>
                    <h5>{ mainTxt }</h5>
                    <Table
                        loading={this.state.loading}
                        columns={ mainCol }
                        dataSource={this.state.mainProducts}
                        rowKey={record => record.gcode}
                    />
                    {
                        type != 7 ?
                        <div>
                            <h5>{ relTxt }</h5>
                            <Table
                                loading={this.state.loading}
                                columns={ type == 4 ? couponCol : relCol }
                                dataSource={this.state.relProducts}
                                rowKey={record => type == 4 ? record.id : record.gcode}
                            />
                        </div> :
                        null
                    }
                </div>

                <Row gutter={16} style={{ textAlign: 'right' }}>
                    <Col>
                        <Button type="primary" onClick={this.backList}>返回</Button>
                    </Col>
                </Row>
            </div>
        );
    }
}

export default SalesDetail;
