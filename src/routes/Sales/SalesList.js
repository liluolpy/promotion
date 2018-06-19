/**
 * Created by chaoqin on 17/10/12.
 */

import React from 'react';
import {Table, Alert, Button, Select, Input, Col, Row, Form, notification} from 'antd';
import styles from './sales.css';
import request from '../../utils/request';
import { domain } from '../../models/config';
import base from '../../models/base';

const pageSize = 10;

const Option = Select.Option;
const FormItem = Form.Item;
const formItemLayout = {
    labelCol: {span: 6},
    wrapperCol: {span: 14},
};

const body = {
    "faIds": null,
    "userid": loginInfo.loginId,
    "shopIds": base.getShopIds()
};

class SalesList extends React.Component {
    constructor(props){
        super(props);

        this.state = {
            data: [],
            searchData: {},
            ckItems: [],
            total: 0,
            loading: false,
            storeData: [],
            storeId: []
        };

        this.shopId = loginInfo.rCode;
    }

    componentDidMount() {
        let that = this;

        base.getFaInfo().then((res)=>{
            if(res.data.code == '200'){
                let data = res.data.data && res.data.data[0] && res.data.data[0].permission, faIds = [], allCode = [], all = {label: '全部', value: ''};

                faIds.push(all);

                for(let i=0; i<data.length; i++){
                    allCode.push(data[i].value);

                    faIds.push(data[i]);
                }

                all.value = allCode.join(',');

                this.setState({ storeData: faIds }, function(){
                    that.search();
                })
            }else{
                base.openNotification('error', '查询店铺失败！');
            }
        });
    };

    openNotification = (type, desc) => {
        notification[type]({
            message: '提示信息',
            description: desc
        })
    };

    search = (page = 1) => {
        let option = this.state.searchData;
        let name = option.salesName || '',
            type = option.salesType || '',
            disabled = option.disabled || '',
            wlcode = option.goodsCode || '',
            salesCode = option.salesCode || '',
            shopId = this.shopId;

        if(this.state.storeId.length>0){
            body['faIds'] = this.state.storeId;
        }else{
            body['faIds'] = this.state.storeData[0] && this.state.storeData[0].value.split(',');
        }

        this.setState({ loading: true });
        request(`${domain}pcsd-hs-promotion-admin/api/promotion/list.jhtm?pageNum=${page}&pageSize=${pageSize}&promotionName=${name}&PromotionType=${type}&disabled=${disabled}&mainMaterialNumber=${wlcode}&relMaterialNumber=${salesCode}&shopId=${shopId}`, {
            method: 'POST',
            headers: {'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'},
            body: 'authdata='+JSON.stringify(body)
        }).then((res) => {
            this.setState({ loading: false });

            if(res.data.resultCode == '0'){
                this.setState({data: res.data.t.datas, total: parseInt(res.data.t.totalCount)});
            }else{
                base.openNotification('error', '查询失败，请稍后重试!');
            }
        });
    };

    handleSearch = (e) => {
        e.preventDefault();
        let that = this;
        this.props.form.validateFields((err, values) => {
            if (!err) {
                that.setState({searchData: values}, function(){
                    that.search();
                });
            }
        });
    };

    handleReset = () => {
        this.props.form.resetFields();
        this.setState({ storeId: []});
    };

    renderDisabled = (text) => {
        if(text == "是"){
            return (<span><i className={styles.success}>•</i>是</span>);
        }else{
            return (<span><i className={styles.error}>•</i>否</span>);
        }
    };

    newHandler = () => {
        location.hash='/sales/save/add/0/0';
    };

    editHandler = () => {
        let ckitems = this.state.ckItems;

        if(ckitems.length != 1){
            base.openNotification('error', '请选中一条数据进行编辑！');
            return;
        }

        location.hash=`/sales/save/edit/${ckitems[0].shopid}/${ckitems[0].id}`;
    };

