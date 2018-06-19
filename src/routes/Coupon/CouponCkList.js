/**
 * Created by chaoqin on 17/9/14.
 */

import React from 'react';
import { Table, Select, Button, Form, Input, Checkbox, Row, Col, DatePicker, Alert, Modal } from 'antd';
import { couponapi } from '../../models/config';
import base from '../../models/base';
import styles from './coupon.css';
import request from '../../utils/request';
let appkey, clientID, clientSecret, upload, token;
if (/(?:uat|dev)\./.test(document.domain)) {
    appkey = 'C73E23AC2B400001C57218701746A360';
    clientID = 'C73E23AC2B5000016E801A581E77112A';
    clientSecret = 'C73E23AC2B40000169301A56C2F0EE10';
    token = 'http://10.122.12.243:8080';
} else {
    appkey = 'C73E23AC2760000134621118E3EC3BB0';
    clientID = 'C73E23AC27800001C250CBDB79651D19';
    clientSecret = 'C73E23AC27700001E4BACAB1988A1CB9';
    token = 'https://wngfp.unifiedcloud.lenovo.com';
}

const pageSize = 10;
const FormItem = Form.Item;
const { RangePicker } = DatePicker;
const Option = Select.Option;
const { TextArea } = Input;
const confirm = Modal.confirm;
const CheckboxGroup = Checkbox.Group;
const formItemLayout = {
    labelCol: { span: 7 },
    wrapperCol: { span: 17 },
};

