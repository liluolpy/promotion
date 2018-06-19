import React from 'react';
import { Select, Button, Form, Table, Input, Tree, Modal, DatePicker, Checkbox, Radio } from 'antd';
import { couponapi } from '../../models/config';
import { domain } from '../../models/config';
import base from '../../models/base';
import moment from 'moment';
import request from '../../utils/request';

const Option = Select.Option;
const { RangePicker } = DatePicker;
const pageSize = 10;

class formWrapper extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            id: "",
            useScope: [],
            shops: [],
            couponWay: [],
            terminal: [],
            data: {
                categoryTreeList: [],
                productlist: [],
                salescouponsApi: {
                    storeids: "",
                    terminal: "",
                    usescope: "",
                    couponway: "",
                    gettype: ""
                },
                storelist: [],
                sourceway: [],
                wechatStyle: {}
            },
            storefront: [],
            otherdata: {},
            mtable: [],
            current: 1,
            total: 0,
            cktotal: 0,
            cktable: [],
            // ckcurrent: 1,
            loading:false
        };
    };

    componentDidMount() {
        const match = /sendmore\/([^/?]+)/.exec(location.hash);
        this.setState({ id: match[1] })
        if (match) {
            request(`${couponapi}pagePropertiesOpenApi/getShopIds.jhtm`, {
                method: 'GET',
            }).then((res) => {
                if (res.data.code == 200) {
                    this.setState({ shops: res.data.data || [] });
                } else {
                    base.openNotification('error', res.data.msg)
                }
            });
            request(`${couponapi}salesCouponOpenApi/toEdit.jhtm?id=${match[1]}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json;charset=utf-8' },
            }).then((res) => {
                this.setState({ data: res.data })
                this.getConfiguration(res.data.salescouponsApi.shopid);
                this.getCouponData(res.data.salescouponsApi.shopid, res.data.salescouponsApi.id);
            });
            request(`${domain}pcsd-nrwms-service/Storefront/GetAll`, {
                method: 'GET',
            }).then((res) => {
                if (res.data.code == 200) {
                    this.setState({ storefront: res.data.data || [] });
                } else {
                    base.openNotification('error', '查询门店失败，请稍后重试!')
                }
            });
        } else {
            location.hash = '/coupon/list';
        }
       // this.search(1);
    }
    //隐藏部分电话
    hidePhone=(text)=>{
        let tel = text;
        if(text){
            let reg = /^(\d{3})\d{4}(\d{4})$/;
            tel = tel.replace(reg, "$1****$2");
        }
        return tel
    }

    render() {
        const col = {
            labelCol: {
                span: 7
            },
            wrapperCol: {
                span: 17
            }
        };
        const columns = [
            { title: '会员ID', dataIndex: 'userId' },
            { title: '会员卡号', dataIndex: 'cardNumber' },
            { title: '手机号', dataIndex: 'mobile' ,render:this.hidePhone},
            { title: '会员等级', dataIndex: 'memberLevel' },
            { title: '发券状态', dataIndex: 'materialNumber' },
            { title: '操作', render: (text, record, index) => { return (<span onClick={() => this.addmenber(record)}><a>添加</a></span>) } }
        ];
        const ckcolumns = [
            { title: '会员ID', dataIndex: 'userId' },
            { title: '会员账号', dataIndex: 'loginname' },
            { title: '操作', render: (text, record, index) => { return (<span onClick={() => this.delmenber(record)}><a>移除</a></span>) } }
        ];
        const pagination = {
            total: this.state.total,
            current: this.state.current,
            pageSize: 8,
            showQuickJumper: true,
            onChange: (page, pageSize) => {
                this.setState({ current: page });
                this.search(page);
            }
        };
        const ckpagination = {
            total: this.state.cktotal,
            showQuickJumper: true,
            // current: this.state.ckcurrent,
            pageSize: 12
        };
        const { getFieldDecorator } = this.props.form;
        const spselect = this.state.shops.map((d, index) => {
            if (this.state.data.salescouponsApi.shopid == d.shopid) {
                return <span>{d.name}</span>
            }
        });
        const tmselect = this.state.data.salescouponsApi.terminal.split(",").map((d, index) => {
            for (var { label: l, value: v } of this.state.terminal) {
                if (d == v) {
                    return <span> {l} </span>
                }
            }
        });
        const usselect = this.state.useScope.map((d, index) => {
            if (this.state.data.salescouponsApi.usescope == d.id) {
                return <span>{d.text}</span>
            }
        });
        const cwselect = this.state.couponWay.map((d, index) => {
            if (this.state.data.salescouponsApi.couponway == d.id) {
                return <span>{d.text}</span>
            }
        });
        const mdselect = this.state.storefront.map((d, index) => {
            const id = d.storeID,name = d.storeName;
            return <Option key={id} value={id}>{name}</Option>
        });
        const children = [];
    for (let i = 10; i < 36; i++) {
    children.push(<Option key={i.toString(36) + i}>{i.toString(36) + i}</Option>);
    }
        return (
            <div>
                <Form className="searchForm detail cForm wd_33">
                    <Form.Item {...col} label="优惠券名称">
                        {this.state.data.salescouponsApi.name}
                    </Form.Item>
                    <Form.Item {...col} label="优惠券ID">
                        {this.state.data.salescouponsApi.id}
                    </Form.Item>
                    <Form.Item {...col} label="商城">
                        {spselect}
                    </Form.Item>
                    <Form.Item {...col} label="优惠券类型">
                        {usselect}
                    </Form.Item>
                    <Form.Item {...col} label="平台">
                        {tmselect}
                    </Form.Item>
                    <Form.Item {...col} label="有效期">
                        {this.state.data.salescouponsApi.fromtime}-
                        {this.state.data.salescouponsApi.totime}
                    </Form.Item>
                    <Form.Item {...col} label="金额">
                        {this.state.data.salescouponsApi.amount}
                    </Form.Item>
                    <Form.Item {...col} label="门槛金额">
                        {this.state.data.salescouponsApi.minorderamount}
                    </Form.Item>
                    <Form.Item {...col} label="已发全员次数">
                        {this.state.data.salescouponsApi.wholenumber ? this.state.data.salescouponsApi.wholenumber : "0"}
                    </Form.Item>
                </Form>
                <div>
                    <div className="swarp swarp_i">
                        <img src={require("../../assets/u10257.png")} />
                        <div>
                            <span>总库存</span>
                            <h2>{base.toThousands(this.state.otherdata.stockCount)}</h2>
                        </div>
                    </div>
                    <div className="swarp swarp_i">
                        <img src={require("../../assets/u11736.png")} />
                        <div>
                            <span>会员总数</span>
                            <h2>{base.toThousands(this.state.otherdata.memberNumber)}</h2>
                        </div>
                    </div>
                    <div className="swarp swarp_i">
                        <img src={require("../../assets/u10268.png")} />
                        <div>
                            <span>可推券数量</span>
                            <h2>{base.toThousands(this.state.otherdata.usefulcount)}</h2>
                        </div>
                    </div>
                    <div className="swarp swarp_i">
                        <img src={require("../../assets/u11756.png")} />
                        <div>
                            <span>已领取数量</span>
                            <h2>{base.toThousands(this.state.otherdata.bindNumber)}</h2>
                        </div>
                    </div>
                    <div className="swarp swarp_i">
                        <img src={require("../../assets/u10285.png")} />
                        <div>
                            <span>已使用数量</span>
                            <h2>{base.toThousands(this.state.otherdata.usedNumber)}</h2>
                        </div>
                    </div>
                </div>
                <div style={{ clear: 'both' }}>
                    <div style={{ width: '64%', float: "left", marginRight: "2%" }}>
                        <h2 style={{ margin: "10px 0" }}>查询会员列表</h2>
                        <Form className="searchForm cForm wd_33 pl0">
                            <Form.Item {...col} label="会员卡号">
                                {getFieldDecorator('cardNumber', {
                                    initialValue: ''
                                })(<Input style={{ width: '96%' }} placeholder="请输入会员账号" />)}
                            </Form.Item>
                            <Form.Item {...col} label="手机号">
                                {getFieldDecorator('mobile', {
                                    initialValue: ''
                                })(<Input style={{ width: '96%' }} placeholder="请输入手机号" />)}
                            </Form.Item>
                            <Button style={{ marginLeft: 50 }} type="primary" onClick={this.searchBtn.bind(this)}>查询</Button>
                        </Form>
                        <Table rowKey="userId" loading={this.state.loading} pagination={pagination} columns={columns} dataSource={this.state.mtable} />
                    </div>
                    <div style={{ width: '32%', float: "left" }}>
                        <h2 style={{ margin: "10px 0" }}>已选会员列表</h2>
                        <Table rowKey="userId" pagination={ckpagination} columns={ckcolumns} dataSource={this.state.cktable} />
                    </div>
                </div>
                <div style={{ clear: 'both',paddingTop:'20px' }}>
                    <Button type="primary" onClick={this.send.bind(this)}>发券</Button>
                    <Button style={{ marginLeft: 8 }} onClick={this.back}>取消</Button>
                </div>
            </div>
        )
    }
    getConfiguration(shopId){
        request(`${couponapi}pagePropertiesOpenApi/getConfiguration.jhtm?shopid=${shopId}`,{
            method:'GET',
        }).then((res)=>{
            if(res.data.code == 200){
                this.setState({gettype:JSON.parse(res.data.data.gettype),couponWay:JSON.parse(res.data.data.couponway),useScope:JSON.parse(res.data.data.usescope),bindtype:JSON.parse(res.data.data.bindtype),terminal:JSON.parse(res.data.data.terminal)})
            }else{
                base.openNotification('error', res.data.msg)
            }
        })
    }
    getCouponData(shopid, id) {
        request(`${couponapi}salesCouponOpenApi/getCouponData.jhtm?shopid=${shopid}&id=${id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json;charset=utf-8' }
        }).then((res) => {
            if (res.data.code == 200) {
                console.log('返回展示数字',res.data.data)
                this.setState({ otherdata: res.data.data });
            } else {
                base.openNotification('error', res.data.msg)
            }
        });
    }
    //查询会员
    searchBtn() {
        this.setState({ current: 1 });
        this.search(1);
    }
    search(page) {
        this.setState({loading:true});
        this.props.form.validateFields((err, values) => {
            console.log('values.storeId',values.storeId)
            request(`${couponapi}salesCouponOpenApi/queryMembersInfoPage.jhtm?mobile=${values.mobile}&rows=8&cardNumber=${values.cardNumber}&page=${page}&shopid=${this.state.data.salescouponsApi.shopid}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json;charset=utf-8' },
            }).then((res) => {
                this.setState({loading:false});
                if (res.data.code == '200') {
                    this.setState({ mtable: res.data.data.datas, total: res.data.data.totalCount })
                } else {
                    base.openNotification('error', res.data.msg);
                }
            });
        })

    }
    addmenber(data) {
        let cktableids = this.state.cktable.map(c => { return c.userId });
        if (cktableids.indexOf(data.userId) < 0) {
            this.state.cktable.push(data);
        }
        this.setState({ cktable: this.state.cktable })
    }
    delmenber(data) {
        let cktableids = this.state.cktable.map(c => { return c.userId });
        let i = cktableids.indexOf(data.userId);
        this.state.cktable.splice(i, 1);
        this.setState({ cktable: this.state.cktable })
    }
    send() {
        let cktableids = this.state.cktable.map(c => { return c.userId });
        let data=`couponid=${this.state.data.salescouponsApi.id}&shopid=${this.state.data.salescouponsApi.shopid}&members=${cktableids?cktableids.toString():''}`;
        this.setState({loading:true});
        request(`${couponapi}salesCouponOpenApi/sendSelectedNow.jhtm`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' },
            body:data
        }).then((res) => {
            this.setState({loading:false})
            if (res.data.code == 200) {
                location.hash = '/coupon/list';
                base.openNotification('success', res.data.msg)
            } else {
                base.openNotification('error', res.data.msg)
            }
        });
    }
    back = () => {
        history.go(-1)
    }

}

const CouponSendMore = Form.create()(formWrapper);
export default CouponSendMore;
