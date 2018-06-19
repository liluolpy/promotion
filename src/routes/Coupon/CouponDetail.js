import React from 'react';
import { Select, Button, Form, Table, Input, Tree, Modal, DatePicker, Checkbox, Radio } from 'antd';
import { couponapi } from '../../models/config';
import base from '../../models/base';
import moment from 'moment';
import request from '../../utils/request';

const Option = Select.Option;
const CheckboxGroup = Checkbox.Group;
const RadioGroup = Radio.Group;
const { RangePicker } = DatePicker;
const TreeNode = Tree.TreeNode;
const pageSize = 10;
const formItemLayout = {
    labelCol: { span: 5 },
    wrapperCol: { span: 19 },
};

class formWrapper extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            id: "",
            type: "",
            stylebg: "",
            stylebgCK: "",
            colorlist: [{ key: "Color010", value: "#63b359" }, { key: "Color020", value: "#2c9f67" }, { key: "Color030", value: "#509fc9" }, { key: "Color040", value: "#5885cf" }, { key: "Color050", value: "#9062c0" }, { key: "Color060", value: "#d09a45" }, { key: "Color070", value: "#e4b138" }, { key: "Color080", value: "#ee903c" }, { key: "Color081", value: "#f08500" }, { key: "Color082", value: "#a9d92d" }, { key: "Color090", value: "#dd6549" }, { key: "Color100", value: "#cc463d" }, { key: "Color101", value: "#cf3e36" }, { key: "Color102", value: "#5e6671" }],
            wechatData: {},
            flvisible: false,
            flData: [],
            spflsel: [],
            expandedKeys: false,
            spvisible: false,
            ysvisible: false,
            editItem: {},
            dsptable: [],
            sptable: [],
            sptablecheck: [],
            useScope: [],
            shops: [],
            couponWay: [],
            terminal: [],
            gettype: [],
            sptotal: 0,
            spcurrent: 1,
            selwechat:false,
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
            morestoreids: []
        };
    };

    componentDidMount() {
        const match = /detail\/([^/?]+)\/([^/?]+)/.exec(location.hash);
        this.setState({ id: match[1], type: match[2] })
        if (match) {
          
            request(`${couponapi}salesCouponOpenApi/toEdit.jhtm?id=${match[1]}&sourceway=${match[2]}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json;charset=utf-8' },
            }).then((res) => {
                this.setState({
                    data: res.data, morestoreids: res.data.salescouponsApi.storeids ? res.data.salescouponsApi.storeids.split(",") : [], sptable: res.data.productlist
                })
                if(res.data.wechatStyle){
                    this.setState({
                        wechatData: res.data.wechatStyle, 
                        stylebg: this.ckey(res.data.wechatStyle.color), 
                        stylebgCK: res.data.wechatStyle.color, 
                       
                   })
                }else{
                    request(`${couponapi}pagePropertiesOpenApi/getWechatStyle.jhtm?shopid=20`, {
                        method: 'GET',
                    }).then((res) => {
                        if (res.data.code == 200) {
                            this.setState({ wechatData: res.data.data || {}, stylebgCK: res.data.data.color, stylebg: this.ckey(res.data.data.color) });
                        } else {
                            base.openNotification('error', res.data.msg)
                        }
                    });
                }
                this.getConfiguration(res.data.salescouponsApi.shopid);
                this.getWechat(res.data.salescouponsApi.terminal);
            });
        } else {
            location.hash = '/coupon/list';
        }

        request(`${couponapi}pagePropertiesOpenApi/getShopIds.jhtm`, {
            method: 'GET',
        }).then((res) => {
            if (res.data.code == 200) {
                this.setState({ shops: res.data.data || [] });
            } else {
                base.openNotification('error', res.data.msg)
            }
        });
        request(`${couponapi}pagePropertiesOpenApi/getGettype.jhtm`, {
            method: 'GET',
        }).then((res) => {
            if (res.data.code == 200) {
                this.setState({ gettype: res.data.data || [] });
            } else {
                base.openNotification('error', res.data.msg)
            }
        });
        const { params } = this.props;

        if (params.id == null) {

        } else {
            // this.getEditItem(params.id);
        }
    }

    render() {
        const col = {
            labelCol: {
                span: 9
            },
            wrapperCol: {
                span: 15
            }
        };
        const spcolumns = [
            { title: '商品名称', dataIndex: 'name' },
            { title: '物料编码', dataIndex: 'materialNumber' },
            { title: '商品编码', render: (text, record) => { return this.getCode(record) } },
            // { title: '销售平台', dataIndex: 'xspt' },
            // { title: '上架状态', dataIndex: 'sjzt' },
        ];
        //树
        // const loop = data => data.map((item) => {
        //     if (item.dataList && item.dataList.length) {
        //         return <TreeNode key={item.productTypeCode} title={item.productTypeName}>{loop(item.dataList)}</TreeNode>;
        //     }
        //     return <TreeNode key={item.productTypeCode} title={item.productTypeName} />;
        // });
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
        const gtselect = this.state.gettype.map((d, index) => {
            if (this.state.data.salescouponsApi.gettype == d.id) {
                return <span>{d.text}</span>
            }
        });
        return (
            <div>
                <h2>基础信息</h2>
                <Form className="cForm detail wd_33 mt20 ">
                    <Form.Item {...col} label="优惠券名称">
                        {this.state.data.salescouponsApi.name}
                    </Form.Item>
                    <Form.Item {...col} label="商城">
                        {spselect}
                    </Form.Item>
                    <Form.Item {...col} label="推广平台">
                        {tmselect}
                    </Form.Item>
                    <Form.Item {...col} label="有效时间限制">
                        {gtselect}
                    </Form.Item>
                    <Form.Item {...col} label="有效时间">
                        {this.state.data.salescouponsApi.fromtime}~{this.state.data.salescouponsApi.totime}
                    </Form.Item>
                    <Form.Item {...col} label="领取后有效的天数">
                    {(this.state.data.salescouponsApi.gettype==1?`${this.state.data.salescouponsApi.intervaldate}天`:'立即生效')} 
                    </Form.Item>
                    {(this.state.selwechat?(
                        <Form.Item {...col} label="微信样式">
                        <Button onClick={this.wechatStyle.bind(this)}>查看样式</Button>
                    </Form.Item>
                    ):null)}  
                    <div className="ant-row ant-form-item">
                        <div className="ant-col-9 ant-form-item-label">
                            <label>规则描述</label>
                        </div>
                        <div className="ant-col-15 ant-form-item-control-wrapper">
                            <div className="ant-form-item-control" style={{ width: "220%" }}>
                                <span style={{ wordBreak: "break-all", whiteSpace: "pre-wrap" }}>{this.state.data.salescouponsApi.description}</span>
                            </div>
                        </div>
                    </div>
                </Form>
                <Form className="cForm detail wd_33 mb20">
                    <Form.Item {...col} label="优惠券类型">
                        {usselect}
                    </Form.Item>
                </Form>
                <div className={this.state.data.salescouponsApi.usescope != 1 ? '' : 'none'}>
                    <h2>金额设置</h2>
                    <Form className="cForm detail wd_33 mt20 mb20">
                        <Form.Item {...col} label="优惠券金额">
                            {this.state.data.salescouponsApi.amount}
                        </Form.Item>
                        <Form.Item {...col} label="使用最低限额">
                            {this.state.data.salescouponsApi.minorderamount == 0 ? '0.00' : this.state.data.salescouponsApi.minorderamount}
                        </Form.Item>
                    </Form>
                </div>
                <div className={this.state.data.salescouponsApi.usescope != '' ? '' : 'none'}>
                    <h2>领券规则</h2>
                    <Form className="cForm detail wd_33 mt20">
                        <Form.Item {...col} label="领取方式">
                            {cwselect}
                        </Form.Item>
                    </Form>
                    <Form className="cForm detail wd_33 pt0 mb20">
                        <Form.Item {...col} label="是否可以领取">
                            {this.state.data.salescouponsApi.iscanget == 1 ? "是" : "否"}
                        </Form.Item>
                        <Form.Item {...col} label="领取开始时间">
                            {this.state.data.salescouponsApi.getstarttime}
                        </Form.Item>
                        <Form.Item {...col} label="领取结束时间">
                            {this.state.data.salescouponsApi.getendtime}
                        </Form.Item>
                        <Form.Item {...col} label="最大发放张数">
                            {this.state.data.salescouponsApi.limitsymbol == 2 ? "限制" : "不限制"}
                        </Form.Item>
                        <Form.Item {...col} label="张数">
                            {this.state.data.salescouponsApi.maxnumber}
                        </Form.Item>
                    </Form>
                </div>
                <div className={this.state.data.salescouponsApi.usescope != 1 ? '' : 'none'}>
                    <h2>使用规则</h2>
                    <Form className="cForm detail wd_33 mt20 mb20">
                        <Form.Item {...col} label="是否与其他优惠共享">
                            {this.state.data.salescouponsApi.share === 1 ? "是" : "否"}
                        </Form.Item>
                        <Form.Item {...col} label="绑定规则">
                            {this.bdgz(this.state.data.salescouponsApi.type)}
                        </Form.Item>
                    </Form>
                </div>
                <h2>审核信息</h2>
                <Form className="cForm detail wd_33 mt20 mb20">
                    <Form.Item {...col} label="审核状态">
                        {this.checkstu(this.state.data.salescouponsApi.status)}
                    </Form.Item>
                    {/* <Form.Item {...col} label="审核人">
                        {this.state.data.salescouponsApi.preson}
                    </Form.Item> */}
                </Form>
                <div className={this.state.data.salescouponsApi.usescope == 1 || (this.state.data.salescouponsApi.type == 4 || this.state.data.salescouponsApi.type == 5) ? '' : 'none'}>
                    <h2>绑定店铺</h2>
                    <Form className="cForm detail wd_33 mt20 mb40">
                        {this.state.data.storelist.map(c => { return c.storename + '，' })}
                    </Form>
                </div>
                <div className={this.state.data.salescouponsApi.type == 2 || this.state.data.salescouponsApi.type == 5 ? '' : 'none'}>
                    <h2 style={{ margin: "10px 0" }}>绑定商品</h2>
                    <Table rowKey="code" pagination={false} columns={spcolumns} dataSource={this.state.sptable} />
                </div>
                <div className="mt20">
                    <Button style={{ marginLeft: 8 }} onClick={this.back}>返回</Button>
                </div>
                <Modal
                    width="800px"
                    title="微信样式"
                    visible={this.state.ysvisible}
                    onCancel={this.hidestyle.bind(this)}
                    onOk={this.savestyle.bind(this)}
                >
                    <div style={{ width: '265px', height: '473px', margin: '0px 20px 0px 10px', paddingTop: '50px', borderRadius: '10px', background: this.state.stylebg, float: 'left' }}>
                        <div style={{ margin: '0px 8px 18px 8px', height: '333px', borderRadius: '5px', background: '#fff' }}>
                            <div style={{ textAlign: 'center', position: 'relative', top: '-20px' }}>
                                <img src={this.state.wechatData.logo_url} style={{ width: '38px', height: '38px', borderRadius: '50%', marginBottom: '8px' }} />
                                <p style={{ textAlign: 'center', color: '#d3d3d3', marginBottom: '8px' }}>{this.state.wechatData.brand_name}</p>
                                <Button style={{ textAlign: 'center', width: '100px', height: '30px', color: '#fff', background: this.state.stylebg }}>使用</Button>
                            </div>
                            <div style={{ marginLeft: '40px', lineHeight: '22px', height: '150px' }}>
                                <div><span style={{ width: '60px', display: 'inline-block', verticalAlign: 'top' }}>有效期：</span>
                                    <span style={{ width: '143px', display: 'inline-block' }}><span>{this.state.data.salescouponsApi.fromtime}<span> ~ </span>{this.state.data.salescouponsApi.totime}</span></span>
                                </div>
                                <div><span style={{ width: '60px', display: 'inline-block' }}>可用时间：</span>
                                    <span>
                                        <span>周一 </span>
                                        <span>至 </span>
                                        <span>周日 </span>
                                        <span>全天</span>
                                    </span>
                                </div>
                            </div>
                            <div style={{ margin: '0px 25px', lineHeight: '25px' }}>
                                <p style={{ borderTop: '1px dotted #d3d3d3', paddingLeft: '15px' }}>使用门店</p>
                                <p style={{ borderTop: '1px solid #d3d3d3', paddingLeft: '15px' }}>公众号</p>
                            </div>
                        </div>
                        <div style={{ margin: '0px 8px', height: '43px', borderRadius: '5px', background: '#fff' }}></div>
                    </div>
                    <div style={{ width: '464px', minHeight: '473px', display: 'inline-block', borderRadius: '5px', paddingTop: '20px' }} className='mForm'>
                        <Form.Item {...formItemLayout} label="商户名称">
                            联想4S生活店
                        </Form.Item>
                        <Form.Item {...formItemLayout} label="卡券颜色">
                            <div id="cclolor" className="ant-radio-group ant-radio-group-large"><span className="ant-radio-button-wrapper" style={{ background: this.state.stylebg }}></span></div>
                        </Form.Item>
                        <Form.Item {...formItemLayout} label="有效时间">
                            <span style={{ display: 'inline-block' }}><span>{this.state.data.salescouponsApi.fromtime}<span> ~ </span>{this.state.data.salescouponsApi.totime}</span></span>
                        </Form.Item>
                        <Form.Item {...formItemLayout} label="可用时段">
                            全部时段
                        </Form.Item>
                        <Form.Item {...formItemLayout} label="优惠券说明">
                        </Form.Item>
                        <Form.Item {...formItemLayout} label="使用须知">
                            <span style={{ wordBreak: "break-all", whiteSpace: "pre-wrap" }}>{this.state.data.salescouponsApi.description}</span>
                        </Form.Item>
                    </div>
                </Modal>
            </div>
        )
    }
    getWechat(sel){
      let selarr;
      selarr=sel.split(",")
      if(selarr.length==2){
          this.setState({selwechat:true})
      }
      if(selarr.length==1 && selarr[0]==4){
          this.setState({selwechat:true})
      }
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
    // 打开微信样式
    wechatStyle() {
        this.setState({ ysvisible: true })
    }
    ckey(v) {
        for (var { key: k, value: c } of this.state.colorlist) {
            if (k == v) {
                return c;
            }
        }
    }
    savestyle() {
        this.setState({ ysvisible: false })
    }
    hidestyle() {
        this.setState({ ysvisible: false })
    }
    getCode = (record) => {
        return (
            <span>{record.code || record.gcode}</span>
        )
    };

    back = () => {
        history.go(-1)
    }
    // 审核状态
    checkstu(v) {
        let status = '';
        switch (v) {
            case 0:
                status = '新建';
                break;
            case 1:
                status = '审核未通过';
                break;
            case 2:
                status = '审核通过';
                break;
            case 3:
                status = '待审核';
                break;
            case 4:
                status = '一级审核通过';
                break;
        }
        return status;
    }
    // 绑定规则
    bdgz(v) {
        let type = '';
        switch (v) {
            case 0:
                type = '不绑定商品';
                break;
            case 2:
                type = '按商品绑定';
                break;
            case 4:
                type = '按门店绑定';
                break;
            case 5:
                type = '按门店商品绑定';
                break;
        }
        return type;
    }

}

const CouponDetail = Form.create()(formWrapper);
export default CouponDetail;
