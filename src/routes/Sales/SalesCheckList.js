/**
 * Created by chaoqin on 17/10/24.
 */

import React from 'react';
import {Table, Button, Input, Col, Row, Form, Select, Alert, Modal} from 'antd';
import request from '../../utils/request';
import { domain } from '../../models/config';
import base from '../../models/base';
import styles from './sales.css';

const FormItem = Form.Item;
const Option = Select.Option;
const formItemLayout = {
    labelCol: {span: 8},
    wrapperCol: {span: 14},
};
const pageSize = 10;
const body = {
    "faIds": null,
    "userid": loginInfo.loginId,
    "shopIds": base.getShopIds()
};

class SalesCheckList extends React.Component {
    constructor(props){
        super(props);

        this.state = {
            data: [],
            loading: false,
            searchData: {},
            ckItems: [],
            total: 0,
            rejectModal: false,
            storeData: [],
            storeId: []
        };

        this.shopId = loginInfo.rCode;
    }

    componentDidMount() {
        //this.search();
        base.getFaInfo().then((res)=>{
            if(res.data.code == '200'){
                let data = res.data.data && res.data.data[0] && res.data.data[0].permission, faIds = [], allCode = [], all = {label: '全部', value: ''};

                faIds.push(all);

                for(let i=0; i<data.length; i++){
                    allCode.push(data[i].value);

                    faIds.push(data[i]);
                }

                all.value = allCode.join(',');

                this.setState({ storeData: faIds })
            }else{
                base.openNotification('error', '查询店铺失败！');
            }
        });
    };