    delHandler = () => {
        let ckitems = this.state.ckItems,
            ids = [],
            shopId = this.shopId;

        if(ckitems.length != 1){
            base.openNotification('error', '请选中一条数据进行删除！');
            return;
        }

        for(let i=0; i<ckitems.length; i++){
            ids.push(ckitems[i].id);
        }

        this.setState({ loading: true });
        request(`${domain}pcsd-hs-promotion-admin/api/promotion/delete.jhtm`, {
            method: 'POST',
            headers: {'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'},
            body: `authdata=${JSON.stringify(body)}&shopId=${shopId}&ids=${ids}`
        }).then((res) => {
            this.setState({ loading: false });

            if(res.data.t && res.data.t.rc == '0'){
                base.openNotification('success', '删除成功!');
                this.setState({ ckItems: [] });
                this.search();
            }else{
                base.openNotification('error', res.data.resultMsg);
            }
        });
    };

    checkHandler = () => {
        let ckitems = this.state.ckItems,
            ids = [],
            shopId = this.shopId;

        if(ckitems.length == 0){
            base.openNotification('error', '请至少选中一条数据进行审核！');
            return;
        }

        for(let i=0; i<ckitems.length; i++){
            ids.push(ckitems[i].id);
        }

        this.setState({ loading: true });
        request(`${domain}pcsd-hs-promotion-admin/api/promotion/submitAudit.jhtm`, {
            method: 'POST',
            headers: {'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'},
            body: `authdata=${JSON.stringify(body)}&shopId=${shopId}&ids=${ids}`
        }).then((res) => {
            this.setState({ loading: false });

            if(res.data.t && res.data.t.rc == '0'){
                base.openNotification('success', '提交成功!');
                this.search();
            }else{
                base.openNotification('error', res.data.t.msg);
            }
        });
    };

    transformShopbyId = (text) => {
        for(let i=0; i<base.shopsData.length; i++){
            if(text == base.shopsData[i].code){
                return base.shopsData[i].name;
            }
        }
    };

    detailHandler = () => {
        let ckitems = this.state.ckItems;

        if(ckitems.length != 1){
            base.openNotification('error', '请选中一条数据进行查看！');
            return;
        }

        location.hash=`/sales/detail/${ckitems[0].shopid}/${ckitems[0].id}`;
    };

    checkStore = (value, option) => {
        let _data = option.props.mid;
        this.setState({ storeId: _data.value.split(',') });
    };

    setStoreOptions = () => {
        let options = [];

        if(this.state.storeData.length == 0){
            options.push(<Option key={ '暂无门店信息' } mid={{}}>暂无门店信息</Option>);

            return options;
        }

        for(let i=0; i<this.state.storeData.length; i++){
            options.push(<Option key={ this.state.storeData[i].value } search={ this.state.storeData[i].label } value={ this.state.storeData[i].value } mid={ this.state.storeData[i] }>{ this.state.storeData[i].label }</Option>);
        }

        return options;
    };

