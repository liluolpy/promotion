import React from 'react';
import { Select, Button, Form, Table, Input, InputNumber, Tree, Modal, DatePicker, Checkbox, Radio } from 'antd';
import { couponapi } from '../../models/config';
import { domain } from '../../models/config';
import base from '../../models/base';
import moment from 'moment';
import request from '../../utils/request';

const Option = Select.Option;
const CheckboxGroup = Checkbox.Group;
const RadioGroup = Radio.Group;
const { RangePicker } = DatePicker;
const { TextArea } = Input;
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
            proData: [],
            editItem: {},
            dsptable: [],
            sptable: [],
            sptablecheck: [],
            storefront: [],
            useScope: [],
            shops: [],
            couponWay: [],
            terminal: [],
            gettype: [],
            proLoading: false,
            sptotal: 0,
            spcurrent: 1,
            disabled: true,
            selwechat:false,
            data: {
                categoryTreeList: [],
                productlist: [],
                salescouponsApi: {
                    storeids: "",
                    terminal: ""
                },
                storelist: [],
                sourceway: [],
                wechatStyle: {}
            },
            morestoreids: [],
            precision:1,
            min:0.01,
            minamount:0.00
        };
    };

    componentDidMount() {
        const match = /edit\/([^/?]+)/.exec(location.hash);
        this.setState({ id: match[1] })
        if (match) {
            request(`${couponapi}salesCouponOpenApi/toEdit.jhtm?id=${match[1]}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json;charset=utf-8' },
            }).then((res) => {
                console.log('res.data',res.data)
                this.setState({
                    data: res.data, morestoreids: res.data.salescouponsApi.storeids ? res.data.salescouponsApi.storeids.split(",") : [], sptable: res.data.productlist,
                    maymaxnum:100000000-res.data.salescouponsApi.maxnumber,
                    disabled: res.data.salescouponsApi.status == 2
                })
               
                if (res.data.salescouponsApi.terminal.indexOf('4') > -1) {
                    this.setState({ selwechat: true })
                }
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
                this.initnum(res.data.salescouponsApi.amount,res.data.salescouponsApi.minorderamount,res.data.salescouponsApi.usescope)
                this.getWechat(res.data.salescouponsApi.terminal);
            });
        } else {
            location.hash = '/coupon/list';
        }

        request(`${domain}pcsd-nrwms-service/Storefront/GetAll`, {
            method: 'GET',
        }).then((res) => {
            if (res.data.code == 200) {
                this.setState({ storefront: res.data.data || [] });
            } else {
                base.openNotification('error', '查询门店失败，请稍后重试!')
            }
        });
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
            this.getEditItem(params.id);
        }
    }
    initnum=(m,n,u)=>{
        if(u==1){
            this.setState({precision:2,min:0.00,minamount:0.00})
            this.props.form.setFields({'amount':{value:'0.00'}})
            this.props.form.setFields({'minorderamount':{value:'0.00'}})
        }else if(u==4){
            this.setState({precision:1,min:1.0,minamount:0.0})
            this.props.form.setFields({'amount':{value:m}})
            this.props.form.setFields({'minorderamount':{value:n}})
        }else{
            this.setState({precision:2,min:0.01,minamount:0.00})
            this.props.form.setFields({'amount':{value:m}})
            this.props.form.setFields({'minorderamount':{value:n}})
        }
        // let marr;
        // let narr;
        // let backamount;
        // let backmin;
        // console.log('m',typeof m)
        // marr=m.toString().split('.')
        // narr=n.toString().split('.')
        // console.log('n',narr)
        // console.log('m',marr)
        // if(u==4){
        //     backamount=this.ruleNumOne(marr)
        //     backmin=this.ruleNumOne(narr)
        //     this.props.form.setFields({'amount':{value:backamount}})
        //     this.props.form.setFields({'minorderamount':{value:backmin}})
        // }else if(u==1){
        //     this.props.form.setFields({'amount':{value:'0.00'}})
        //     this.props.form.setFields({'minorderamount':{value:'0.00'}})
        // }else{
        //     backamount=this.ruleNum(marr)
        //     backmin=this.ruleNum(narr)
        //     console.log('backmin',backmin)
        //     this.props.form.setFields({'amount':{value:backamount}})
        //     this.props.form.setFields({'minorderamount':{value:backmin}})
        // }
    }
   
    render() {
        const col = {
            labelCol: { span: 8},
            wrapperCol: { span: 16}
        };
        var spcolumns = [
            { title: '商品名称', dataIndex: 'name' },
            { title: '物料编码', dataIndex: 'materialNumber' },
            { title: '商品编码', render: (text, record) => { return this.getCode(record) } },
            // { title: '销售平台', dataIndex: 'xspt' },
            // { title: '上架状态', dataIndex: 'sjzt' },
        ];
        if (!this.state.disabled) {
            spcolumns.push({ title: '操作', render: (text, record, index) => { return (<span onClick={() => this.delCkItem(index)}><a>删除</a></span>) } })
        }
        const proCol = [
            { title: '商品名称', dataIndex: 'name' },
            { title: '物料编码', dataIndex: 'materialNumber' },
            { title: '商品编码', dataIndex: 'code' },
            { title: '上架状态', dataIndex: 'marketable', render: (text) => { return text == 1 ? "已上架" : "未上架" } },
        ];
        //树
        // const loop = data => data.map((item) => {
        //     if (item.dataList && item.dataList.length) {
        //         return <TreeNode key={item.productTypeCode} title={item.productTypeName}>{loop(item.dataList)}</TreeNode>;
        //     }
        //     return <TreeNode key={item.productTypeCode} title={item.productTypeName} />;
        // });
        const { getFieldDecorator } = this.props.form;

        const spagination = {
            total: this.state.sptotal,
            current: this.state.spcurrent,
            pageSize: pageSize,
            showQuickJumper: true,
            onChange: (page, pageSize) => {
                this.setState({ spcurrent: page });
                this.searchPro(page);
            }
        };
        const spSelection = {
            onChange: (selectedRowKeys, selectedRows) => {
                this.setState({ sptablecheck: selectedRows })
            }
        };
        const mdselect = this.state.storefront.map((d, index) => {
            const id = d.storeID + '', name = d.storeName;
            return <Option key={id} value={id}>{name}</Option>
        });
        const spselect = this.state.shops.map((d, index) => {
            const id = d.shopid + '', name = d.name;
            return <Option key={id} value={id}>{name}</Option>
        });
        const usselect = base.tlist(this.state.useScope);
        const cwselect = base.tlist(this.state.couponWay);
        const gtselect = base.tlist(this.state.gettype);
        const coselect = this.state.colorlist.map((d, index) => {
            const key = d.key + '', value = d.value;
            return <Radio.Button key={key} value={key} style={{ background: value }}></Radio.Button>
        });
        return (
            <div>
                <h2>基础信息</h2>
                <Form className="searchForm cForm w_33 wd_100 mt20 mb20 pr0 fleft">
                    <Form.Item {...col} label="优惠券名称">
                        {getFieldDecorator('name', {
                            initialValue: this.state.data.salescouponsApi.name,
                            rules: [{
                                required: true,
                                whitespace: true,
                                message: '请输入优惠券名称'
                            }]
                        })(<Input disabled={this.state.disabled} style={{ width: '96%' }} maxLength="9" placeholder="请输入优惠券名称" />)}
                    </Form.Item>
                    <Form.Item {...col} label="有效时间限制">
                        {getFieldDecorator('gettype', {
                            initialValue: this.state.data.salescouponsApi.gettype + '',
                            rules: [{
                                required: true,
                            }]
                        })(
                            <Select disabled style={{ width: '96%' }}>
                                {gtselect}
                            </Select>
                        )}
                    </Form.Item>
                    {this.state.data.salescouponsApi.gettype==1?(<Form.Item {...col} label="领取后有效的天数">
                        {getFieldDecorator('intervaldate', {
                            initialValue: this.state.data.salescouponsApi.intervaldate,
                            rules: [{
                                required: true,
                            }, { validator: this.checkintervaldate }]
                        })(
                            <InputNumber disabled={this.props.form.getFieldValue('gettype') == 0 || this.state.disabled} style={{ width: '96%' }} min={0} max={365} />
                        )}
                    </Form.Item>):(<Form.Item {...col} label="领取后有效的天数">
                        <Input disabled={this.props.form.getFieldValue('gettype') == 0  || this.state.disabled} style={{ width: '96%' }} value="立即生效"/>
                    </Form.Item>)}
                    <Form.Item {...col} label="优惠券类型">
                        {getFieldDecorator('usescope', {
                            initialValue: this.state.data.salescouponsApi.usescope + '',
                            rules: [{
                                required: true,
                            }]
                        })(
                            <Select disabled style={{ width: '96%' }}>
                                {usselect}
                            </Select>
                        )}
                    </Form.Item>
                </Form>
                <Form className="searchForm cForm w_66 wd_50 mt20 mb20 pl0 fleft">
                    <Form.Item {...col} label="选择商城">
                        {getFieldDecorator('shopId', {
                            initialValue: this.state.data.salescouponsApi.shopid + '',
                            rules: [{
                                required: true,
                                message: '请选择商城'
                            }]
                        })(
                            <Select disabled={this.state.disabled} style={{ width: '96%' }} onChange={this.shopchange.bind(this)}>
                                {spselect}
                            </Select>)}
                    </Form.Item>
                    <Form.Item {...col} label="推广平台">
                        {getFieldDecorator('terminal', {
                            initialValue: this.state.data.salescouponsApi.terminal.split(","),
                            rules: [{
                                required: true,
                                message: '请选择推广平台'
                            }]
                        })(
                            <CheckboxGroup disabled={this.state.disabled} className="w250" options={this.state.terminal} onChange={this.checkTerminal} />
                        )}
                    </Form.Item>
                    <Form.Item {...col} label="有效期开始">
                        {getFieldDecorator('fromtime', {
                            initialValue: moment(this.state.data.salescouponsApi.fromtime),
                            rules: [{
                                required: true,
                                message: '请输入有效期开始时间'
                            }, { validator: this.checktime }]
                        })(<DatePicker onChange={(v) => this.fromtimeChange(v)} disabled={this.state.disabled} style={{ width: '96%' }} showTime={{ format: 'HH:mm:ss' }} format="YYYY-MM-DD HH:mm:ss" />)}
                    </Form.Item>
                    <Form.Item {...col} label="有效期结束">
                        {getFieldDecorator('totime', {
                            initialValue: moment(this.state.data.salescouponsApi.totime),
                            rules: [{
                                required: true,
                                message: '请输入有效期结束时间'
                            }, { validator: this.checktotime }]
                        })(<DatePicker onChange={(v) => this.totimeChange(v)} style={{ width: '96%' }} showTime={{ format: 'HH:mm:ss' }} format="YYYY-MM-DD HH:mm:ss" />)}
                    </Form.Item>
                    <Form.Item {...col} label="规则描述">
                        {getFieldDecorator('description', {
                            initialValue: this.state.data.salescouponsApi.description,
                            rules: [{
                                required: true,
                                whitespace: true,
                                message: '请输入规则描述'
                            }]
                        })(<TextArea disabled={this.state.disabled} rows={4} style={{ width: '96%',resize:'none' }} placeholder="请输入规则描述" />)}
                    </Form.Item>
                    {(this.state.selwechat?(
                        <Form.Item {...col} label="微信样式">
                        <Button onClick={this.wechatStyle.bind(this)}>编辑样式</Button>
                        </Form.Item>
                    ):null)}
                    
                </Form>
                <div style={{ clear: 'both' }}></div>
                <div className={this.state.data.salescouponsApi.usescope != 1 ? '' : 'none'}>
                    <h2>金额设置</h2>
                    <Form className="searchForm cForm wd_33 mt20 mb20">
                        <Form.Item {...col} label="优惠券金额">
                            {getFieldDecorator('amount', {
                                initialValue: this.state.data.salescouponsApi.amount + '',
                                rules: [{
                                    required: this.props.form.getFieldValue('usescope') != 1 ? true : false,
                                    validator: this.checkamount
                                }]
                            })(<InputNumber precision={this.state.precision} min={this.state.min} disabled={this.state.disabled} style={{ width: '96%' }} onBlur={this.recheck} placeholder="请输入优惠券金额" />)}
                        </Form.Item>
                        <Form.Item {...col} label="使用最低限额">
                            {getFieldDecorator('minorderamount', {
                                initialValue: this.state.data.salescouponsApi.minorderamount == 0 ? '0.00' : this.state.data.salescouponsApi.minorderamount + '',
                                rules: [
                                    {validator: this.checkminorderamount}
                                ],
                            })(<InputNumber  precision={this.state.precision} min={this.state.minamount} disabled={this.state.disabled} style={{ width: '96%' }} placeholder="请输入使用最低限额" onBlur={this.recheck} />)}
                        </Form.Item>
                    </Form>
                </div>
                <div className={this.state.data.salescouponsApi.usescope != '' ? '' : 'none'}>
                    <h2>领券规则</h2>
                    <Form className="searchForm cForm wd_33 mt20">
                        <Form.Item {...col} label="领取方式">
                            {getFieldDecorator('couponway', {
                                initialValue: this.state.data.salescouponsApi.couponway + '',
                                rules: [{
                                    required: true,
                                }]
                            })(
                                <Select disabled={this.state.disabled} style={{ width: '96%' }}>
                                    {cwselect}
                                </Select>
                            )}
                        </Form.Item>
                    </Form>
                    <Form className="searchForm cForm wd_33 pt0">
                        <Form.Item {...col} label="是否可以领取">
                            {getFieldDecorator('iscanget', {
                                initialValue: this.state.data.salescouponsApi.iscanget,
                                rules: [{
                                    required: true
                                }]
                            })(
                                <RadioGroup disabled={this.state.disabled} onChange={(v) => this.icchange(v.target.value)}>
                                    <Radio value={1}>是</Radio>
                                    <Radio value={0}>否</Radio>
                                </RadioGroup>
                            )}
                        </Form.Item>
                        <Form.Item {...col} label="领取开始时间">
                            {getFieldDecorator('getstarttime', {
                                initialValue: this.state.data.salescouponsApi.getstarttime ? moment(this.state.data.salescouponsApi.getstarttime) : '',
                                rules: [{
                                    required: this.props.form.getFieldValue('iscanget') == 1 ? true : false,
                                    message: '请输入领取开始时间'
                                }, { validator: this.checkstarttime }]
                            })(<DatePicker disabled={this.props.form.getFieldValue('iscanget') == 0 || this.state.disabled || this.state.selwechat ? true : false} style={{ width: '96%' }} showTime={{ format: 'HH:mm:ss' }} format="YYYY-MM-DD HH:mm:ss" />)}
                        </Form.Item>
                        <Form.Item {...col} label="领取结束时间">
                            {getFieldDecorator('getendtime', {
                                initialValue: this.state.data.salescouponsApi.getendtime ? moment(this.state.data.salescouponsApi.getendtime) : '',
                                rules: [{
                                    required: this.props.form.getFieldValue('iscanget') == 1 ? true : false,
                                    message: '请输入领取结束时间'
                                }, { validator: this.checkendtime }]
                            })(<DatePicker disabled={this.props.form.getFieldValue('iscanget') == 0 || this.state.selwechat ? true : false} style={{ width: '96%' }} showTime={{ format: 'HH:mm:ss' }} format="YYYY-MM-DD HH:mm:ss" />)}
                        </Form.Item>
                    </Form>
                    <Form className="searchForm cForm wd_33 pt0 mb20">
                        <Form.Item {...col} label="最大发放张数">
                            {getFieldDecorator('limitsymbol', {
                                initialValue: this.state.data.salescouponsApi.limitsymbol,
                                rules: [{
                                    required: true
                                }]
                            })(
                                <RadioGroup disabled={this.state.disabled} style={{ width: '96%' }} onChange={this.lmchange.bind(this)}>
                                    <Radio value={1} >不限制</Radio>
                                    <Radio value={2}>限制</Radio>
                                </RadioGroup>
                            )}
                        </Form.Item>
                        <Form.Item {...col} label="张数">
                            {getFieldDecorator('maxnumber', {
                                initialValue: this.state.data.salescouponsApi.maxnumber,
                                rules: [
                                    { validator: this.checkmaxnumber.bind(this) },
                                ],
                            })(<InputNumber precision={0.1} disabled={this.state.disabled || this.props.form.getFieldValue('limitsymbol')==1} style={{ width: '96%' }} style={{ width: '96%' }} placeholder="请输入张数" />)}
                        </Form.Item>
                    </Form>
                    {(this.state.disabled==true && this.state.data.salescouponsApi.limitsymbol==2?(<Form className="searchForm cForm wd_33 pt0 mb20">
                        <Form.Item {...col} label="库存增减">
                            {getFieldDecorator('stockIncOrDec', {
                                initialValue: 0,
                            })(
                                <RadioGroup onChange={this.onChangeRa}>
                                    <Radio value={0}>增</Radio>
                                    <Radio value={1}>减</Radio>
                                </RadioGroup>
                            )}
                        </Form.Item>
                        <Form.Item {...col} label="库存增减数">
                            {getFieldDecorator('updatemaxnumber', {
                                initialValue: 0,
                                rules: [{
                                    validator: this.checkupdatemaxnumber
                                }],
                            })(<InputNumber precision={0} min={0} style={{ width: '96%' }} placeholder="库存增减数" />)}
                        </Form.Item>
                    </Form>):null)}
                </div>
                <div className={this.state.data.salescouponsApi.usescope != 1 ? '' : 'none'}>
                    <h2>使用规则</h2>
                    <Form className="searchForm cForm wd_33 mt20 mb20">
                        <Form.Item {...col} label="是否与其他优惠共享">
                            {getFieldDecorator('share', {
                                initialValue: this.state.data.salescouponsApi.share,
                                rules: [{
                                    required: true
                                }]
                            })(
                                <RadioGroup disabled={this.state.disabled}>
                                    <Radio value={1}>是</Radio>
                                    <Radio value={0}>否</Radio>
                                </RadioGroup>
                            )}
                        </Form.Item>
                        <Form.Item {...col} label="绑定规则">
                            {getFieldDecorator('type', {
                                initialValue: this.state.data.salescouponsApi.type + '',
                                rules: [{
                                    required: true,
                                }]
                            })(
                                <Select disabled={this.state.disabled} style={{ width: '96%' }}>
                                    <Option value="0">不绑定商品</Option>
                                    {/* <Option value="1">按商品分类绑定</Option> */}
                                    <Option value="2">按商品绑定</Option>
                                    {/* <Option disabled={this.props.form.getFieldValue('shopId') == 14 ? false : true} value="3">按产品组绑定</Option> */}
                                    <Option disabled={this.props.form.getFieldValue('shopId') == 20 ? false : true} value="4">按门店绑定</Option>
                                    <Option disabled={this.props.form.getFieldValue('shopId') == 20 ? false : true} value="5">按门店商品绑定</Option>
                                </Select>
                            )}
                        </Form.Item>
                    </Form>
                </div>
                <div className={this.state.data.salescouponsApi.usescope == 1 || (this.props.form.getFieldValue('type') == 4 || this.props.form.getFieldValue('type') == 5) ? '' : 'none'}>
                    <h2>绑定门店</h2>
                    <Form className="searchForm cForm wd_33 mt20 mb20">
                        <Form.Item {...col} label="门店" className={this.props.form.getFieldValue('type') == 5 ? '' : 'none'}>
                            {
                                getFieldDecorator('storeids', {
                                    initialValue: this.state.data.salescouponsApi.storeids,
                                })(
                                    <Select disabled={this.state.disabled} showSearch filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0} onChange={(v) => this.mdChange(v)}>
                                        <Option value="">请选择门店</Option>
                                        {mdselect}
                                    </Select>
                                )
                            }
                        </Form.Item>
                        <Form.Item {...col} label="门店" className={this.props.form.getFieldValue('type') != 5 ? '' : 'none'}>
                            {
                                getFieldDecorator('morestoreids', {
                                    initialValue: this.state.morestoreids,
                                })(
                                    <Select disabled={this.state.disabled} multiple showSearch filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0} placeholder="请选择门店" style={{ width: "630px" }}>
                                        {mdselect}
                                    </Select>
                                )
                            }
                        </Form.Item>
                    </Form>
                </div>
                <div className={this.props.form.getFieldValue('type') == 2 || this.props.form.getFieldValue('type') == 5 ? '' : 'none'}>
                    <h2 style={{ margin: "10px 0" }}>绑定商品
                    <Button className={this.state.disabled ? 'none' : ''} style={{ marginLeft: "10px" }} type="primary" onClick={this.addsp.bind(this)}>添加</Button></h2>
                    <Table rowKey="code" pagination={false} columns={spcolumns} dataSource={this.state.sptable} />
                </div>
                <div className="mt20">
                    <Button type="primary" onClick={this.submitHandler.bind(this)}>保存方案</Button>
                    {/* <Button style={{ marginLeft: 8 }} onClick={this.wechatStyle.bind(this)}>微信样式</Button> */}
                    <Button style={{ marginLeft: 8 }} onClick={this.back}>取消</Button>
                </div>

                <Modal
                    width="800px"
                    title="选择商品"
                    visible={this.state.spvisible}
                    onCancel={this.hideProductPop.bind(this)}
                    onOk={this.setSelectPros.bind(this)}
                >
                    <Form
                        className="searchForm cForm pt20 wd_50 mb20"
                    >
                        <Form.Item {...formItemLayout} label="商品名称">
                            {getFieldDecorator('nameLike', { initialValue: '' })(<Input style={{ width: '92%' }} placeholder="请输入商品名称" />)}
                        </Form.Item>
                        <Form.Item {...formItemLayout} label="商品编号">
                            {getFieldDecorator('goodscode', { initialValue: '' })(<Input style={{ width: '92%' }} placeholder="请输入商品编码" />)}
                        </Form.Item>
                        <Form.Item {...formItemLayout} label="物料编码">
                            {getFieldDecorator('materialNumber', { initialValue: '' })(<Input style={{ width: '92%' }} placeholder="请输入物料编码" />)}
                        </Form.Item>
                        <Button style={{ marginLeft: '80px' }} type="primary" onClick={this.searchProBtn.bind(this)}>查询</Button>
                    </Form>

                    <Table
                        loading={this.state.proLoading}
                        rowSelection={spSelection}
                        columns={proCol}
                        dataSource={this.state.proData}
                        rowKey={record => record.id}
                        pagination={spagination}
                    />
                </Modal>
                <Modal
                    width="800px"
                    title="编辑样式"
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
                    <div style={{ width: '464px', minHeight: '473px', display: 'inline-block', borderRadius: '5px', paddingTop: '20px' }} className='searchForm mForm cModal'>
                        <Form.Item {...formItemLayout} label="商户名称">
                            联想4S生活店
                        </Form.Item>
                        <Form.Item {...formItemLayout} label="卡券颜色">
                            {getFieldDecorator('ccolor', {
                                initialValue: this.state.stylebgCK,
                                rules: [{
                                    required: true
                                }]
                            })(<RadioGroup style={{ width: '340px' }} onChange={(v) => this.cchange(v.target.value)}>
                                {coselect}
                            </RadioGroup>)}
                        </Form.Item>
                        {/* <Form.Item {...formItemLayout} label="卡券颜色">
                            <div id="cclolor" className="ant-radio-group ant-radio-group-large"><span className="ant-radio-button-wrapper" style={{ background: this.state.stylebg }}></span></div>
                        </Form.Item> */}
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
            // this.props.form.setFields({'':{value:e}})
            // this.props.form.setFields({'':{value:e}})
        }
        if(selarr.length==1 && selarr[0]==4){
            this.setState({selwechat:true})
        }
      }
    onChangeRa=(e)=>{
        console.log('e.target.value',e.target.value)
        if(e.target.value==0){
            let n=100000000-this.props.form.getFieldValue('maxnumber')
            this.setState({maymaxnum:n})
        }else{
            let n=this.props.form.getFieldValue('maxnumber')
            this.setState({maymaxnum:n})
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
    // 校验
    checkintervaldate = (rule, value, callback) => {
        if (this.props.form.getFieldValue('gettype') == 1) {
            if (value < 1) {
                callback('当天生效的有效天数最少为1天');
            } else {
                callback();
            }
        } else {
            callback();
        }
    }
    checkmaxnumber(rule, value, callback) {
        if (value > 100000000) {
            callback('张数不能大于100000000张');
        } else if (parseInt(value) < 0) {
            callback('张数不能小于0张');
        } else {
            callback();
        }
    }
    checktime = (rule, value, callback) => {
        let now = Date.parse(new Date()) - 300000;
        if (now > Date.parse(value)) {
            if (!this.state.disabled) {
                callback('此时间必须大于当前时间');
            } else {
                callback();
            }
        } else {
            callback();
        }
    }
    checktotime = (rule, value, callback) => {
        if (Date.parse(this.props.form.getFieldValue('fromtime')) > Date.parse(value)) {
            callback('此时间必须大于有效期开始时间');
        } else if (Date.parse(this.state.data.salescouponsApi.totime) > Date.parse(value)) {
            callback('该时间只能往后延期');
        } else {
            callback();
        }
    }
    checkstarttime=(rule,value,callback)=>{
        let now =  Date.parse(new Date())-300000;
        if(!this.state.disabled){
            if(now>Date.parse(value)) {
                callback('此时间必须大于当前时间');
            }else if(Date.parse(value)>this.props.form.getFieldValue('totime')){
                callback('此时间必须小于有效期结束时间');
            }else{
                callback();
            }
        }else {
            callback();
        }
    }
    checkendtime = (rule, value, callback) => {
        if(!this.state.disabled){
            if (Date.parse(this.props.form.getFieldValue('getstarttime')) > Date.parse(value)) {
                callback('此时间必须大于领取开始时间');
            } else if (Date.parse(this.state.data.salescouponsApi.getendtime) > Date.parse(value)) {
                callback('该时间只能往后延期');
            } else {
                callback();
            }
        }else{
            callback();
        }
        
    }
    checkupdatemaxnumber=(rule, value, callback)=>{
        if(value ||value==0){
            if(value<0){
                callback('请输入正整数')
            }else{
                if(this.props.form.getFieldValue('stockIncOrDec') == 0){
                    if(this.props.form.getFieldValue('updatemaxnumber')>this.state.maymaxnum){
                        this.props.form.setFields({'updatemaxnumber':{value:this.state.maymaxnum}})  
                    }
                    callback()
                }
                if(this.props.form.getFieldValue('stockIncOrDec')==1){
                    if(this.props.form.getFieldValue('updatemaxnumber')>this.state.maymaxnum){
                        this.props.form.setFields({'updatemaxnumber':{value:this.state.maymaxnum}})
                    }
                    callback()
                }
            }
        }else{
            callback('请输入库存增减')
        }
       
    }

    recheck=()=>{
        const minorderamount=this.props.form.getFieldValue('minorderamount')
        const amount = this.props.form.getFieldValue('amount')
        if(minorderamount>amount && amount>0){
            this.props.form.setFields({'minorderamount':{value:minorderamount}})
            this.props.form.setFields({'amount':{value:amount}})
        }
    }

    checkamount = (rule, value, callback) => {
        const form = this.props.form;
        if(value ||value==0){
            if(form.getFieldValue('usescope') == 4){
                if (parseFloat(value) < 1) {
                    callback('折扣券最高为1折');
                } else if (parseFloat(value) > 9.9) {
                    callback('折扣券低最为9.9折');
                } else {
                    callback();
                }
            }else if(form.getFieldValue('usescope') == 2){
                if(value<0.01){
                    callback('最低优惠金额为0.01')
                }else{
                    if(Number(value)>=Number(form.getFieldValue('minorderamount'))&&form.getFieldValue('minorderamount')!=0){
                        console.log('form.getFieldValue',typeof form.getFieldValue('minorderamount'))
                        callback('优惠券金额必须小于最低使用限额')
                    }else{
                        callback()
                    }
                }
            }else{
                callback()
            }
        }else{
            callback('请输入优惠券金额')
        }
        
    }
    checkminorderamount = (rule, value, callback) => {
        const form = this.props.form;
        if(value ||value==0){
            if(value>=0){
                if (form.getFieldValue('usescope') == 2||form.getFieldValue('usescope') == 3) {
                    if(Number(value)<=Number(form.getFieldValue('amount'))&&form.getFieldValue('minorderamount')!=0){
                        console.log('form.getFieldValue',typeof form.getFieldValue('minorderamount'))
                        callback('优惠券金额必须小于最低使用限额')
                    }else{
                        callback()
                    }
                } else {
                    callback();
                }
            }else{
                callback('最低使用限额必须大于等于0')
            }
        }else{
            callback('请输入有效使用最低限额')
        }  
    }
  
    shopchange=(v)=> {
        this.props.form.setFields({ 'type': { value: "0" } });
        this.getConfiguration(v)
    }
    totimeChange(v) {
        if (this.props.form.getFieldValue('terminal').indexOf('4') > -1 && this.props.form.getFieldValue('iscanget') == 1) {
            this.props.form.setFields({ 'getendtime': { value: moment(v) } });
        }
    }
    fromtimeChange(v) {
        if (this.props.form.getFieldValue('terminal').indexOf('4') > -1 && this.props.form.getFieldValue('iscanget') == 1) {
            this.props.form.setFields({ 'getstarttime': { value: moment(v) } });
        }
    }
    icchange(v) {
        if (this.props.form.getFieldValue('terminal').indexOf('4') > -1) {
            if (v == 1) {
                this.props.form.setFields({ 'getstarttime': { value: "" }, 'getendtime': { value: moment(this.props.form.getFieldValue('totime')) } })
            } else {
                this.props.form.setFields({ 'getstarttime': { value: "" }, 'getendtime': { value: "" } })
            }
        } else {
            this.props.form.setFields({ 'getstarttime': { value: "" }, 'getendtime': { value: "" } })
        }
    }
    lmchange(v) {
        if (v.target.value == 1) {
            this.props.form.setFields({ 'maxnumber': { value: '100000000'} })
        } else {
            this.props.form.setFields({ 'maxnumber': { value: this.state.data.salescouponsApi.maxnumber } })
        }
    }

    getEditItem = (id) => {

    };
    // 打开微信样式
    wechatStyle() {
        this.setState({ ysvisible: true })
    }
    cchange(v) {
        this.setState({ stylebg: this.ckey(v) })
    }
    ckey(v) {
        for (var { key: k, value: c } of this.state.colorlist) {
            if (k == v) {
                return c;
            }
        }
    }
    savestyle() {
        this.setState({ ysvisible: false, stylebgCK: this.props.form.getFieldValue('ccolor') })
    }
    hidestyle() {
        this.props.form.setFields({ 'ccolor': { value: this.state.stylebgCK } });
        this.setState({ ysvisible: false, stylebg: this.ckey(this.state.stylebgCK) })
    }
    //改变门店
    mdChange(v) {
        if (this.props.form.getFieldValue('type') == "5") {
            this.searchPro(this.state.spcurrent);
            this.state.sptable = [];
        } else {
            console.log(v)
        }
    }
    //门店名称获取
    mdName() {
        let name, morestoreids = this.props.form.getFieldValue('morestoreids');
        if (this.props.form.getFieldValue('type') == 5) {
            name = "";
            this.state.storefront.forEach(c => {
                if (c.storeID == this.props.form.getFieldValue('storeids')) {
                    name = c.storeName;
                }
            })
        } else if (this.state.data.salescouponsApi.usescope == 1 || this.props.form.getFieldValue('type') == 4) {
            name = [];
            this.state.storefront.forEach(c => {
                for (var i = 0; i < morestoreids.length; i++) {
                    if (c.storeID == morestoreids[i]) {
                        name.push(c.storeName);
                    }
                }
            })
        }
        return name;
    }

    //商品分类
    // addfl() {
    //     this.setState({ flvisible: true })
    //     this.props.form.setFields({ 'pl': { value: ["kkkk"] } })
    // }
    // flModalOk() {

    // }
    // flModalhide() {
    //     this.setState({ flvisible: false });
    // }
    //商品
    searchProBtn() {
        this.setState({ spcurrent: 1 });
        this.searchPro(1);
    }
    searchPro = (page) => {
        // this.props.form.validateFields((err, values) => {
        //     console.log(values)
        let storeid = ""
        if (this.props.form.getFieldValue('type') == "5") {
            storeid = this.props.form.getFieldValue('storeids')
        }
        request(`${couponapi}salesCouponOpenApi/getGoodsinfoPageInfo.jhtm?shopid=${this.props.form.getFieldValue('shopId')}&nameLike=${this.props.form.getFieldValue('nameLike') || ''}&goodscode=${this.props.form.getFieldValue('goodscode') || ''}&materialNumber=${this.props.form.getFieldValue('materialNumber') || ''}&page=${page}&rows=10&storeid=${storeid}`, {
            method: 'GET',
        }).then((res) => {
            this.setState({ proData: res.data.rows, sptotal: res.data.total })
        });
        // })
    }
    addsp() {
        if (this.props.form.getFieldValue('storeids') || this.props.form.getFieldValue('type') == 2) {
            this.setState({ spvisible: true });
            this.searchProBtn();
        } else {
            base.openNotification('error', "请选择门店");
        }
    }
    setSelectPros() {
        let ids = this.state.sptable.map(c => { return c.id });
        this.state.sptablecheck.filter(c => {
            if (ids.indexOf(c.id) < 0) {
                this.state.sptable.push(c)
            }
        })
        this.setState({ spvisible: false, sptable: this.state.sptable });
    }

    search() {

    }
    hideProductPop() {
        this.setState({ spvisible: false })
    }
    delCkItem(v) {
        this.state.sptable.splice(v, 1);
        this.setState({ sptable: this.state.sptable })
    }
    //保存
    submitHandler = (e) => {
        if (this.props.form.getFieldValue('terminal').indexOf('4') > -1) {
            if (!this.state.disabled) {
                this.props.form.setFields({ 'getstarttime': { value: moment(Date.parse(new Date()) + 5000) } });
            }
            this.props.form.setFields({ 'getendtime': { value: moment(this.props.form.getFieldValue('totime')) } });
        }
        this.props.form.validateFields((err, values) => {
            console.log('stockIncOrDec',values.stockIncOrDec)
            console.log('values.usescope',err)
            if (!err) {
                let name = this.mdName();
                let param = {
                    id: this.state.id,
                    shopid: values.shopId || '',
                    terminal: values.terminal.toString() || '',
                    limitsymbol: values.limitsymbol || '',
                    usescope: values.usescope || '',
                    name: values.name.trim() || '',
                    amount: values.usescope==1?'0.00':values.amount,
                    couponway: values.couponway || '',
                    description: values.description || '',
                    fromtime: values.fromtime.format('YYYY-MM-DD H:mm:ss'),
                    totime: values.totime.format('YYYY-MM-DD H:mm:ss'),
                    getstarttime: values.getstarttime ? values.getstarttime.format('YYYY-MM-DD H:mm:ss') : "",
                    getendtime: values.getendtime ? values.getendtime.format('YYYY-MM-DD H:mm:ss') : "",
                    iscanget: values.iscanget,
                    totalnumber: values.totalnumber || '1',
                    maxnumber: values.maxnumber,
                    minorderamount: values.minorderamount,
                    persongetmaxtimes: values.persongetmaxtimes || '1',
                    intervaldate: values.intervaldate,
                    share: values.share,
                    type: values.type,
                    style: 1,
                    conditions: 1,
                    createSource: 0,
                    superposition: 0,
                    storenames: name ? name.toString() : '',
                    status: this.state.data.salescouponsApi.status,
                    materialcodes: this.state.sptable ? this.state.sptable.map(c => { return c.materialNumber }).toString() : [],
                    goodcodes: this.state.sptable ? this.state.sptable.map(c => { return c.code }).toString() : [],
                    goodname: this.state.sptable ? this.state.sptable.map(c => { return c.name }).toString() : [],
                    gettype: values.gettype || '',
                    // goods : this.state.sptable,
                };
                if (values.type != 5) {
                    param.storeids = values.morestoreids.toString() || '';
                } else {
                    param.storeids = values.storeids || '';
                }
                if (values.usescope == 1 || (values.type == 4 || values.type == 5)) {
                    if (param.storeids.length == 0) {
                        base.openNotification('error', "请选择门店");
                        return false
                    }
                }
                if (values.type == 2 || values.type == 5) {
                    if (this.state.sptable.length == 0) {
                        base.openNotification('error', "请绑定商品");
                        return false
                    }
                }
                let data = `salescouponsApi=${JSON.stringify(param)}&stockIncOrDec=${values.stockIncOrDec}&updatemaxnumber=${values.updatemaxnumber}&color=${this.state.stylebgCK}`;
                console.log(data)
                request(`${couponapi}salesCouponOpenApi/salescoupon/edit.jhtm`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' },
                        body: data
                    }).then((res) => {
                        if (res.data.code === '200') {
                            location.hash = '/coupon/list';
                            base.openNotification('success', res.data.msg)
                            // this.setState({ data: res.data.data.datas, total: res.data.data.totalCount });
                        } else {
                            base.openNotification('error', res.data.msg);
                        }
                    });
            }
        });
    };

    getCode = (record) => {
        return (
            <span>{record.code || record.gcode}</span>
        )
    };

    handleReset = () => {
        this.props.form.resetFields();
    };
    back = () => {
        history.go(-1)
    }
    checkTerminal = (checkedValues) => {
        if (checkedValues.indexOf('4') > -1) {
            this.setState({ selwechat: true })
            this.props.form.setFields({ 'iscanget': { value: 1 }});
        } else {
            this.setState({ selwechat: false })
        }
    };

}

const CouponEdit = Form.create()(formWrapper);
export default CouponEdit;
