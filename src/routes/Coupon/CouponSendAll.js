import React from 'react';
import { Select, Button, Form, Table, Input, Tree, Modal, DatePicker, Checkbox, Radio } from 'antd';
import { couponapi } from '../../models/config';
import base from '../../models/base';
import moment from 'moment';
import request from '../../utils/request';

const { RangePicker } = DatePicker;
const TreeNode = Tree.TreeNode;
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
            otherdata: {},
            current: 1,
            total: 0,
            loading:false
        };
    };

    componentDidMount() {
        const match = /sendall\/([^/?]+)/.exec(location.hash);
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
        } else {
            location.hash = '/coupon/list';
        }
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
                <div >
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
                <div style={{clear:'both'}}></div> 
                <div className="mt20">
                    <Button type="primary" loading={this.state.loading} onClick={this.send.bind(this)}>全员发券</Button>
                    <Button style={{ marginLeft: 8 }} onClick={this.back}>返回</Button>
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
                this.setState({ otherdata: res.data.data });
            } else {
                base.openNotification('error', res.data.msg)
            }
        });
    }
    send(){
        this.setState({loading:true});
        request(`${couponapi}salesCouponOpenApi/sendAllSalescoupons.jhtm?ids=${this.state.data.salescouponsApi.id}&shopid=${this.state.data.salescouponsApi.shopid}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json;charset=utf-8' }
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

const CouponSendAll = Form.create()(formWrapper);
export default CouponSendAll;