    render () {
        const {getFieldDecorator} = this.props.form;

        const columns = [
            {
                title: '促销名称',
                dataIndex: 'promotionName',
            },
            {
                title: '商城',
                dataIndex: 'shopid',
                render: this.transformShopbyId
            },
            {
                title: '促销类型',
                dataIndex: 'promotionType',
            },
            {
                title: '促销平台',
                dataIndex: 'terminalName',
            },
            {
                title: '启用状态',
                dataIndex: 'disabled',
                render: this.renderDisabled
            },
            {
                title: '审核状态',
                dataIndex: 'status',
            },
            {
                title: '主物料编号',
                dataIndex: 'mainProductMaterial',
            },
            {
                title: '促品物料号',
                dataIndex: 'relProductMaterial',
            },
            {
                title: '创建时间',
                dataIndex: 'createTime',
            }
        ];

        const rowSelection = {
            onChange: (selectedRowKeys, selectedRows) => {
                this.setState({ckItems: selectedRows});
            }
        };

        const pagination = {
            total: this.state.total,
            pageSize,
            onChange: (page, pageSize) => {
                this.search(page);
            }
        };

        return (
            <div>
                <Form
                    className={styles.form}
                    onSubmit={this.handleSearch}
                >
                    <Row gutter={16}>
                        {/*<Col span={8}>
                            <FormItem {...formItemLayout} label="商城">
                                { getFieldDecorator('shopId', {
                                    initialValue: '20',
                                    rules: [{required: true, message: '请选择商城!'}]
                                })(
                                    <Select placeholder="请选择商城">
                                        { base.setOptions(base.shopsData) }
                                    </Select>
                                ) }
                            </FormItem>
                        </Col>*/}
                        <Col span={8} style={{ clear: 'both' }}>
                            <FormItem {...formItemLayout} label="店铺">
                                { getFieldDecorator('group',{
                                    initialValue: this.state.storeData[0] && this.state.storeData[0].value
                                })(
                                    <Select
                                        showSearch={true}
                                        placeholder="请输入店铺名称"
                                        optionFilterProp="search"
                                        onSelect={ this.checkStore }
                                    >
                                        { this.setStoreOptions() }
                                    </Select>
                                ) }
                            </FormItem>
                        </Col>
                        <Col span={8}>
                            <FormItem {...formItemLayout} label="促销类型">
                                { getFieldDecorator('salesType', {initialValue: ''})(
                                    <Select placeholder="请选择类型">
                                        { base.setOptions(base.salesType) }
                                    </Select>
                                ) }
                            </FormItem>
                        </Col>
                        <Col span={8}>
                            <FormItem {...formItemLayout} label="促销名称">
                                { getFieldDecorator('salesName', {initialValue: ''})(
                                    <Input placeholder="请输入促销名称" />
                                ) }
                            </FormItem>
                        </Col>
                        <Col span={8}>
                            <FormItem {...formItemLayout} label="主品物料号">
                                { getFieldDecorator('goodsCode', {initialValue: ''})(
                                    <Input placeholder="请输入主品物料号" />
                                ) }
                            </FormItem>
                        </Col>
                        <Col span={8}>
                            <FormItem {...formItemLayout} label="促品物料号">
                                { getFieldDecorator('salesCode', {initialValue: ''})(
                                    <Input placeholder="请输入促品物料号" />
                                ) }
                            </FormItem>
                        </Col>
                        <Col span={8}>
                            <FormItem {...formItemLayout} label="启用类型">
                                { getFieldDecorator('disabled', {initialValue: ''})(
                                    <Select placeholder="请选择启用状态">
                                        <Option value="1">启用</Option>
                                        <Option value="0">停用</Option>
                                    </Select>
                                ) }
                            </FormItem>
                        </Col>
                        <Col span={8} style={{textAlign: 'right', float: 'right'}}>
                            <Button type="primary" htmlType="submit">查询</Button>
                            <Button style={{marginLeft: 8}} onClick={this.handleReset}>重置</Button>
                        </Col>
                    </Row>
                </Form>

                <div className={styles.operations}>
                    <Button type="primary" onClick={this.newHandler} style={{ marginLeft: 8 }}>新建</Button>
                    <Button type="primary" onClick={this.editHandler} style={{ marginLeft: 8 }}>修改</Button>
                    <Button type="primary" onClick={this.delHandler} style={{ marginLeft: 8 }}>删除</Button>
                    <Button type="primary" onClick={this.checkHandler} style={{ marginLeft: 8 }}>提交审核</Button>
                    <Button type="primary" onClick={this.detailHandler} style={{ marginLeft: 8 }}>详情</Button>
                </div>

                <Alert message={(<p>已选择 <span className={styles.blue}>{this.state.ckItems.length}</span> 项 | 请点击批量按钮进行批量操作</p>)} type="info" showIcon className={styles.tips} />

                <Table
                    loading={ this.state.loading }
                    rowSelection={rowSelection}
                    columns={columns}
                    dataSource={this.state.data}
                    rowKey={record => record.id}
                    pagination={ pagination }
                />
            </div>
        );
    }
}

export default Form.create()(SalesList);