class formWrapper extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            data: [],
            ckItems: [],
            tableCol: [{ key: "id", name: "id" }, { key: "shopid", name: "商城" }, { key: "showsalescouponid", name: "优惠券id" }, { key: "name", name: "优惠券名称" }, { key: "checkstatus", name: "审核状态" }, { key: "checkpersonid", name: "审核人id" }, { key: "sourceway", name: "数据来源" }, { key: "rejectreason", name: "审核原因" }, { key: "checkposttime", name: "审核时间" }, { key: "createtime", name: "创建时间" }, { key: "updatetime", name: "更新时间" }],
            check: [],
            mdata: [],
            refuseVisibility: false,
            downshow: false,
            total: 0,
            current: 1,
            selected:[],
            shopId:'',
            shopName:''
        }
    }
    componentDidMount() {
        const log = window.loginInfo; //获取localstory的信息
        this.setState({
            shopId:log.rCode
        })
        this.tranShopName(log.rCode)
        this.search(this.state.current);
        let arr = [];
        for (var { key: k, name: n } of this.state.tableCol) {
            arr.push(k + '=' + n);
        }
        this.setState({ check: arr })
        this.props.form.setFields({ 'outx': { value: arr } });
    };
    tranShopName(id){
        if(id==28){
            this.setState({shopName:'Think'})
        }else if(id==20){
            this.setState({shopName:'无人店'})
        }else if(id==58){
            this.setState({shopName:'阳光'})
        }else if(id==68){
            this.setState({shopName:'百应'})
        }else if(id==78){
            this.setState({shopName:'Moto'})
        }else if(id==88){
            this.setState({shopName:'扬天'})
        }else if(id==25){
            this.setState({shopName:'消费'})
        }else if(id==35){
            this.setState({shopName:'千禧'})
        }
    }
    render() {
        const columns = [
            { title: '优惠券ID', width: 100, dataIndex: 'showsalescouponid', key: 'showsalescouponid' },
            { title: '优惠券名称', dataIndex: 'name', key: 'name' },
            // { title: '金额', dataIndex: 'jine', key: 'jine' },
            // { title: '优惠券类型', dataIndex: 'couponType', key: 'couponType', render: this.transformCtype },
            { title: '审核状态', dataIndex: 'checkstatus', key: 'checkstatus', render: this.transformCkStatus },
            { title: '审核来源', dataIndex: 'sourceway', key: 'sourceway', render: (text) => { return text == 0 ? "新建审核" : "编辑审核" } },
            { title: '创建人', dataIndex: 'createby', key: 'createBy' },
            // { title: '审批人', dataIndex: 'checkby', key: 'checkby' },
            // { title: '开始日期', dataIndex: 'createtime', key: 'startTime' },
            // { title: '结束日期', dataIndex: 'endTime', key: 'endTime' },
            { title: '操作', key: 'operation', width: 200, render: this.operations }
        ];

        const pagination = {
            total: this.state.total,
            current: this.state.current,
            pageSize: pageSize,
            showQuickJumper: true,
            onChange: (page, pageSize) => {
                this.setState({ current: page });
                this.search(page);
            }
        };

        const refuseColumns = [
            { title: "优惠券ID", dataIndex: "salescouponid", key: "salescouponid" },
            { title: "优惠券名称", dataIndex: "name", key: "name" },
            { title: "审核人", dataIndex: "checkpersonid", key: "checkpersonid" },
            { title: "审核时间", dataIndex: "checkposttime", key: "checkposttime" },
        ];

        const rowSelection = {
            selectedRowKeys: this.state.selected,
            onChange: (selectedRowKeys, selectedRows) => {
                this.setState({ ckItems: selectedRows , selected: selectedRowKeys});
            }
        };
        const { getFieldDecorator } = this.props.form;
        const showlist = this.state.tableCol.map((d, index) => {
            const id = d.key, name = d.name;
            return <Checkbox key={id} value={id + '=' + name} className='ml10'>{name}</Checkbox>
        })
        return (
            <div>
                <Form className={styles.form} >
                    <Row gutter={16}>
                        <Col span={8}>
                            <FormItem {...formItemLayout} label="优惠券ID">
                                {getFieldDecorator('salescouponid', { initialValue: '' })(<Input placeholder="请输入优惠券ID" />)}
                            </FormItem>
                        </Col>
                        <Col span={8}>
                            <FormItem {...formItemLayout} label="优惠券名称">
                                {getFieldDecorator('name', { initialValue: '' })(<Input placeholder="请输入优惠券名称" />)}
                            </FormItem>
                        </Col>
                        <Col span={8}>
                            <FormItem {...formItemLayout} label="审核状态">
                                {getFieldDecorator('checkstatus', { initialValue: '' })(
                                    <Select placeholder="请选择状态">
                                        <Option value="">全部</Option>
                                        <Option value="1">审核未通过</Option>
                                        <Option value="2">审核通过</Option>
                                        <Option value="3">待审核</Option>
                                    </Select>
                                )}
                            </FormItem>
                        </Col>
                        <Col span={8}>
                            <FormItem {...formItemLayout} label="创建开始时间">
                                {getFieldDecorator('createtime_start', { initialValue: '' })(<DatePicker format="YYYY-MM-DD" />)}
                            </FormItem>
                        </Col>
                        <Col span={8}>
                            <FormItem {...formItemLayout} label="创建结束时间">
                                {getFieldDecorator('createtime_end', { initialValue: '' })(<DatePicker format="YYYY-MM-DD" />)}
                            </FormItem>
                        </Col>
                        <Col span={8}>
                            <FormItem {...formItemLayout} label="优惠券类型">
                                {getFieldDecorator('style', { initialValue: '' })(
                                    <Select placeholder="请选择类型">
                                        <Option value="">全部</Option>
                                        <Option value="1">优惠券</Option>
                                        <Option value="2">优惠码</Option>
                                    </Select>
                                )}
                            </FormItem>
                        </Col>
                        <Col span={8}>
                        <FormItem {...formItemLayout} label="商城">
                                    {getFieldDecorator('shopId', { initialValue: this.state.shopId })(
                                        <span>{this.state.shopName}</span>
                                    )}
                                </FormItem>
                        </Col>
                    </Row>
                    <Row gutter={16} style={{ textAlign: 'right' }}>
                        <Col>
                            <Button type="primary" onClick={() => this.search(1)}>查询</Button>
                            <Button style={{ marginLeft: 8 }} onClick={this.handleReset}>重置</Button>
                        </Col>
                    </Row>
                </Form>
                <div className={styles.operations}>
                    <Button type="primary" onClick={this.checkHandler.bind(this)}>批量通过</Button>
                    <Button style={{ marginLeft: "10px" }} onClick={this.out.bind(this)}>导出</Button>
                </div>

                <Alert message={(<p>已选择 <span className={styles.blue}>{this.state.ckItems.length}</span> 项 | 请点击批量按钮进行批量操作</p>)} type="info" showIcon className={styles.tips} />

                <Table rowkey="id" rowSelection={rowSelection} columns={columns} dataSource={this.state.data} pagination={pagination} />

                <Modal
                    title="审核驳回"
                    visible={this.state.refuseVisibility}
                    onOk={this.refuseHandleOk.bind(this)}
                    onCancel={this.refuseHandleCancel}
                >
                    <Row gutter={16}>
                        <FormItem {...{ labelCol: { span: 4 }, wrapperCol: { span: 20 } }} label="驳回原因">
                            {getFieldDecorator('rejectreason', { initialValue: '' })(<TextArea placeholder="请输入驳回原因" />)}
                        </FormItem>
                    </Row>

                    <Table size="middle" columns={refuseColumns} dataSource={this.state.mdata} rowKey="id" pagination={false} style={{ marginTop: "10px" }} />
                </Modal>
                <Modal
                    title="导出列项"
                    visible={this.state.downshow}
                    okText="确认导出"
                    onOk={this.outOk.bind(this)}
                    onCancel={this.outCancel.bind(this)}
                >
                    <FormItem {...{ labelCol: { span: 2 }, wrapperCol: { span: 22 } }} label="">
                        {getFieldDecorator('outx')(
                            <CheckboxGroup>
                                {showlist}
                            </CheckboxGroup>)}
                    </FormItem>
                </Modal>
            </div>
        );
    }

    search(page) {
        this.props.form.validateFields((err, values) => {
            request(`${couponapi}SalesCouponOpenApi/queryCouponChecksInfoPage.jhtm?page=${page}&rows=${pageSize}&salescouponid=${values.salescouponid || ''}&style=${values.style}&name=${values.name.trim() || ''}&shopid=${values.shopId}&checkstatus=${values.checkstatus}&createtime_start=${values.createtime_start ? values.createtime_start.format('YYYY-MM-DD H:mm:ss') : ""}&createtime_end=${values.createtime_end ? values.createtime_end.format('YYYY-MM-DD H:mm:ss') : ""}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            }).then((res) => {
                if (res.data.code == 200) {
                    this.setState({ data: res.data.data.datas || [], total: res.data.data.totalCount,selected: []});
                } else {
                    base.openNotification('error', res.data.msg)
                }
            });
        });
    };

    handleReset = () => {
        this.props.form.resetFields();
        this.props.form.setFields({ 'outx': { value: this.state.check } });
        this.setState({ searchData: {} }, function () {
            this.search(this.state.current);
        });
    };

    transformCtype = (text) => {
        if (text == '1') {
            return "代金劵1";
        } else if (text == '2') {
            return "代金劵2";
        }
    };

    transformCkStatus = (text) => {
        if (text == "1") {
            return (<p><span className='circle red'></span>未通过</p>);
        } else if (text == "2") {
            return (<p><span className='circle green'></span>已通过</p>);
        } else if (text == "3") {
            return (<p><span className='circle blue'></span>待审核</p>);
        } else if (text == "0") {
            return (<p><span className='circle grey'></span>未提交</p>);
        }
    };

    operations = (text, record) => {
        if (record.checkstatus == '1') {   //未通过
            return (
                <div><a onClick={() => this.detail(record.showsalescouponid, record.sourceway)}>查看</a></div>
            );
        } else if (record.checkstatus == '2') {   //已通过
            return (
                <div><a onClick={() => this.detail(record.showsalescouponid, record.sourceway)}>查看</a></div>
            );
        } else if (record.checkstatus == '3') {   //待审核
            return (
                <div>
                    <a onClick={() => this.detail(record.showsalescouponid, record.sourceway)}>查看</a>
                    <span className='line'></span>
                    <a onClick={() => this.agreeHandler(record)}>通过</a>
                    <span className='line'></span>
                    <a onClick={() => this.refuse(record)}>拒绝</a>
                </div>
            );
        }
    };

    detail(id, type) {
        location.hash = `/coupon/detail/${id}/${type}`;
    };
    agreeHandler(record) {
        confirm({
            title: '确定要审批通过所选的优惠券吗?',
            onOk: () => {
                return new Promise((resolve, reject) => {
                    this.pass(2, [record],()=>{
                        setTimeout(()=>{
                            resolve();
                        })
                    });
                  })
                
                // request(`${couponapi}SalesCouponOpenApi/toCheckSalescoupon.jhtm?checkstatus=2&checksData=${JSON.stringify([record])}`, {
                //     method: 'POST',
                //     headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' },
                // }).then((res) => {
                //     console.log(res)
                // });
            }
        });
    };
    checkHandler() {
        let _ckItems = this.state.ckItems;

        if (_ckItems.length > 0) {
            confirm({
                title: '确定要审批通过所选的优惠券吗?',
                onOk: () => {
                    let cs = this.state.ckItems.map(c => { return c.checkstatus; });
                    if (cs.indexOf(1) > -1 || cs.indexOf(2) > -1) {
                        base.openNotification('error', '已审核优惠券不可再次审核');
                    } else {
                        return new Promise((resolve, reject) => {
                        this.pass(2, this.state.ckItems,()=>{
                            setTimeout(()=>{
                                resolve();
                            })
                        });
                    })
                    }    
                }
            });
        } else {
            base.openNotification('error', '您并未选中任何项！');
        }
    };

    refuse(record) {
        this.setState({ refuseVisibility: true, mdata: [record] });
    };

    refuseHandleCancel = () => {
        this.setState({ refuseVisibility: false });
    };

    refuseHandleOk = () => {
        let data = this.state.mdata[0];
        data["rejectreason"] = this.props.form.getFieldValue('rejectreason');
        this.pass(1, [data]);
    };
    pass(type, data,callback) {
        let pass = `checkstatus=${type}&checksData=${JSON.stringify(data)}`;
        request(`${couponapi}SalesCouponOpenApi/toCheckSalescoupon.jhtm`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' },
            body: pass
        }).then((res) => {
            if(callback){
                callback();
            }
            if (res.data.code == 200) {
                this.search(this.state.current);
                this.setState({ refuseVisibility: false });
                base.openNotification('success', res.data.msg);
            } else {
                base.openNotification('error', res.data.msg);
            }
        });
    }

    initMadp(cb) {
        request(token + '/v1/tenants/lenovo/apps/' + appkey + '/service/auth/serverside/token', {
            method: 'GET',
            headers: {
                clientID: clientID,
                clientSecret: clientSecret
            }
        }).then(res => {
            const date = new Date();
            const token = res.data.accessToken;
            document.cookie = 'accessToken=' + token + ';path=/;domain=.lenovo.cn;max-age=' + res.data.expired;
            document.cookie = 'appkey=' + appkey + ';path=/;domain=.lenovo.cn;max-age=' + res.data.expired;

            if (cb && typeof cb == 'function') cb.call(this)
        })
    };
    out() {
        this.setState({ downshow: true })
    }
    outOk() {
        if (!/accessToken=/i.test(document.cookie)) {
            base.openNotification('error', '验证信息出错，请稍后重试!');
            this.initMadp();
            return false;
        }
        this.props.form.validateFields((err, values) => {
            if (values.outx.length > 0) {
                request(`${couponapi}salesCouponOpenApi/excel/exportExcelCouponcheck.jhtm?salescouponid=${values.salescouponid || ''}&style=${values.style}&name=${values.name.trim() || ''}&checkstatus=${values.checkstatus}&createtime_start=${values.createtime_start ? values.createtime_start.format('YYYY-MM-DD H:mm:ss') : ""}&createtime_end=${values.createtime_end ? values.createtime_end.format('YYYY-MM-DD H:mm:ss') : ""}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' },
                    body: `exporttitle=${values.outx.toString()}`
                }).then((res) => {
                    if (res.data.code == 200) {
                        window.open(res.data.data);
                        this.setState({ downshow: false })
                    } else {
                        base.openNotification('error', res.data.msg);
                    }
                });
            } else {
                base.openNotification('error', "导出列项不能为空");
            }
        })
    }
    outCancel() {
        this.setState({ downshow: false })
    }

}

const CouponCkList = Form.create()(formWrapper);
export default CouponCkList;
