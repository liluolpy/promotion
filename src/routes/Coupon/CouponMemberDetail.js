import React from 'react';
import {Button, Form,Row,Col} from 'antd';
import { couponapi } from '../../models/config';
import base from '../../models/base';
import moment from 'moment';
import request from '../../utils/request';

class formWrapper extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            memberid:'',
            name:'',
            amount:'',
            disabled:'',
            usescope:'',
            shopid:'',
            terminal:'',
            superposition:'',
            totalnumber:'',
            createtime:'',
            updatetime:'',
            couponcode:'',
            couponsource:'',
            batchno:'',
            status:''

        };
    };

    componentDidMount() {
        const match = /memberdetail\/([^/?]+)\/([^/?]+)/.exec(location.hash);
        if (match) {
            request(`${couponapi}salesCouponOpenApi/queryMemberCouponById.jhtm?id=${match[1]}`, {
                method: 'GET'
            }).then((res) => {
                if(res.data.code==200){
                    console.log('res.data.data',res.data.data)
                    this.setState({
                        memberid:res.data.data.memberid,
                        name:res.data.data.name,
                        amount:res.data.data.amount,
                        disabled:res.data.data.disabled,
                        usescope:res.data.data.usescope,
                        shopid:res.data.data.shopid,
                        terminal:res.data.data.terminal,
                        superposition:res.data.data.superposition,
                        totalnumber:res.data.data.totalnumber,
                        createtime:res.data.data.createtime,
                        updatetime:res.data.data.updatetime,
                        couponcode:res.data.data.couponcode,
                        couponsource:res.data.data.couponsource,
                        batchno:res.data.data.batchno,
                        status:res.data.data.status
                    })
                }
            });
        } else {
            location.hash = '/coupon/list';
        }
    }
    back = () => {
        history.go(-1)
    }
    transformCtype = (text) => {
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
    transformStatus=(text)=>{
        let str='';
        if(text==0){
            str="未使用";
        }else if(text==1){
            str="占用";
        }else if(text==2){
            str="作废";
        }else if(text==3){
            str="使用"
        }
        return str;
    }
    transformSource=(text)=>{
        let str = '';
        if(text==1){
            str = "惠商注册立送";
        }else if(text==2){
            str="惠商下单立送"
        }else if(text==3){
            str="惠商后台派送"
        }else if(text==4){
            str="惠商积分兑换"
        }else if(text==5){
            str="惠商积分商城派送"
        }else if(text==6){
            str=""
        }else if(text==7){
            str="联想无无人体验店微信发送"
        }else if(text==8){
            str="新零售扫码增送"
        }
        return str;
    }
    transformShopId = (text) => {
        if (text == '14') {
            return '惠商';
        } else if (text == '20') {
            return '新零售';
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
    render() {
        const col = {
            labelCol: {
                span: 9
            },
            wrapperCol: {
                span: 15
            }
        };
        return (
        <div>
            <Form >
                <Row gutter={16}>
                    <Col span={7}>
                        <Form.Item {...col} label="用户登录名：">{this.state.memberid}</Form.Item>
                    </Col>
                    <Col span={7}>
                        <Form.Item {...col} label="优惠券名称：">{this.state.name}</Form.Item>
                    </Col>
                    <Col span={7}>
                        <Form.Item {...col} label="优惠金额：">{this.state.amount}</Form.Item>
                    </Col>
               
                    <Col span={7}>
                    <Form.Item {...col} label="是否禁用：">{this.state.disabled=0?'未禁用':'禁用'}</Form.Item>
                    </Col>
                    <Col span={7}>
                    <Form.Item {...col} label="优惠券类型：">{this.transformCtype(this.state.usescope)}</Form.Item>
                    </Col>
                    <Col span={7}>
                    <Form.Item {...col} label="商城：">{this.transformShopId(this.state.shopid)}</Form.Item>
                    </Col>
                    <Col span={7}>
                    <Form.Item {...col} label="平台：">{this.transformTerminal(this.state.terminal)}</Form.Item>
                    </Col>
                    <Col span={7}>
                    <Form.Item {...col} label="是否叠加：">{this.state.superposition=0?'是':'否'}</Form.Item>
                    </Col>
                    <Col span={7}>
                    <Form.Item {...col} label="单次使用最大张数：">{this.state.totalnumber}</Form.Item>
                    </Col>
               
                    <Col span={7}>
                    <Form.Item {...col} label="创建时间：">{this.state.createtime}</Form.Item>
                    </Col>
                    <Col span={7}>
                    <Form.Item {...col} label="更新时间：">{this.state.updatetime}</Form.Item>
                    </Col>
                    <Col span={7}>
                    <Form.Item {...col} label="优惠券码：">{this.state.couponcode}</Form.Item>
                    </Col>
                    <Col span={7}>
                    <Form.Item {...col} label="优惠券来源">{this.transformSource(this.state.couponsource)}</Form.Item>
                    </Col>
                    <Col span={7}>
                    <Form.Item {...col} label="发放批次：">{this.state.batchno}</Form.Item>
                    </Col>
                    <Col span={7}>
                    <Form.Item {...col} label="状态：">{this.transformStatus(this.state.status)}</Form.Item>
                    </Col>
                </Row>
                </Form>
                <div className="mt20">
                    <Button style={{ marginLeft: 8 }} onClick={this.back}>返回</Button>
                </div>
        </div>
    )}
}

const MemberDetail = Form.create()(formWrapper);
export default MemberDetail;
