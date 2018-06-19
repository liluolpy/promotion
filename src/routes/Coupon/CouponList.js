/**
 * Created by chaoqin on 17/9/14.
 */

import React from 'react';
import { Table, Select, Button, Menu, Dropdown, Icon, Form, Input, InputNumber,Row, Col, DatePicker, Alert, Modal, Checkbox, notification, Popover,Radio } from 'antd';
import { couponapi } from '../../models/config';
import { couponIp } from '../../models/config';
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
const Option = Select.Option;
const CheckboxGroup = Checkbox.Group;
const RadioGroup = Radio.Group;
const confirm = Modal.confirm;
const formItemLayout = {
    labelCol: { span: 7 },
    wrapperCol: { span: 17 },
};
const { RangePicker } = DatePicker;

class CouponList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [],
            tableCol: [{ key: "id", name: "id" }, { key: "shopid", name: "商城" }, { key: "couponcode", name: "券编码" }, { key: "name", name: "券名称" }, { key: "usescope", name: "优惠券类型" }, { key: "terminal", name: "平台" }, { key: "status", name: "状态" }, { key: "type", name: "券类型" }, { key: "amount", name: "金额" }, { key: "minorderamount", name: "门槛金额金额" }, { key: "description", name: "规则描述" }, { key: "couponway", name: "获取方式" }, { key: "iscanget", name: "是否可领取" }, { key: "getstarttime", name: "领取开始时间" }, { key: "getendtime", name: "领取结束时间" }, { key: "gettype", name: "有效期类型" }, { key: "intervaldate", name: "有效天数" }, { key: "backsend", name: "是否发放过" }, { key: "fromtime", name: "有效期开始时间" }, { key: "totime", name: "有效期结束时间" }, { key: "sendnumber", name: "已领取张数" }, { key: "usednumber", name: "已使用张数" }, { key: "maxnumber", name: "当前库存" }, { key: "wholenumber", name: "发全员券次数" }, { key: "createtime", name: "创建时间" }, { key: "updatetime", name: "更新时间" }, { key: "createby", name: "操作人" }, { key: "goodcodes", name: "商品code" }, { key: "materialcodes", name: "物料号" }, { key: "storeids", name: "门店id" }, { key: "storenames", name: "门店名称" }],
            check: [],
            downshow: false,
            loading: false,
            searchData: {},
            ckItems: [],
            shops: [],
            useScope: [],
            terminal: [],
            faquanVisibility: false,
            total: 0,
            current: 1,
            selected:[],
            maymaxnum:'',
            shopId:''
        }
    }

    componentDidMount() {
        const log = window.loginInfo; //获取localstory的信息
        this.setState({
            jobType:log.jobType,
            shopId:log.rCode
        })
        this.tranShopName(log.rCode)
        // request(`${couponapi}pagePropertiesOpenApi/getShopIds.jhtm`, {
        //     method: 'GET',
        // }).then((res) => {
        //     if (res.data.code == 200) {
        //         this.setState({ shops: res.data.data || [] });
        //     } else {
        //         base.openNotification('error', res.data.msg)
        //     }
        // });
        this.getConfiguration(log.rCode);
        this.search(1);
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
    search(page) {
        this.props.form.validateFields((err, option) => {
            let createStartTime = option.createTime && option.createTime[0] ? option.createTime[0].format('YYYY-MM-DD') : '';
            let createEndTime = option.createTime && option.createTime[1] ? option.createTime[1].format('YYYY-MM-DD') : '';
            let effectStartTime = option.effectTime && option.effectTime[0] ? option.effectTime[0].format('YYYY-MM-DD') : '';
            let effectEndTime = option.effectTime && option.effectTime[1] ? option.effectTime[1].format('YYYY-MM-DD') : '';
            let getStartTime = option.receiveTime && option.receiveTime[0] ? option.receiveTime[0].format('YYYY-MM-DD') : '';
            let getEndTime = option.receiveTime && option.receiveTime[1] ? option.receiveTime[1].format('YYYY-MM-DD') : '';

            this.setState({ loading: true });
            request(`${couponapi}salesCouponOpenApi/querySalescouponsInfoPage.jhtm?page=${page}&rows=${pageSize}&createtime_end=${createEndTime || ''}&createtime_start=${createStartTime || ''}&fromtime=${effectStartTime || ''}&totime=${effectEndTime || ''}&getendtime=${getEndTime || ''}&getstarttime=${getStartTime || ''}&iscanget=${option.iscanget == undefined ? '' : option.iscanget}&name=${option.couponName.trim() || ''}&id=${option.id.trim() || ''}&shopid=${option.shopId || ''}&status=${option.status == undefined ? '' : option.status}&terminal=${option.terminalId || ''}&usescope=${option.couponType || ''}&statusSign=${option.statusSign == undefined ? '' : option.statusSign}`,
                {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                }).then((res) => {
                    this.setState({ loading: false,selected:[] });

                    // if (res.data.code == 1000) {
                    this.setState({ data: res.data.rows, total: res.data.total });
                    // } else {
                    //     base.openNotification('error', '查询失败，请稍后重试!');
                    // }
                });
        })
    };

    handleSearch = (e) => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                this.setState({ searchData: values ,current:1}, function () {
                    this.search(1);
                });
            }
        });
    };

    handleReset = () => {
        this.props.form.resetFields();
        this.props.form.setFields({ 'outx': { value: this.state.check } });
        this.setState({ searchData: {} ,current:1}, function () {
            this.search(1);
        });
    };

    batchCheckHandler = () => {
        let _ckItems = this.state.ckItems;

        if (_ckItems.length == 0) {
            alert("您并未选中任何项！");
        }

        this.doCheck(_ckItems);
    };

    batchDelHandler = () => {
        let _ckItems = this.state.ckItems;

        if (_ckItems.length == 0) {
            alert("您并未选中任何项！");
        }

        this.doDel(_ckItems);
    };

    checkHandler = (record) => {
        let o = [];

        o.push(record);

        this.doCheck(o);
    };

    doCheck = (items) => {
        let ids = [];

        for (let i = 0; i < items.length; i++) {
            ids.push(items[i].id + '%7C' + items[i].name + '%7C' + items[i].shopid);
        }

        ids = ids.join(',');

        this.setState({ loading: true });
        request(`/couponapi/couponOpenApi/salescoupon/submitToCheck.jhtm?ids=${ids}&style=1&userid=1`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'MSP-AuthKey': 'EKum6zvLoCRXUOTbzqlbP7Gg.1472543098' },
            }).then((res) => {
                this.setState({ loading: false });
                if (res.data.code == 1000) {
                    base.openNotification('success', '审核成功!');
                    this.search(this.state.current);
                } else {
                    base.openNotification('error', '审核失败，请稍后重试!');
                }
            }, () => {
                this.setState({ loading: false });
                base.openNotification('error', '审核失败，请稍后重试!');
            });
    };

    doDel = (items) => {

    };
    onChangeRa=(e)=>{
        console.log('e.target.value',e.target.value)
        if(e.target.value==0){
            let n=100000000-this.props.form.getFieldValue('maxnumber');
            this.setState({maymaxnum:n})
        }else{
            let n=this.props.form.getFieldValue('maxnumber')
            this.setState({maymaxnum:n})
        }
    }
    checkupdatemaxnumber=(rule, value, callback)=>{
        const regInt =/^[1-9]\d*|0$/
        if(regInt.test(value)){
            if(this.props.form.getFieldValue('stockIncOrDec') == 0){
                if(this.props.form.getFieldValue('updatemaxnumber')>this.state.maymaxnum){
                    this.props.form.setFields({'updatemaxnumber':{value:this.state.maymaxnum}})  
                }
                callback()
            }
            if(this.props.form.getFieldValue('stockIncOrDec')==1){
                console.log(this.state.maymaxnum);
                if(this.props.form.getFieldValue('updatemaxnumber')>this.state.maymaxnum){
                    this.props.form.setFields({'updatemaxnumber':{value:this.state.maymaxnum}})
                }
                callback()
            }
        }else{
            callback('请输入合法的正整数')
        }
    }
    transformShopId = text => {
        if (text == "20") {
          return "无人店";
        }else if (text == "28") {
          return "Think"
        } else if (text == "58"){
          return "阳光"
        } else if (text =="68"){
          return "百应"
        } else if (text =="78"){
          return "MoTo"
        } else if (text =="88"){
          return "扬天"
        } else if (text == "25"){
          return "消费"
        }else if(text =="35"){
          return "千禧"
        }
      };

    transformTerminal = (text) => {
        let _text = (text + "").split(",");
        let _html = [];

        for (let i = 0; i < _text.length; i++) {
            if (_text[i] == 1) {
                _html.push("PC");
            } else if (_text[i] == 2) {
                _html.push("WAP");
            } else if (_text[i] == 3) {
                _html.push("APP");
            } else if (_text[i] == 4) {
                _html.push("微信");
            }
        }

        return _html.join(",");
    };

    transformCtype = (text, record) => {
        let str = '';
        switch (text) {
            case 1:
                str = "服务券";
                break;
            case 2:
                str = "代金劵";
                break;
            case 3:
                str = "满减劵";
                break;
            case 4:
                str = "折扣劵";
                break;
        }
        return str;
    };
    transformCkStatus = (text) => {
        if (text == "0") {
            return (<p><span className='circle grey'></span>未提交</p>);
        } else if (text == "1") {
            return (<p><span className='circle red'></span>审核未通过</p>);
        } else if (text == "2") {
            return (<p><span className='circle green'></span>审核通过</p>);
        } else if (text == "3") {
            return (<p><span className='circle blue'></span>待审核</p>);
        } else if (text == "4") {
            return (<p><span className='circle blue'></span>一级审核通过</p>);
        }
    };

    faquan = (record) => {
        this.setState({ faquanVisibility: true });
        console.log(record);
    };

    // faquanPosonnal = (checkedValues) => {
    //     console.log('checked = ', checkedValues);
    // };

    // fqHandleOk = () => {
    //     this.setState({ faquanVisibility: false });
    // };

    // fqHandleCancel = () => {
    //     this.setState({ faquanVisibility: false });
    // };

    operations = (text, record) => {
        if (record.status == '0') { //新建
            return (
                <div>
                    <a onClick={() => this.detail(record.id)}>查看</a>
                    <span className='line'></span>
                    <a onClick={() => this.save(record.id)}>编辑</a>
                    <span className='line'></span>
                    <a onClick={() => this.check([record])}>提交审核</a>
                </div>
            );
        } else if (record.status == '1') {   //审核未通过
            return (
                    <div>
                        <a onClick={() => this.detail(record.id)}>查看</a>
                        <span className='line'></span>
                        <a onClick={() => this.save(record.id)}>编辑</a>
                    </div>
                    );
        } else if (record.status == '2') {   //审核通过
            if (this.compareDate(record.totime, new Date()) && this.state.jobType=="8") {
                return (
                    <div>
                        <a onClick={() => this.detail(record.id)}>查看</a>
                        <span className='line'></span>
                        <a onClick={() => this.save(record.id)}>编辑</a>
                        <span className='line'></span>
                        <a onClick={() => this.sendq('more', record)}>会员发券</a>
                        <span className='line'></span>
                        <a onClick={() => this.sendq('all', record)}>发全员券</a>
                    </div>
                );
            } else {
                return (
                    <div>
                        <a onClick={() => this.detail(record.id)}>查看</a>
                        <span className='line'></span>
                        <a onClick={() => this.save(record.id)}>编辑</a>
                    </div>
                );
            }
        } else if (record.status == '3') {   //待审核
            return (<div><a onClick={() => this.detail(record.id)}>查看</a></div>);
        } else if (record.status == '4') {   //一级审核通过
            return (<div></div>);
        }
    };

    save(id) {
        location.hash = `/coupon/edit/${id}`;
    };
    detail(id) {
        location.hash = `/coupon/detail/${id}/0`;
    };
    sendq(type, data) {
        location.hash = `/coupon/send${type}/${data.id}`;
    }
    add = (data) => {
        location.hash = `/coupon/save`;
    };
    compareDate(d1, d2) {
        return ((new Date(d1.replace(/-/g, "\/"))) > d2);
    }

    render() {
        const { getFieldDecorator } = this.props.form;

        const columns = [
            { title: '优惠券ID', width: 100, dataIndex: 'id', key: 'id', fixed: 'left' },
            { title: '优惠券名称', width: 100, dataIndex: 'name', key: 'name', fixed: 'left' },
            { title: '金额', dataIndex: 'amount', key: 'amount' },
            { title: '商城', dataIndex: 'shopid', key: 'shopid', render: this.transformShopId },
            { title: '平台', dataIndex: 'terminal', key: 'terminal', render: this.transformTerminal },
            { title: '优惠券类型', dataIndex: 'usescope', key: 'usescope', render: this.transformCtype },
            { title: '是否可领取', dataIndex: 'iscanget', key: 'iscanget', render: (text) => { return text == 1 ? "是" : "否" } },
            { title: '发全员券次数', dataIndex: 'wholenumber', key: 'wholenumber' },
            { title: '已领数量', dataIndex: 'sendnumber', key: 'sendnumber', render: (text) => { return text != "" ? text : "--" } },
            { title: '库存数量', dataIndex: 'maxnumber', key: 'maxnumber' },
            { title: '状态', dataIndex: 'status', key: 'status', render: this.transformCkStatus },
            { title: '创建人', dataIndex: 'createby', key: 'createby' },
            { title: '领取开始时间', dataIndex: 'getstarttime', key: 'getstarttime' },
            { title: '领取结束时间', dataIndex: 'getendtime', key: 'getendtime' },
            { title: '有效开始时间', dataIndex: 'fromtime', key: 'ableStartTime' },
            { title: '有效结束时间', dataIndex: 'totime', key: 'totime' },
            { title: '创建时间', dataIndex: 'createtime', key: 'createtime' },
            { title: '操作', key: 'operation', fixed: 'right', width: 200, render: this.operations }
        ];

        const rowSelection = {
            selectedRowKeys: this.state.selected,
            onChange: (selectedRowKeys, selectedRows) => {
                this.setState({ ckItems: selectedRows,selected: selectedRowKeys });
            }
        };

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

        const menu = (
            <Menu>
                <Menu.Item key="0">
                    <span onClick={() => this.check(this.state.ckItems)}>批量提交审核</span>
                </Menu.Item>
                <Menu.Item key="1">
                    <a href="http://www.taobao.com/">批量删除</a>
                </Menu.Item>
            </Menu>
        );

        const spselect = this.state.shops.map((d, index) => {
            console.log('id',d.shopid)
            console.log('d.name',d.name)
            const id = d.shopid + '', name = d.name;
            return <Option key={id} value={id}>{name}</Option>
        });
        const usselect = base.tlist(this.state.useScope);
        const tmselect = this.state.terminal.map((d, index) => {
            const id = d.value + '', name = d.label;
            return <Option key={id} value={id}>{name}</Option>
        })
        const showlist = this.state.tableCol.map((d, index) => {
            const id = d.key, name = d.name;
            return <Checkbox key={id} value={id + '=' + name} className='ml10'>{name}</Checkbox>
        })
        const content = (
            <div style={{ color: "#989898" }}>
                <p>当前可用：审核通过 + 可领取 + 有效期内</p>
                <p>当前可领：审核通过 + 可领取 + 可领取时间内</p>
                <p>已过期券：可用时间段已过</p>
                <p>库存不足：库存&lt;50张</p>
            </div>
        );
        return (
            <div>
                <Form
                    className={styles.form}
                    onSubmit={this.handleSearch}
                >
                    <Row gutter={16}>
                        <Col span={this.state.expand ? 8 : 7}>
                            <FormItem {...formItemLayout} label="优惠券名称">
                                {getFieldDecorator('couponName', { initialValue: '' })(<Input placeholder="请输入优惠券名称" />)}
                            </FormItem>
                        </Col>
                        <Col span={7} className={this.state.expand ? 'none' : ''}>
                            <FormItem {...{ labelCol: { span: 5 }, wrapperCol: { span: 17 } }} label="商城">
                                {getFieldDecorator('shopId', { initialValue: this.state.shopId })(
                                    <span>{this.state.shopName}</span>
                                )}
                            </FormItem>
                        </Col>
                        <div className={this.state.expand ? '' : 'none'}>
                            <Col span={8}>
                                <FormItem {...formItemLayout} label="优惠券ID">
                                    {getFieldDecorator('id', { initialValue: '' })(<Input placeholder="请输入优惠券ID" />)}
                                </FormItem>
                            </Col>
                            <Col span={8}>
                                <FormItem {...formItemLayout} label="优惠券类型">
                                    {getFieldDecorator('couponType', { initialValue: '' })(
                                        <Select placeholder="请选择类型">
                                            <Option value="">全部</Option>
                                            {usselect}
                                        </Select>
                                    )}
                                </FormItem>
                            </Col>
                        </div>
                        <Col span={this.state.expand ? 8 : 6} className={this.state.expand ? 'none' : ''}>
                            <FormItem {...{ labelCol: { span: 4 }, wrapperCol: { span: 15 } }} label="状态">
                                {getFieldDecorator('statusSign', { initialValue: '' })(
                                    <Select placeholder="请选择类型">
                                        <Option value="">全部</Option>
                                        <Option value="0">当前可用</Option>
                                        <Option value="1">当前可领取</Option>
                                        <Option value="2">过期</Option>
                                        <Option value="3">库存不足</Option>
                                    </Select>
                                )}
                            </FormItem>
                            <Popover content={content} title="可选条件介绍" placement="top" trigger="click">
                                <Icon type="question-circle" style={{ color: '#d3d3d3', position: 'absolute', top: '10px', left: '80%', cursor: 'pointer' }} />
                            </Popover>
                        </Col>
                        <div id="blocknone" style={{ display: 'none' }}>
                            <Col span={8}>
                                <FormItem {...formItemLayout} label="优惠券状态">
                                    {getFieldDecorator('status', { initialValue: '' })(
                                        <Select>
                                            <Option value="">全部</Option>
                                            <Option value="0">未提交</Option>
                                            <Option value="1">审核未通过</Option>
                                            <Option value="2">审核通过</Option>
                                            <Option value="3">待审核</Option>
                                        </Select>
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={8}>
                                <FormItem {...formItemLayout} label="是否可领取">
                                    {getFieldDecorator('iscanget', { initialValue: '' })(
                                        <Select>
                                            <Option value="">全部</Option>
                                            <Option value="1">是</Option>
                                            <Option value="0">否</Option>
                                        </Select>
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={8}>
                                <FormItem {...formItemLayout} label="推广平台">
                                    {getFieldDecorator('terminalId', { initialValue: '99' })(
                                        <Select>
                                            <Option value="99">全部</Option>
                                            {tmselect}
                                        </Select>
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={8}>
                                <FormItem {...formItemLayout} label="有效时间">
                                    {getFieldDecorator('effectTime')(<RangePicker format="YYYY-MM-DD" />)}
                                </FormItem>
                            </Col>
                            <Col span={8}>
                                <FormItem {...formItemLayout} label="创建时间">
                                    {getFieldDecorator('createTime')(<RangePicker format="YYYY-MM-DD" />)}
                                </FormItem>
                            </Col>
                            <Col span={8}>
                                <FormItem {...formItemLayout} label="领取时间">
                                    {getFieldDecorator('receiveTime')(<RangePicker format="YYYY-MM-DD" />)}
                                </FormItem>
                            </Col>
                            <Col span={8}>
                                <FormItem {...formItemLayout} label="商城">
                                    {getFieldDecorator('shopId', { initialValue: this.state.shopId })(
                                        <span>{this.state.shopName}</span>
                                    )}
                                </FormItem>
                            </Col>
                        </div>
                        <div id="formBtn" style={{ display: 'inline-block' }} className={this.state.expand ? 'rformbtn' : 'mt2'}>
                            <Button type="primary" htmlType="submit">查询</Button>
                            <Button onClick={this.handleReset} className={this.state.expand ? 'ml10' : 'none'}>重 置</Button>
                            <a style={{ marginLeft: 10 }} onClick={this.toggle}>
                                <span id="zksq">高级查询</span> <Icon type={this.state.expand ? 'up' : 'down'} />
                            </a>
                        </div>
                    </Row>
                </Form>

                <div className={styles.operations}>
                    <Button type="primary" onClick={this.add} style={{ marginRight: "10px" }}>新建</Button>
                    <Button type="primary" onClick={() => this.check(this.state.ckItems)}>批量提交审核</Button>

                    {/* <Dropdown overlay={menu} trigger={['click']}>
                        <Button type="primary">批量操作 <Icon type="down" /></Button>
                    </Dropdown> */}
                    <Button style={{ marginLeft: "10px" }} onClick={this.out.bind(this)}>导出</Button>
                </div>

                <Alert message={(<p>已选择 <span className={styles.blue}>{this.state.ckItems.length}</span> 项 | 请点击批量按钮进行批量操作</p>)} type="info" showIcon className={styles.tips} />

                <Table loading={this.state.loading} rowSelection={rowSelection} columns={columns} dataSource={this.state.data} rowKey="id" pagination={pagination} scroll={{ x: 1800 }} />

                {/* <Modal
                    visible={this.state.faquanVisibility}
                    onOk={this.fqHandleOk}
                    onCancel={this.fqHandleCancel}
                >
                    <CheckboxGroup onChange={this.faquanPosonnal}>
                        <Row>
                            <Col span={8} className={styles.checkbox}><Checkbox value={1}>全部</Checkbox></Col>
                            <Col span={8} className={styles.checkbox}><Checkbox value={2}>金牌会员</Checkbox></Col>
                            <Col span={8} className={styles.checkbox}><Checkbox value={3}>银牌会员</Checkbox></Col>
                            <Col span={8} className={styles.checkbox}><Checkbox value={4}>铜牌会员</Checkbox></Col>
                            <Col span={8} className={styles.checkbox}><Checkbox value={5}>IT人士</Checkbox></Col>
                            <Col span={8} className={styles.checkbox}><Checkbox value={6}>在校学生</Checkbox></Col>
                        </Row>
                    </CheckboxGroup>
                </Modal> */}
                <Modal
                    title="导出列项"
                    visible={this.state.downshow}
                    okText="确认导出"
                    onOk={this.outOk.bind(this)}
                    onCancel={this.outCancel.bind(this)}
                >
                    <FormItem {...{ labelCol: { span: 3 }, wrapperCol: { span: 21 } }} label="">
                        {getFieldDecorator('outx')(
                            <CheckboxGroup>
                                {showlist}
                            </CheckboxGroup>)}
                    </FormItem>
                </Modal>
            </div>
        )
    }
    toggle = () => {
        const { expand } = this.state;
        this.setState({ expand: !expand });
        this.props.form.resetFields();
        this.props.form.setFields({ 'outx': { value: this.state.check } });
        if (expand) {
            document.getElementById("zksq").innerText = "高级查询";
            document.getElementById("blocknone").style.display = "none";
        } else {
            document.getElementById("zksq").innerText = "快速查询";
            document.getElementById("blocknone").style.display = "block";
        }
    }
    getConfiguration(id){
        request(`${couponapi}pagePropertiesOpenApi/getConfiguration.jhtm?shopid=${id}`,{
            method:'GET',
        }).then((res)=>{
            if(res.data.code == 200){
                console.log('JSON.parseres.data.data.usescope',JSON.parse(res.data.data.usescope))
                this.setState({useScope:JSON.parse(res.data.data.usescope),terminal:JSON.parse(res.data.data.terminal)})
            }else{
                base.openNotification('error', res.data.msg)
            }
        })
    }
    shopchange() {
        this.props.form.setFields({ 'type': { value: "0" } });
        this.getConfiguration();
    }
    check(data) {
        if (data.length > 0) {
            let iscangets = data.map(c => { return c.iscanget });
            let cstatus = data.map(c => { return c.status });
            confirm({
                title:"确定要提交审核所选的优惠券吗?",
                onOk:()=>{
                        if (iscangets.indexOf(0) > -1) {
                            base.openNotification('error', '不可领取的优惠券不可提交审核');
                        } else if (cstatus.indexOf(1) > -1 || cstatus.indexOf(2) > -1 || cstatus.indexOf(3) > -1 || cstatus.indexOf(4) > -1) {
                            base.openNotification('error', '已提交审核的优惠券不可再次提交审核');
                        } else {
                            return new Promise((resolve, reject) => {  
                            request(`${couponapi}salesCouponOpenApi/salescoupon/submitToCheck.jhtm`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' },
                                body: `salescouponsApis=${JSON.stringify(data)}`
                            }).then((res) => {    
                                    setTimeout(()=>{
                                        resolve();
                                    }); 
                                    if (res.data.code == 200) {
                                        this.search(this.state.current);
                                        base.openNotification('success',res.data.msg);
                                    } else {
                                        base.openNotification('error', res.data.msg)
                                    } 
                                // setTimeout(Math.random() > 0.5 ? resolve : reject, 1000);
                            });
                        })
                    }
                }
            }) 
        } else {
            base.openNotification('error', '您并未选中任何项！');
        }
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
        this.props.form.validateFields((err, option) => {
            if (option.outx.length > 0) {
                let createStartTime = option.createTime && option.createTime[0] ? option.createTime[0].format('YYYY-MM-DD') : '';
                let createEndTime = option.createTime && option.createTime[1] ? option.createTime[1].format('YYYY-MM-DD') : '';
                let effectStartTime = option.effectTime && option.effectTime[0] ? option.effectTime[0].format('YYYY-MM-DD') : '';
                let effectEndTime = option.effectTime && option.effectTime[1] ? option.effectTime[1].format('YYYY-MM-DD') : '';
                let getStartTime = option.receiveTime && option.receiveTime[0] ? option.receiveTime[0].format('YYYY-MM-DD') : '';
                let getEndTime = option.receiveTime && option.receiveTime[1] ? option.receiveTime[1].format('YYYY-MM-DD') : '';
                request(`${couponapi}salesCouponOpenApi/excel/exportExcelSalescoupons.jhtm?createtime_end=${createEndTime}&createtime_start=${createStartTime}&fromtime=${effectStartTime}&totime=${effectEndTime}&getendtime=${getEndTime}&getstarttime=${getStartTime}&iscanget=${option.iscanget == undefined ? '' : option.iscanget}&name=${option.couponName}&id=${option.id}&shopid=${option.shopId}&status=${option.status}&terminal=${option.terminalId}&usescope=${option.couponType}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' },
                    body: `exporttitle=${this.props.form.getFieldValue('outx').toString()}`
                }).then((res) => {
                    if (res.data.code == 200) {
                        this.setState({ downshow: false })
                        window.open(res.data.data);
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

export default Form.create()(CouponList);
