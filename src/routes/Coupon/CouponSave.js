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
const TreeNode = Tree.TreeNode;
const { TextArea } = Input;
const pageSize = 10;
const formItemLayout = {
    labelCol: { span: 5 },
    wrapperCol: { span: 19 },
};

class formWrapper extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
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
            bindtype:[],
            useScopecheck: 2,
            proLoading: false,
            sptotal: 0,
            spcurrent: 1,
            precision:2,
            min:0.01,
            minamount:0.00,
            shopId:'',
            shopName:''
        };
    };

    componentDidMount() {
        const shopid= window.loginInfo.rCode
        this.setState({
            shopId:shopid
        })
        request(`${domain}pcsd-nrwms-service/Storefront/GetAll`, {
            method: 'GET',
        }).then((res) => {
            if (res.data.code == 200) {
                this.setState({ storefront: res.data.data || [] });
            } else {
                base.openNotification('error', '查询门店失败，请稍后重试!')
            }
        });
        // request(`${couponapi}pagePropertiesOpenApi/getShopIds.jhtm`, {
        //     method: 'GET',
        // }).then((res) => {
        //     if (res.data.code == 200) {
        //         this.setState({ shops: res.data.data || [] });
        //     } else {
        //         base.openNotification('error', res.data.msg)
        //     }
        // });
        this.tranShopName(shopid)
        this.getConfiguration(shopid);
        this.getWechatStyle(shopid);
        const { params } = this.props;

        if (params.id == null) {

        } else {
            this.getEditItem(params.id);
        }
    }
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
        const col = {
            labelCol: { span: 8},
            wrapperCol: { span: 16}
        };
        const spcolumns = [
            { title: '商品名称', dataIndex: 'name' },
            { title: '物料编码', dataIndex: 'materialNumber' },
            { title: '商品编码', render: (text, record) => { return this.getCode(record) } },
            { title: '操作', render: (text, record, index) => { return (<span onClick={() => this.delCkItem(index)}><a>删除</a></span>) } }
        ];
        const proCol = [
            { title: '商品名称', dataIndex: 'name' },
            { title: '物料编码', dataIndex: 'materialNumber' },
            { title: '商品编码', dataIndex: 'code' },
            { title: '上架状态', dataIndex: 'marketable', render: (text) => { return text == 1 ? "已上架" : "未上架" } },
        ];
        const { getFieldDecorator } = this.props.form;

        const terminalOpts = [
            { label: 'PC', value: '1' },
            { label: 'WAP', value: '2' },
            { label: 'APP', value: '3' },
            { label: 'Wechat', value: '4' },
        ];

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
        const btselect = base.tlist(this.state.bindtype);
        const coselect = this.state.colorlist.map((d, index) => {
            const key = d.key + '', value = d.value;
            return <Radio.Button key={key} value={key} style={{ background: value }}></Radio.Button>
        });
        let disabled = true;
        if(this.props.form.getFieldValue('fromtime') && this.props.form.getFieldValue('totime')){
           disabled = false;
        }
        return (
            <div>
                <h2>基础信息</h2>
                <Form className="searchForm cForm w_33 wd_100 mt20 mb20 pr0 fleft">
                    <Form.Item {...col} label="优惠券名称">
                        {getFieldDecorator('name', {
                            initialValue: '',
                            rules: [{
                                required: true,
                                whitespace: true,
                                message: '请输入优惠券名称'
                            }]
                        })(<Input style={{ width: '96%' }} maxLength="9" placeholder="请输入优惠券名称" />)}
                    </Form.Item>
                    <Form.Item {...col} label="有效时间限制">
                        {getFieldDecorator('gettype', {
                            initialValue: '0',
                            rules: [{
                                required: true,
                            }]
                        })(
                            <Select style={{ width: '96%' }} onChange={this.gtchange}>
                                {gtselect}
                            </Select>
                        )}
                    </Form.Item>
                    <Form.Item {...col} label="领取后有效的天数">
                        {getFieldDecorator('intervaldate', {
                            initialValue: 0,
                            rules: [{
                                required: true,
                            }, { validator: this.checkintervaldate }]
                        })(
                            <InputNumber disabled={this.props.form.getFieldValue('gettype') == 0} style={{ width: '96%' }} min={0} max={365} />
                        )}
                    </Form.Item>
                    <Form.Item {...col} label="优惠券类型">
                        {getFieldDecorator('usescope', {
                            initialValue: '2',
                            rules: [{
                                required: true,
                            }]
                        })(
                            <Select style={{ width: '96%' }} onChange={this.uschange}>
                                {usselect}
                            </Select>
                        )}
                    </Form.Item>
                </Form>
                <Form className="searchForm cForm w_66 wd_50 mt20 mb20 pl0 fleft">
                    <Form.Item {...col} label="选择商城">
                        {getFieldDecorator('shopId', {
                            initialValue: this.state.shopId
                        })(
                            <span>{this.state.shopName}</span>)}
                    </Form.Item>
                    <Form.Item {...col} label="推广平台">
                        {getFieldDecorator('terminal', {
                            initialValue: ["1"],
                            rules: [{
                                required: true,
                                message: '请选择推广平台'
                            }]
                        })(
                            <CheckboxGroup className="w250" options={this.state.terminal} onChange={this.checkTerminal} />
                        )}
                    </Form.Item>
                    <Form.Item {...col} label="有效期开始">
                        {getFieldDecorator('fromtime', {
                            initialValue: "",
                            rules: [{
                                required: true,
                                message: '请输入有效期开始时间'
                            }, { validator: this.checktime }]
                        })(<DatePicker style={{ width: '96%' }} showTime={{ format: 'HH:mm:ss' }} format="YYYY-MM-DD HH:mm:ss" />)}
                    </Form.Item>
                    <Form.Item {...col} label="有效期结束">
                        {getFieldDecorator('totime', {
                            initialValue: "",
                            rules: [{
                                required: true,
                                message: '请输入有效期结束时间'
                            }, { validator: this.checktotime }]
                        })(<DatePicker onChange={(v) => this.totimeChange(v)} style={{ width: '96%' }} showTime={{ format: 'HH:mm:ss' }} format="YYYY-MM-DD HH:mm:ss" />)}
                    </Form.Item>
                    <Form.Item {...col} label="规则描述">
                        {getFieldDecorator('description', {
                            initialValue: '',
                            rules: [{
                                required: true,
                                whitespace: true,
                                message: '请输入规则描述'
                            }]
                        })(<TextArea rows={4} style={{ width: '96%',resize:'none'  }} placeholder="请输入规则描述" />)}
                    </Form.Item>
                    {(this.state.selwechat?(
                         <Form.Item {...col} label="微信样式">
                         {getFieldDecorator('isdefaultWechat', {
                             initialValue: 0,
                             rules: [{
                                 required: true
                             }]
                         })(
                             <RadioGroup className="w250" onChange={this.wschange.bind(this)} >
                                 <Radio value={0}>默认</Radio>
                                 <Radio value={1}>自定义</Radio>
                                 <Button onClick={this.wechatStyle.bind(this)}>编辑样式</Button>
                             </RadioGroup>
                         )}
                     </Form.Item>
                    ):null)}
                </Form>
                <div style={{ clear: 'both' }}></div>
                <div className={this.state.useScopecheck != 1 ? '' : 'none'}>
                    <h2>金额设置</h2>
                    <Form className="searchForm cForm wd_33 mt20 mb20">
                        <Form.Item {...col} label="优惠券金额">
                            {getFieldDecorator('amount', {
                                initialValue: this.props.form.getFieldValue('usescope') == 4 ? '1.00' : '0.01',
                                rules: [{
                                    required: this.props.form.getFieldValue('usescope') != 1 ? true : false,
                                    validator: this.checkamount
                                }]
                            })(<InputNumber precision={this.state.precision} min={this.state.min} style={{ width: '96%' }} pla ceholder="请输入优惠券金额" onBlur={this.recheck} />)}
                        </Form.Item>
                        <Form.Item {...col} label="使用最低限额">
                            {getFieldDecorator('minorderamount', {
                                initialValue: this.props.form.getFieldValue('usescope') == 3 ? '1.00' : '0.00',
                                rules: [
                                    { validator: this.checkminorderamount },
                                ],
                            })(<InputNumber precision={this.state.precision} min={this.state.minamount} style={{ width: '96%' }} placeholder="请输入使用最低限额" oonBlur={this.recheck}/>)}
                        </Form.Item>
                    </Form>
                </div>
                <div className={this.state.useScopecheck != '' ? '' : 'none'}>
                    <h2>领券规则</h2>
                    <Form className="searchForm cForm wd_33 mt20">
                        <Form.Item {...col} label="领取方式">
                            {getFieldDecorator('couponway', {
                                initialValue: '0',
                                rules: [{
                                    required: true,
                                }]
                            })(
                                <Select style={{ width: '96%' }}>
                                    {cwselect}
                                </Select>
                            )}
                        </Form.Item>
                    </Form>
                    <Form className="searchForm cForm wd_33 pt0">
                        <Form.Item {...col} label="是否可以领取">
                            {getFieldDecorator('iscanget', {
                                initialValue: 0,
                                rules: [{
                                    required: true
                                }]
                            })(
                                <RadioGroup name="iscanget" onChange={(v) => this.icchange(v.target.value)}>
                                    <Radio value={1} disabled={disabled}>是</Radio>
                                    <Radio value={0} disabled={disabled}>否</Radio>
                                </RadioGroup>
                            )}
                        </Form.Item>
                        <Form.Item {...col} label="领取开始时间">
                            {getFieldDecorator('getstarttime', {
                                initialValue: "",
                                rules: [{
                                    required: this.props.form.getFieldValue('iscanget') == 1 ? true : false,
                                    message: '请输入领取开始时间'
                                }, { validator: this.checkstarttime }]
                            })(<DatePicker disabled={this.props.form.getFieldValue('iscanget') == 0 || this.state.selwechat ? true : false} style={{ width: '96%' }} showTime={{ format: 'HH:mm:ss' }} format="YYYY-MM-DD HH:mm:ss" />)}
                        </Form.Item>
                        <Form.Item {...col} label="领取结束时间">
                            {getFieldDecorator('getendtime', {
                                initialValue: "",
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
                                initialValue: 1,
                                rules: [{
                                    required: true
                                }]
                            })(
                                <RadioGroup onChange={this.lmchange.bind(this)}>
                                    <Radio value={1}>不限制</Radio>
                                    <Radio value={2}>限制</Radio>
                                </RadioGroup>
                            )}
                        </Form.Item>
                        <Form.Item {...col} label="张数">
                            {getFieldDecorator('maxnumber', {
                                initialValue: "100000000",
                                rules: [
                                    { validator: this.checkmaxnumber },
                                ],
                            })(<InputNumber min={1} max={100000000} precision={0.1} disabled={this.props.form.getFieldValue('limitsymbol') == 2 ? false : true} style={{ width: '96%' }} placeholder="请输入张数" />)}
                        </Form.Item>
                    </Form>
                </div>
                <div className={this.state.useScopecheck != 1 ? '' : 'none'}>
                    <h2>使用规则</h2>
                    <Form className="searchForm cForm wd_33 mt20 mb20">
                        <Form.Item {...col} label="是否与其他优惠共享">
                            {getFieldDecorator('share', {
                                initialValue: 0,
                                rules: [{
                                    required: true
                                }]
                            })(
                                <RadioGroup name="share">
                                    <Radio value={1}>是</Radio>
                                    <Radio value={0}>否</Radio>
                                </RadioGroup>
                            )}
                        </Form.Item>
                        <Form.Item {...col} label="绑定规则">
                            {getFieldDecorator('type', {
                                initialValue: "0",
                                rules: [{
                                    required: true,
                                }]
                            })(
                                <Select style={{ width: '96%' }}>
                                   {btselect}
                                </Select>
                            )}
                        </Form.Item>
                    </Form>
                </div>
                <div className={this.state.useScopecheck == 1 || (this.props.form.getFieldValue('type') == 4 || this.props.form.getFieldValue('type') == 5) ? '' : 'none'}>
                    <h2>绑定门店</h2>
                    <Form className="searchForm cForm wd_33 mt20 mb20">
                        <Form.Item {...col} label="门店" className={this.props.form.getFieldValue('type') == 5 ? '' : 'none'}>
                            {
                                getFieldDecorator('storeids', {
                                    initialValue: ""
                                })(
                                    <Select showSearch filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0} onChange={(v) => this.mdChange(v)}>
                                        <Option value="">请选择门店</Option>
                                        {mdselect}
                                    </Select>
                                )
                            }
                        </Form.Item>
                        <Form.Item {...col} label="门店" className={this.props.form.getFieldValue('type') != 5 ? '' : 'none'}>
                            {
                                getFieldDecorator('morestoreids', {
                                    initialValue: []
                                })(
                                    <Select multiple showSearch filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0} placeholder="请选择门店" style={{ width: "630px" }}>
                                        {mdselect}
                                    </Select>
                                )
                            }
                        </Form.Item>
                    </Form>
                </div>
                <div className={this.props.form.getFieldValue('type') == 2 || this.props.form.getFieldValue('type') == 5 ? '' : 'none'}>
                    <h2 style={{ margin: "10px 0" }}>绑定商品
                    <Button style={{ marginLeft: "10px" }} type="primary" onClick={this.addsp.bind(this)}>添加</Button></h2>
                    <Table rowKey="code" pagination={false} columns={spcolumns} dataSource={this.state.sptable} />
                </div>
                <div className="mt20">
                    <Button type="primary" onClick={this.submitHandler.bind(this)}>保存方案</Button>
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
                    title="编辑微信样式"
                    closable={false}
                    maskClosable={false}
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
                                    <span style={{ width: '143px', display: 'inline-block' }}><span>{this.props.form.getFieldValue('fromtime') ? moment(this.props.form.getFieldValue('fromtime')).format('YYYY-MM-DD HH:mm:ss') : ''}</span> ~ <span>{this.props.form.getFieldValue('totime') ? moment(this.props.form.getFieldValue('totime')).format('YYYY-MM-DD HH:mm:ss') : ''}</span></span>
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
                                initialValue: 'Color100',
                                rules: [{
                                    required: true
                                }]
                            })(<RadioGroup disabled={this.props.form.getFieldValue('isdefaultWechat') == 0} style={{ width: '340px' }} onChange={(v) => this.cchange(v.target.value)}>
                                {coselect}
                            </RadioGroup>)}
                        </Form.Item>
                        <Form.Item {...formItemLayout} label="有效时间">
                            <span style={{ width: '143px', display: 'inline-block' }}><span>{this.props.form.getFieldValue('fromtime') ? moment(this.props.form.getFieldValue('fromtime')).format('YYYY-MM-DD HH:mm:ss') : ''}</span> ~ <span>{this.props.form.getFieldValue('totime') ? moment(this.props.form.getFieldValue('totime')).format('YYYY-MM-DD HH:mm:ss') : ''}</span></span>
                        </Form.Item>
                        <Form.Item {...formItemLayout} label="可用时段">
                            全部时段
                        </Form.Item>
                        <Form.Item {...formItemLayout} label="优惠券说明">
                        </Form.Item>
                        <Form.Item {...formItemLayout} label="使用须知">
                            <span>{this.props.form.getFieldValue('description')}</span>
                        </Form.Item>
                    </div>
                </Modal>
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
    getWechatStyle(shopid) {
        request(`${couponapi}pagePropertiesOpenApi/getWechatStyle.jhtm?shopid=${shopid}`, {
            method: 'GET',
        }).then((res) => {
            if (res.data.code == 200) {
                this.setState({ wechatData: res.data.data || {}, stylebgCK: res.data.data.color, stylebg: this.ckey(res.data.data.color) });
            } else {
                base.openNotification('error', res.data.msg)
            }
        });
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
    checkmaxnumber = (rule, value, callback) => {
        if (parseInt(value) > 100000000) {
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
            callback('此时间必须大于当前时间');
        } else {
            callback();
            if(this.state.selwechat){
                this.props.form.setFields({'getstarttime':{value:value}});
            }  
        }
    }
    checktotime = (rule, value, callback) => {
        let now = Date.parse(new Date()) - 300000;
        if (now > Date.parse(value)) {
            callback('此时间必须在当前时间之后');
        } else if (Date.parse(this.props.form.getFieldValue('fromtime')) > Date.parse(value)) {
            callback('此时间必须大于有效期开始时间');
        } else {
            callback();
            if(this.state.selwechat){
                this.props.form.setFields({'getendtime':{value:value}});
            }  
        }
    }
    checkstarttime=(rule,value,callback)=>{
        let now =  Date.parse(new Date())-300000;
        if(now>Date.parse(value)) {
            callback('此时间必须大于当前时间');
        }else if(Date.parse(value)>this.props.form.getFieldValue('totime')){
            callback('此时间必须小于有效期结束时间');
        }else {
            callback();
        }
    }
    checkendtime = (rule, value, callback) => {
        let now = Date.parse(new Date()) - 300000;
        if (now > Date.parse(value)) {
            callback('此时间必须在当前时间之后');
        } else if (Date.parse(this.props.form.getFieldValue('getstarttime')) > Date.parse(value)) {
            callback('此时间必须大于领取开始时间');
        } else {
            callback();
        }
    }
    recheck=()=>{
        const minorderamount=this.props.form.getFieldValue('minorderamount')
        const amount = this.props.form.getFieldValue('amount')
        console.log('111111111')
        if(minorderamount>=amount && amount>0){
            console.log('222222222')
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
            }else{
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
            }
        } else{
            callback('请输入优惠券金额')
        }
       
    }
    checkminorderamount = (rule, value, callback) => {
        const form = this.props.form;
        if(value || value==0){
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
            callback('请输入使用最低限额')
        }
        
    }
    shopchange=(v)=> {
        console.log('vvvv',v)
        this.props.form.setFields({ 'type': { value: "0" } });
        this.getConfiguration(v);
    }
    totimeChange(v) {
        if (this.props.form.getFieldValue('terminal').indexOf('4') > -1 && this.props.form.getFieldValue('iscanget') == 1) {
            this.props.form.setFields({ 'getendtime': { value: moment(v) } });
        }
    }
    icchange(v) {
            if (v == 1) {
                console.log(v)
                this.props.form.setFields({ 'getstarttime': { value: moment(this.props.form.getFieldValue('fromtime')) }, 'getendtime': { value: moment(this.props.form.getFieldValue('totime')) } })
            } else {
                this.props.form.setFields({ 'getstarttime': { value: "" }, 'getendtime': { value: "" } })
            }
    }
    lmchange(v) {
        if (v.target.value == 1) {
            this.props.form.setFields({ 'maxnumber': { value: '100000000' } })
        } else {
            this.props.form.setFields({ 'maxnumber': { value: '1' } })
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
        } else if (this.state.useScopecheck == 1 || this.props.form.getFieldValue('type') == 4) {
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
    searchProBtn() {
        this.setState({ spcurrent: 1 });
        this.searchPro(1);
    }
    searchPro = (page) => {
        let storeid = ""
        if (this.props.form.getFieldValue('type') == "5") {
            storeid = this.props.form.getFieldValue('storeids')
        }
        request(`${couponapi}salesCouponOpenApi/getGoodsinfoPageInfo.jhtm?shopid=${this.props.form.getFieldValue('shopId')}&nameLike=${this.props.form.getFieldValue('nameLike') || ''}&goodscode=${this.props.form.getFieldValue('goodscode') || ''}&materialNumber=${this.props.form.getFieldValue('materialNumber') || ''}&page=${page}&rows=10&storeid=${storeid}`, {
            method: 'GET',
        }).then((res) => {
            this.setState({ proData: res.data.rows, sptotal: res.data.total })
        });
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
            this.props.form.setFields({ 'getstarttime': { value: moment(Date.parse(new Date()) + 5000) } });
            this.props.form.setFields({ 'getendtime': { value: moment(this.props.form.getFieldValue('totime')) } });
        }
        this.props.form.validateFields((err, values) => {
            console.log(values)
            if (!err) {
                let name = this.mdName();
                let description = values.description.replace(/\n/gi, '\r\n')
                console.log('66666666',values.description)
                let param = {
                    selwechat:false,
                    shopid: values.shopId || '',
                    terminal: values.terminal.toString() || '',
                    limitsymbol: values.limitsymbol || '',
                    usescope: values.usescope || '',
                    name: values.name.trim() || '',
                    amount:values.usescope==1?'0.00':values.amount,
                    couponway: values.couponway || '',
                    description: description || '',
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
                    materialcodes: this.state.sptable ? this.state.sptable.map(c => { return c.materialNumber }).toString() : [],
                    goodcodes: this.state.sptable ? this.state.sptable.map(c => { return c.code }).toString() : [],
                    goodname: this.state.sptable ? this.state.sptable.map(c => { return c.name }).toString() : [],
                    gettype: values.gettype || '',
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
                let data = `salescouponsApi=${JSON.stringify(param)}&isdefaultWechat=${values.isdefaultWechat}&color=${this.state.stylebgCK}`;
                console.log('\r\r\r\r',data)
                request(`${couponapi}salesCouponOpenApi/salescoupon/add.jhtm`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' },
                    body: data
                }).then((res) => {
                    if (res.data.code === '00') {
                       location.hash = '/coupon/list';
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
            this.props.form.setFields({ 'iscanget': { value: 1 } });
        } else {
            this.setState({ selwechat: false })
        }
    };
    gtchange = (value) => {
        this.props.form.setFields({ 'gettype': { value: value } });
        if (value == 0) {
            this.props.form.setFields({ 'intervaldate': { value: 0 } });
        } else {
            if (this.props.form.getFieldValue('intervaldate') == 0) {
                this.props.form.setFields({ 'intervaldate': { value: 1 } });
            }
        }
    }
    uschange = (value) => {
        this.setState({ useScopecheck: value })
        if (value == 4) {
            this.setState({precision:1,min:1.0,minamount:0.0})
            this.props.form.setFields({ 'amount': { value: "1.0" } });
            this.props.form.setFields({ 'minorderamount': { value: "0.0" } });
        } else {
            this.setState({precision:2,min:0.01,minamount:0.00})
            this.props.form.setFields({ 'amount': { value: "0.01" } });
            this.props.form.setFields({ 'minorderamount': { value: "0.00" } });
        }
    }
    wschange(v) {
        if (v.target.value == 0) {
            this.setState({ stylebgCK: this.state.wechatData.color, stylebg: this.ckey(this.state.wechatData.color) })
            this.props.form.setFields({ 'ccolor': { value: this.state.wechatData.color } });
        }else{
            this.wechatStyle();
        }
    }

}

const CouponSave = Form.create()(formWrapper);
export default CouponSave;
