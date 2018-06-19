/**
 * Created by chaoqin on 17/10/12.
 */

import React from 'react';
import {Table, Col, Row} from 'antd';
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

    setDetailContent = () => {
        if(this.state.role.promotiontype == '7'){
            const xdljCol = [
                {title: '商品名称', dataIndex: 'name'},
                {title: '物料编码', dataIndex: 'materialNumber'},
                {title: '商品编码', dataIndex: 'gcode'},
                {title: '商品价格', dataIndex: 'salePrice'},
                {title: '优惠价格', dataIndex: 'discount'},
            ];

            return (
                <div>
                    <h5>下单立减商品</h5>
                    <Table
                        loading={this.state.loading}
                        columns={xdljCol}
                        dataSource={this.state.mainProducts}
                        rowKey={record => record.gcode}
                    />
                </div>
            )
        }else if(this.state.role.promotiontype == '3'){
            const tczspCol = [
                {title: '商品名称', dataIndex: 'name'},
                {title: '物料编码', dataIndex: 'materialNumber'},
                {title: '商品编码', dataIndex: 'gcode'},
                {title: '商品价格', dataIndex: 'salePrice'}
            ];

            const tcglpCol = [
                {title: '商品名称', dataIndex: 'name'},
                {title: '物料编码', dataIndex: 'materialNumber'},
                {title: '商品编码', dataIndex: 'gcode'},
                {title: '商品价格', dataIndex: 'salePrice'},
                {title: '优惠价格', dataIndex: 'discount'},
            ];

            return (
                <div>
                    <h5>主品</h5>
                    <Table
                        loading={this.state.loading}
                        columns={tczspCol}
                        dataSource={this.state.mainProducts}
                        rowKey={record => record.gcode}
                    />
                    <h5>关联商品</h5>
                    <Table
                        loading={this.state.loading}
                        columns={tcglpCol}
                        dataSource={this.state.relProducts}
                        rowKey={record => record.gcode}
                    />
                </div>
            )
        }else if(this.state.role.promotiontype == '1'){
            const zpzspCol = [
                {title: '商品名称', dataIndex: 'name'},
                {title: '物料编码', dataIndex: 'materialNumber'},
                {title: '商品编码', dataIndex: 'gcode'},
                {title: '商品价格', dataIndex: 'salePrice'},
            ];

            const zpCol = [
                {title: '商品名称', dataIndex: 'name'},
                {title: '物料编码', dataIndex: 'materialNumber'},
                {title: '商品编码', dataIndex: 'gcode'},
                {title: '商品价格', dataIndex: 'salePrice'},
                {title: '数量', dataIndex: 'quantity'}
            ];

            return (
                <div>
                    <h5>主品</h5>
                    <Table
                        loading={this.state.loading}
                        columns={zpzspCol}
                        dataSource={this.state.mainProducts}
                        rowKey={record => record.gcode}
                    />
                    <h5>赠品</h5>
                    <Table
                        loading={this.state.loading}
                        columns={zpCol}
                        dataSource={this.state.relProducts}
                        rowKey={record => record.gcode}
                    />
                </div>
            )
        }
    };

    render () {
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

                { this.setDetailContent() }
            </div>
        );
    }
}

export default SalesDetail;
