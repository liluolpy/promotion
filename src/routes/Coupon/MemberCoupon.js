import React from 'react';
import { Table, Select, Button, Menu, Dropdown, Icon, Form, Input, Row, Col, DatePicker, Alert, Modal, Checkbox, notification, Popover } from 'antd';
import { couponapi } from '../../models/config';
import { couponIp } from '../../models/config';
import base from '../../models/base';
import styles from './coupon.css';
import request from '../../utils/request';

const FormItem = Form.Item;
const CheckboxGroup = Checkbox.Group;
const Option = Select.Option;
const { RangePicker } = DatePicker;
const formItemLayout = {
    labelCol: { span: 7 },
    wrapperCol: { span: 17 },
};
let appkey, clientID, clientSecret, upload, token;
console.log('document.domain',document.domain)
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

class MemberCoupon extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            tableCol: [{key:"memberid",name:"会员"},{key:"salescouponid",name:"优惠券"},{key:"name",name:"优惠券"},{key:"usescope",name:"优惠券类型"},{
                key:"shopid",name:"商城"},{key:"usertag",name:"用户标签"},{key:"superposition",name:"是否叠加"},{key:"getnumber",name:"领取的张数"},{key:"totalnumber",name:"单次使用张数"},{key:"surplusnumber",name:"剩余可使用张数"},{key:"usednumber",name:"已使用张数"},{key:"couponsource",name:"优惠券来源"},{key:"couponcode",name:"核销码"},{key:"disabled",name:"是否禁用"},{key:"orderid",name:"订单号"},{key:"orderamount",name:"订单金额"},{key:"usetime",name:"使用时间"},{key:"terminal",name:"平台"},{key:"status",name:"状态"},{key:"type",name:"券类型"},{key:"amount",name:"金额"},{key:"description",name:"规则描述"},{key:"createby",name:"操作人"},{key:"fromtime",name:"有效期开始时间"},{key:"totime",name:"有效期结束时间"},{key:"createtime",name:"创建时间"},{key:"updatetime",name:"更新时间"}],
            expand:false,
            shops:[],
            shopId:'',
            couponTypes:[],
            terminal:[],
            shopid:'20',
            userCouponData:[],
            total: 0,
            current: 1,
            loading:false,
            downshow:false,
            check:[]
        };
    };

    componentDidMount() {
        const log = window.loginInfo; //获取localstory的信息
        this.setState({
            shopId:log.rCode
        })
        this.tranShopName(log.rCode)
        this.search()
        this.getShop()
        this.getTerminal()
        this.getCouponType(log.rCode)
        let arr = [];
        for (var { key: k, name: n } of this.state.tableCol) {
            arr.push(k + '=' + n);
        }
        this.setState({ check: arr })
        this.props.form.setFields({ 'outx': { value: arr } });
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
    search=()=>{
        this.setState({current:1})
        this.getUserCouponData(1)
    }
    getUserCouponData=(page)=>{
        this.props.form.validateFields((err, option) => {
            console.log('option',option)
            let createtime_start = option.createTime && option.createTime[0] ? option.createTime[0].format('YYYY-MM-DD') : '';
            let createtime_end = option.createTime && option.createTime[1] ? option.createTime[1].format('YYYY-MM-DD') : '';
            let fromtime = option.effectTime && option.effectTime[0] ? option.effectTime[0].format('YYYY-MM-DD') : '';
            let totime = option.effectTime && option.effectTime[1] ? option.effectTime[1].format('YYYY-MM-DD') : '';
            this.setState({ loading: true });

            request(`${couponapi}salesCouponOpenApi/queryMemberCouponInfoPage.jhtm?memberid=${option.userName}&name=${option.name}&shopid=${option.shopid}&terminal=${option.terminal}&disabled=${option.disabled}&usescope=${option.usescope}&fromtime=${fromtime}&totime=${totime}&createtime=${createtime_start}&createtime_end=${createtime_end}&usercode=${option.usercode}&rows=${pageSize}&page=${page}`, {
                method: 'GET',
            }).then((res) => {
                console.log('userCouponData',res.data)
                this.setState({
                    userCouponData: res.data.data.datas || [],
                    total: res.data.data.totalCount,
                    loading:false
                });
            });
           
        })    
    }
    getShop=()=>{
        request(`${couponapi}pagePropertiesOpenApi/getShopIds.jhtm`, {
            method: 'GET',
        }).then((res) => {
            console.log('getShop',res)
            if (res.data.code == 200) {
                this.setState({ shops: res.data.data || [] });
            } else {
                base.openNotification('error', res.data.msg)
            }
        });
    }
    getTerminal=()=>{
        request(`${couponapi}pagePropertiesOpenApi/getTerminal.jhtm`, {
            method: 'GET',
        }).then((res) => {
            console.log('getTerminal',res)
            if (res.data.code == 200) {
                this.setState({ terminal: res.data.data || [] });
            } else {
                base.openNotification('error', res.data.msg)
            }
        });
    }
    getCouponType=(id)=>{
        request(`${couponapi}pagePropertiesOpenApi/getUseScope.jhtm?shopid=${id}`, {
            method: 'GET',
        }).then((res) => {
            console.log('couponType',res)
            if (res.data.code == 200) {
                this.setState({ couponTypes: res.data.data || [] });
            } else {
                base.openNotification('error', res.data.msg)
            }
        });
    }
    out=()=>{
        this.setState({downshow:true})
    }
    handleSearch=(e)=>{
        e.preventDefault();
        //form搜索
        this.search()
    }
    handleReset=()=>{
        this.props.form.resetFields();
        this.search()
        // this.setState({ searchData: {} }, function () {
        //     this.search(this.state.current);
        // });
    }
    toggle = () => {
        const { expand } = this.state;
        this.setState({ expand: !expand });
        this.props.form.resetFields();
        this.props.form.setFields({ 'outx': { value: this.state.check } });
        if (expand) {
            document.getElementById("zksq").innerText = "高级查询";
        } else {
            document.getElementById("zksq").innerText = "快速查询";
        }
    }
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
    transformShopId = (text) => {
        if (text == '28') {
            return 'Think';
        } else if (text == '20') {
            return '无人店';
        }else if(text == '58'){
            return '阳光';
        }else if(text == '78'){
            return 'Moto';
        }else if (text == '88'){
            return '杨天';
        }else if(text == '25'){
            return '消费';
        }else if(text == '35'){
            return '千禧';
        }
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
    transformOp=(text, record)=>{
        console.log('text',text)
        if(text.disabled==0){
            return (
                <div>
                    <a onClick={() => this.detail(record.id)}>查看</a>
                    <span className='line'></span>
                    <a onClick={() => this.disable(record.id)}>禁用</a>
                </div>
            );
        }else if(text.disabled==1){
            return (
                <div>
                    <a onClick={() => this.detail(record.id)}>查看</a>
                    <span className='line'></span>
                    <span>已禁用</span>
                </div>
            );
        }

    }
    outData=()=>{
        console.log('33')
        return(
            <div>
                sss
            </div>
        )
    }
    detail(id) {
        location.hash = `/coupon/memberdetail/${id}/0`;
    };
    disable(id){
        request(`${couponapi}salesCouponOpenApi/disableMemberCouponById.jhtm?id=${id}`,{
            method:'POST',
            headers:{'Content-Type':'application/x-www-form-urlencoded;charset=utf-8'}
        }
    ).then((res)=>{
        if(res.data.code == 200){
            this.search()
        }else{

        }
    })
    }
    outCancel() {
        this.setState({ downshow: false })
    }
    outOk() {
        if (!/accessToken=/i.test(document.cookie)) {
            base.openNotification('error', '验证信息出错，请稍后重试!');
            this.initMadp();
            return false;
        }
        this.props.form.validateFields((err, option) => {
            console.log("option",option)
            if (option.outx.length > 0) {
                let createStartTime = option.createTime && option.createTime[0] ? option.createTime[0].format('YYYY-MM-DD') : '';
                let createEndTime = option.createTime && option.createTime[1] ? option.createTime[1].format('YYYY-MM-DD') : '';
                let effectStartTime = option.effectTime && option.effectTime[0] ? option.effectTime[0].format('YYYY-MM-DD') : '';
                let effectEndTime = option.effectTime && option.effectTime[1] ? option.effectTime[1].format('YYYY-MM-DD') : '';
                request(`${couponapi}salesCouponOpenApi/excel/exportExcelMemberSalescoupons.jhtm?name=${option.name}&usescope=${option.usescope}&fromtime=${effectStartTime}&totime=${effectEndTime}&createtime_start=${createStartTime}&createtime_end=${createEndTime}&shopid=${option.shopid}&terminal=${option.terminal}&disabled=${option.disabled}&usercode=${option.usercode}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' },
                    body: `exporttitle=${this.props.form.getFieldValue('outx').toString()}`
                }).then((res) => {
                    console.log('res.data.data',res.data.code)
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
    render() {
        const { getFieldDecorator } = this.props.form;
        const columns=[
            { title: '用户ID', width: 100, dataIndex: 'memberid', key: 'memberid', fixed: 'left' },
            { title: '优惠券名称', width: 100, dataIndex: 'name', key: 'name', fixed: 'left' },
            { title: '优惠券ID', dataIndex: 'id', key: 'id'},
            { title: '优惠券编码', dataIndex: 'couponcode', key: 'couponcode' },
            { title: '优惠金额', dataIndex: 'amount', key: 'amount'},
            { title: '商城', dataIndex: 'shopid', key: 'shopid',render: this.transformShopId},
            { title: '平台', dataIndex: 'terminal', key: 'terminal', render: this.transformTerminal },
            { title: '优惠券类型', dataIndex: 'usescope', key: 'usescope',render: this.transformCtype},
            { title: '有效开始时间', dataIndex: 'fromtime', key: 'ableStartTime' },
            { title: '有效结束时间', dataIndex: 'totime', key: 'totime' },
            { title: '是否禁用', dataIndex: 'disabled', key: 'disabled', render: (text) => { return text == 1 ? "是" : "否" } },
            { title: '操作', key: 'operation', fixed: 'right', width: 150,render:this.transformOp}
        ]
        const rowSelection = {
            onChange: (selectedRowKeys, selectedRows) => {
                console.log('selectedRows',selectedRows)
                this.setState({ ckItems: selectedRows });
            }
        };
        const pagination = {
            total: this.state.total,
            current: this.state.current,
            pageSize: pageSize,
            showQuickJumper: true,
            onChange: (page, pageSize) => {
                this.setState({ current: page });
                this.getUserCouponData(page);
            }
        };
        const showlist = this.state.tableCol.map((d, index) => {
            const id = d.key, name = d.name;
            return <Checkbox key={id} value={id + '=' + name} className='ml10'>{name}</Checkbox>
        })
        return(
            <div>
                 <Form
                    className={styles.form}
                    onSubmit={this.handleSearch}
                >
              <Row gutter={16}>
                <Col span={7}>
                    <FormItem {...formItemLayout} label="用户ID">
                        {getFieldDecorator('userName', { initialValue: '' })(<Input placeholder="用户登录名" />)}
                    </FormItem>
                </Col>
                <Col span={7}>
                    <FormItem {...formItemLayout} label="优惠券名称">
                        {getFieldDecorator('name', { initialValue: '' })(<Input placeholder="请输入优惠券名称" />)}
                    </FormItem>
                </Col>
                <div className={this.state.expand ? '' : 'none'}>
                <Col span={7}>
                    <FormItem {...formItemLayout} label="商城">
                    {getFieldDecorator('shopid', { initialValue: this.state.shopId})(
                     <span>{this.state.shopName}</span>
                    )}
                    </FormItem>
                </Col>
                <Col span={7}>
                    <FormItem {...formItemLayout} label="平台">
                        {getFieldDecorator('terminal', { initialValue: '' })(
                            <Select>
                                {this.state.terminal.map((c,index)=>{
                                     return <Option key={c.value} value={c.value}>{c.label}</Option>
                                 })}
                            </Select>
                        )}
                    </FormItem>
                </Col>
                <Col span={7}>
                    <FormItem {...formItemLayout} label="是否禁用">
                        {getFieldDecorator('disabled', { initialValue: '' })(
                         <Select >
                            <Option key="" value="">全部状态</Option>
                            <Option key="" value="1">是</Option>
                            <Option key="" value="0">否</Option>
                       </Select>
                        )}
                    </FormItem>
                </Col>
                <Col span={7}>
                    <FormItem {...formItemLayout} label="优惠券类型">
                        {getFieldDecorator('usescope',{initialValue:''})(
                             <Select>
                                 {this.state.couponTypes.map((c,index)=>{
                                     return <Option key={c.id} value={c.id}>{c.text}</Option>
                                 })}
                             </Select>
                        )}
                    </FormItem>
                </Col>
                <Col span={7}>
                    <FormItem {...formItemLayout} label="有效时间">
                        {getFieldDecorator('effectTime')(<RangePicker format="YYYY-MM-DD" />)}
                    </FormItem>
                </Col>
                <Col span={7}>
                    <FormItem {...formItemLayout} label="创建时间">
                        {getFieldDecorator('createTime')(<RangePicker format="YYYY-MM-DD" />)}
                    </FormItem>
                </Col>
                <Col span={7}>
                <FormItem {...formItemLayout} label="会员卡号">
                        {getFieldDecorator('usercode',{initialValue:''})(
                            <Input placeholder="请输入会员卡号" />
                        )}
                    </FormItem>
                </Col>
                </div> 
                <div id="formBtn" style={{ display: 'inline-block' }} className={this.state.expand ? 'rformbtn' : 'mt2'}>
                    <Button type="primary" htmlType="submit" >查询</Button>
                    <Button onClick={this.handleReset} className={this.state.expand ? 'ml10' : 'none'}>重置</Button>
                    <a style={{ marginLeft: 10 }} onClick={this.toggle}>
                        <span id="zksq">高级查询</span> <Icon type={this.state.expand ? 'up' : 'down'} />
                    </a>
                </div>
              </Row>          
                </Form>
                <div className={styles.operations}>
                    <Button type="primary" style={{ marginRight: "10px" }} onClick={this.out}>导出</Button>
                </div>

                <Table rowSelection={rowSelection} loading={this.state.loading} rowKey="id" columns={columns} pagination={pagination} dataSource={this.state.userCouponData} scroll={{ x: 1800 }}/>
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

}
export default Form.create()(MemberCoupon);