    search = (page = 1) => {
        let option = this.state.searchData,
            shopId = this.shopId,
            status = option.checkStatus;

        if(this.state.storeId.length>0){
            body['faIds'] = this.state.storeId;
        }else{
            body['faIds'] = this.state.storeData[0] && this.state.storeData[0].value.split(',');
        }

        this.setState({ loading: true });
        request(`${domain}pcsd-hs-promotion-admin/api/promotion/auditList.jhtm`, {
            method: 'POST',
            headers: {'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'},
            body: `authdata=${JSON.stringify(body)}&pageNum=${page}&pageSize=${pageSize}&shopId=${shopId}&checkStatus=${status}`
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
        this.props.form.validateFields(['checkStatus'], (err, values) => {
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

    approve = () => {
        let ckItems = this.state.ckItems, rejectArr = [], approveArr = [], ids = [], shopId = this.shopId;

        if(ckItems.length == 0){
            base.openNotification('error', '请至少选中一条数据进行审核！');
            return;
        }

        for(let i=0; i<ckItems.length; i++){
            if(ckItems[i].checkstatus == 3){ /*已驳回的*/
                rejectArr.push(ckItems[i].promotionName);
                console.log('已驳回的', rejectArr);
            }else if(ckItems[i].checkstatus == 2){ /*已审核通过的*/
                approveArr.push(ckItems[i].promotionName);
                console.log('已审核通过的', approveArr);
            }else if(ckItems[i].checkstatus == 1){ /*待审核*/
                ids.push(ckItems[i].id);
                console.log('待审核', ids);
            }
        }

        if(rejectArr.length > 0){
            base.openNotification('error', rejectArr.join(',')+'已被驳回，不能通过审核！');

            return;
        }

        if(approveArr.length > 0){
            base.openNotification('error', approveArr.join(',')+'已经审核通过，不能重复审核！');

            return;
        }

        this.setState({ loading: true });
        request(`${domain}pcsd-hs-promotion-admin/api/promotion/audit.jhtm`, {
            method: 'POST',
            headers: {'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'},
            body: `authdata=${JSON.stringify(body)}&shopId=${shopId}&ids=${ids.join(',')}&status=1`
        }).then((res) => {
            this.setState({ loading: false });

            if(res.data.t && res.data.t.rc == '0'){
                base.openNotification('success', '审核通过!');
                this.search();
            }else{
                base.openNotification('error', res.data.t.msg);
            }
        });
    };

    reject = () => {
        let ckItems = this.state.ckItems;

        if(ckItems.length != 1){
            base.openNotification('error', '请选中一条数据进行驳回！');
            return;
        }

        if(ckItems[0].checkstatus == 3){
            base.openNotification('error', '此条信息已经被驳回！');
            return;
        }

        if(ckItems[0].checkstatus == 2){
            base.openNotification('error', '此条信息已经通过审核，无法驳回！');
            return;
        }

        this.setState({ rejectModal: true });
    };

    doReject = () => {
        let data = this.state.ckItems[0], shopId = this.shopId;

        this.props.form.validateFields(['rejectReason'], (err, values) => {
            if (!err) {
                this.setState({ loading: true });
                request(`${domain}pcsd-hs-promotion-admin/api/promotion/audit.jhtm`, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'},
                    body: `authdata=${JSON.stringify(body)}&shopId=${shopId}&ids=${data.id}&status=0&rejectReason=${values.rejectReason}`
                }).then((res) => {
                    this.setState({ loading: false });

                    if(res.data.t && res.data.t.rc == '0'){
                        this.setState({ rejectModal: false });
                        base.openNotification('success', '驳回成功!');
                        this.search();
                    }else{
                        base.openNotification('error', res.data.t.msg);
                    }
                });
            }
        });
    };

    cancelReject = () => {
        this.setState({ rejectModal: false });
    };

    detail = () => {
        let ckitems = this.state.ckItems;

        if(ckitems.length != 1){
            base.openNotification('error', '请选中一条数据进行查看！');
            return;
        }

        location.hash=`/sales/detail/${ckitems[0].shopId}/${ckitems[0].salesgoodspromotionroleid}`;
    };

    transformStatus = (text) => {
        let status = '';

        switch (text){
            case 0:
                status = '新建';
                break;
            case 1:
                status = '待审核';
                break;
            case 2:
                status = '审核通过';
                break;
            case 3:
                status = '审核驳回';
                break;
        }

        return status;
    };

    transformShop = (text) => {
        let shop = '';

        switch (text){
            case 20:
                shop = '新零售'; break;
        }

        return shop;
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
            { title: '促销名称', dataIndex: 'promotionName' },
            { title: '审核人ID', dataIndex: 'checkpersonid' },
            { title: '商城', dataIndex: 'shopId', render: this.transformShop },
            { title: '创建时间', dataIndex: 'createtime' },
            { title: '提交审核时间', dataIndex: 'checkposttime' },
            { title: '审核状态', dataIndex: 'checkstatus', render: this.transformStatus },
            { title: '驳回原因', dataIndex: 'rejectreason' },
        ];

        const detailCol = [
            { title: '促销名称', dataIndex: 'promotionName' },
            { title: '审核人ID', dataIndex: 'checkpersonid' },
            { title: '审核时间', dataIndex: 'checkposttime' },
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
                    <Row gutter={40}>
                        {/*<Col span={6}>
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
                        <Col span={9}>
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
                        <Col span={9}>
                            <FormItem {...formItemLayout} label="审核状态">
                                { getFieldDecorator('checkStatus', {initialValue: ''})(
                                    <Select placeholder="请选择审核状态">
                                        <Option value="">全部</Option>
                                        <Option value="1">待审核</Option>
                                        <Option value="2">审核通过</Option>
                                        <Option value="3">审核驳回</Option>
                                    </Select>
                                ) }
                            </FormItem>
                        </Col>
                        <Col span={6}>
                            <Button type="primary" htmlType="submit">查询</Button>
                            <Button style={{marginLeft: 8}} onClick={this.handleReset}>重置</Button>
                        </Col>
                    </Row>
                </Form>

                <div className={styles.operations}>
                    <Button type="primary" onClick={this.approve} style={{ marginLeft: 8 }}>通过</Button>
                    <Button type="primary" onClick={this.reject} style={{ marginLeft: 8 }}>拒绝</Button>
                    <Button type="primary" onClick={this.detail} style={{ marginLeft: 8 }}>详情</Button>
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

                <Modal
                    title="审核驳回"
                    visible={this.state.rejectModal}
                    onOk={this.doReject}
                    onCancel={this.cancelReject}
                >
                    <Form>
                        <FormItem {...formItemLayout} label="驳回原因">
                            {getFieldDecorator('rejectReason',{
                                initialValue: '',
                                rules: [{required: true, message: '请输入驳回原因!'}]
                            })(<Input />)}
                        </FormItem>

                        <Table
                            columns={detailCol}
                            dataSource={this.state.ckItems}
                            rowKey={record => record.id}
                            pagination={false}
                        />
                    </Form>
                </Modal>
            </div>
        );
    }
}

export default Form.create()(SalesCheckList);
