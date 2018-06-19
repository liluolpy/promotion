/**
 * Created by chaoqin on 17/10/17.
 */

import React from 'react';
import {Select, Button, Form, Input, InputNumber, Row, Col, DatePicker, Checkbox, Icon, Table, Modal, AutoComplete} from 'antd';
import styles from './sales.css';
import { domain } from '../../models/config';
import _ from 'lodash';
import request from '../../utils/request';
import moment from 'moment';
import base from '../../models/base';

const pageSize = 10;
const FormItem = Form.Item;
const Option = Select.Option;
const CheckboxGroup = Checkbox.Group;
const dateFormat = 'YYYY-MM-DD H:mm:ss';
const { TextArea } = Input;
const formItemLayout = {
    labelCol: {span: 7},
    wrapperCol: {span: 17},
};

class SalesSave extends React.Component {
    constructor(props){
        super(props);

        this.state = {
            salesType: -1,
            loading: false,
            ckRowKeys: [],
            proData: [],
            storeData: [],
            ckShopId: '',
            ckStore: {},
            mainProducts: [],
            relProducts: [],
            role: {}, //编辑获取到的促销信息
            startTimeError: false,
            endTimeError: false
        };

        this.shopid = this.props.params.shopid;
        this.salesid = this.props.params.salesid;
        this.actionType = this.props.params.actionType;
        this.isEdit = this.actionType == 'edit' ? true : false;
    };

    componentDidMount() {
        let _ckShop = loginInfo.rCode;

        base.getFaInfo().then((res)=>{
            if(res.data.code == '200'){
                this.setState({ storeData: res.data.data[0].permission, ckShopId: _ckShop })
            }else{
                base.openNotification('error', '查询店铺失败！');
            }
        });

        if(this.isEdit){
            this.getDetail(this.shopid, this.salesid);
        }
    }

    handleReset = () => {
        this.props.form.resetFields();
    };

    getDetail = (shopId, salesId) => {
        this.setState({loading: true});
        let body = {
            "faIds": null,
            "userid": loginInfo.loginId,
            "shopIds": base.getShopIds()
        };

        request(`${domain}pcsd-hs-promotion-admin/api/promotion/get.jhtm?id=${salesId}&shopId=${shopId}`,{
                method: 'POST',
                headers: {'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'},
                body: 'authdata='+JSON.stringify(body)
            }
        ).then((res)=>{
            this.setState({loading: false});
            if(res.data.resultCode == '0'){
                let role = res.data.t.role,
                    group = res.data.t.groups[0],
                    mainProducts = res.data.t.mainProducts,
                    relProducts = res.data.t.relProducts;

                this.setState({
                    role,
                    ckStore: { value: group.code.toString(), label: group.groupName },
                    ckShopId: role.shopid.toString(),
                    salesType: role.promotiontype.toString(),
                    mainProducts,
                    relProducts

                });
            }else{
                base.openNotification('error', '查询订单详情失败，请稍后重试！');
            }
        });
    };

    getTerminalById = (ids) => {
        let _terminal = [];

        for(let i=0; i<base.terminalData.length; i++){
            for(let q=0; q<ids.length; q++){
                if(base.terminalData[i].value == ids[q]){
                    _terminal.push(base.terminalData[i].label);
                }
            }
        }

        return _terminal.join(",");
    };

    getDefaultTerminal = (text) => {
        let _text = text.split(','), _key = [];

        for(let i=0; i<_text.length; i++){
            if(_text[i] == 'PC'){
                _key.push('1');
            }else if(_text[i] == 'WAP'){
                _key.push('2');
            }else if(_text[i] == 'APP'){
                _key.push('3');
            }else if(_text[i] == 'Wechat'){
                _key.push('4');
            }
        }

        return _key;
    };

    getFaIDs = (faid) => {
        if(this.actionType == 'edit'){
            return null;
        }else{
            let res = [];

            res.push(faid);

            return res;
        }
    };

    submitHandler = (e) => {
        e.preventDefault();
        let that = this;
        this.props.form.validateFields((err, values) => {
            if (!err) {
                let type = values.salesType,
                    _api = '',
                    shopId = this.state.ckShopId,
                    name = values.salesName,
                    beginTime = values.startTime.format(dateFormat),
                    endTime = values.endTime.format(dateFormat),
                    terminal = values.terminalIds,
                    terminalName = that.getTerminalById(values.terminalIds),
                    enable = values.disabled,
                    showInList = 0,
                    description = values.discription,
                    group = that.state.ckStore.value,
                    groupName = that.state.ckStore.label,
                    mainProducts = [],
                    relProducts = [],
                    body = {
                        "faIds": that.getFaIDs(this.state.ckStore.value),
                        "userid": loginInfo.loginId,
                        "shopIds": base.getShopIds()
                    },
                    _postBody = '',
                    mainErrorMsg = '',
                    relErrorMsg = '';

                if(type == 1){
                    mainErrorMsg = '请选择赠品主商品！';
                    relErrorMsg = '请选择赠品！';
                }else if(type == 3){
                    mainErrorMsg = '请选择套餐主商品！';
                    relErrorMsg = '请选择套餐关联品！';
                }else if(type == 4){
                    mainErrorMsg = '请选择下单立赠商品！';
                    relErrorMsg = '请选择优惠券！';
                }else if(type == 7){
                    mainErrorMsg = '请选择下单立减商品！';
                }

                if(that.state.mainProducts.length < 1){
                    base.openNotification('error', mainErrorMsg);
                    return;
                }

                if(type != 7 && that.state.relProducts.length < 1){
                    base.openNotification('error', relErrorMsg);
                    return;
                }

                for(let i=0; i<this.state.mainProducts.length; i++){
                    if(type == 7 && !that.state.mainProducts[i].discount){
                        base.openNotification('error', '请设置优惠价格！');
                        return;
                    }

                    let obj = {}, mainRecord = that.state.mainProducts[i] ? that.state.mainProducts[i] : {};

                    obj.productid1 = mainRecord.id;
                    obj.gcode = mainRecord.code || mainRecord.gcode;
                    obj.name = mainRecord.name;
                    obj.materialNumber = mainRecord.materialNumber;
                    obj.faId = mainRecord.faid || mainRecord.faId;

                    if(type == 1){
                        obj.materialType = '';
                        obj.productGroup = mainRecord.productGroupNo;
                    }else if(type == 3){
                        obj.materialType = '';
                        obj.productGroup = mainRecord.productGroupNo;
                        obj.discount = mainRecord.discount;
                    }else if(type == 7){
                        obj.quantity = '';
                        obj.discount = mainRecord.discount;
                    }

                    mainProducts.push(obj);
                }

                _postBody = `authdata=${JSON.stringify(body)}&shopId=${shopId}&name=${name}&beginTime=${beginTime}&endTime=${endTime}&terminal=${terminal}&terminalName=${terminalName}&enable=${enable}&showInList=${showInList}&description=${description}&promotionType=${type}&mainProducts=${JSON.stringify(mainProducts)}&group=${group}&groupName=${groupName}`;

                if(type != 7){
                    for(let q=0; q<that.state.relProducts.length; q++){
                        if(type == 1 && !that.state.relProducts[q].quantity){
                            base.openNotification('error', '请设置赠品数量！');
                            return;
                        }

                        if(type ==3 && !this.state.relProducts[q].discount){
                            base.openNotification('error', '请设置关联品优惠价格！');
                            return;
                        }

                        let relObj = {}, relRecord = that.state.relProducts[q] ? that.state.relProducts[q] : {};

                        relObj.productid2 = relRecord.id;
                        relObj.gcode = type == 4 ? '' : (relRecord.code || relRecord.gcode);
                        relObj.name = relRecord.name;
                        relObj.materialNumber = relRecord.materialNumber || '';
                        relObj.faId = relRecord.faid || relRecord.faId || '';
                        relObj.materialType = '';
                        relObj.productGroup = relRecord.productGroupNo || '';

                        if(type == 1){
                            relObj.quantity = relRecord.quantity;
                        }else if(type == 3){
                            relObj.discount = relRecord.discount;
                        }else if(type == 4){
                            relObj.discount = relRecord.cost || relRecord.amount;
                            relObj.beginTime = relRecord.fromtime || relRecord.beginTime;
                            relObj.endTime = relRecord.totime || relRecord.endTime;

                            if(values.startTime < (new Date(relObj.beginTime)).getTime()){
                                this.setState({ startTimeError: true });
                                return;
                            }else{
                                this.setState({ startTimeError: false });
                            }

                            if(values.endTime > (new Date(relObj.endTime)).getTime()){
                                this.setState({ endTimeError: true });
                                return;
                            }else{
                                this.setState({ endTimeError: false });
                            }
                        }

                        relProducts.push(relObj);
                    }

                    _postBody += `&relProducts=${JSON.stringify(relProducts)}`;
                }

                if(this.isEdit){
                    _api = 'pcsd-hs-promotion-admin/api/promotion/update.jhtm';
                    _postBody += '&Id='+this.state.role.id+'&status='+this.state.role.status;
                }else{
                    _api = 'pcsd-hs-promotion-admin/api/promotion/add.jhtm';
                }

                request(`${domain}${_api}`,{
                        method: 'POST',
                        headers: {'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'},
                        body: _postBody
                    }
                ).then((res)=>{
                    if(res.data.t && res.data.t.rc == '0'){
                        base.openNotification('success', '保存成功！');

                        location.hash='/sales/list';
                    }else{
                        base.openNotification('error', res.data.resultMsg);
                    }
                },()=>{
                    base.openNotification('error', '保存失败，请稍后重试！');
                });
            }
        });
    };

    /*ckShop = (e) => {
        this.setState({ ckShopId: e });
    };*/

    selectType = (e) => {
        this.setState({salesType: e, mainProducts: [], relProducts: []});
    };

    setStoreOptions = () => {
        let options = [];

        if(this.state.storeData.length == 0){
            options.push(<Option key='0'  mid={{}}>暂无门店信息</Option>);

            return options;
        }

        for(let i=0; i<this.state.storeData.length; i++){
            options.push(<Option key={ this.state.storeData[i].value } search={ this.state.storeData[i].label } value={ this.state.storeData[i].label } mid={ this.state.storeData[i] }>{ this.state.storeData[i].label }</Option>);
        }

        return options;
    };

    checkStore = (value, option) => {
        let _data = option.props.mid;
        this.setState({ ckStore: _data, mainProducts: [], relProducts: [] });
    };

    getSelectProducts = (data) => {
        this.setState({ mainProducts: data['mainProducts'], relProducts: data['relProducts'] });
    };

    backList = () => {
        location.hash = '/sales/list';
    };

    render () {
        const {getFieldDecorator} = this.props.form;

        const role = this.state.role, startTimeError = this.state.startTimeError, endTimeError = this.state.endTimeError;

        return (
            <div>
                <Form
                    className={styles.salesDetail}
                    onSubmit={this.submitHandler}
                >
                    <h5>促销信息</h5>
                    <Row gutter={16}>
                        <Col span={8}>
                            <FormItem {...formItemLayout} label="店铺">
                                { getFieldDecorator('group', {
                                    initialValue: this.state.ckStore.label || '',
                                    rules: [{required: true, message: '请输入店铺名称!'}]
                                })(
                                    <Select
                                        showSearch={true}
                                        placeholder="请输入店铺名称"
                                        optionFilterProp="search"
                                        onSelect={ this.checkStore }
                                        disabled={ this.isEdit }
                                    >
                                        { this.setStoreOptions() }
                                    </Select>
                                ) }
                            </FormItem>
                        </Col>
                        {/*<Col span={8}>
                            <FormItem {...formItemLayout} label="商城">
                                { getFieldDecorator('shopId', {
                                    initialValue: this.state.ckShopId,
                                    rules: [{required: true, message: '请选择商城!'}]
                                })(
                                    <Select placeholder="请选择商城" onChange={this.ckShop} disabled={ this.isEdit }>
                                        { base.setOptions(base.shopsData) }
                                    </Select>
                                ) }
                            </FormItem>
                        </Col>*/}
                        <Col span={8}>
                            <FormItem {...formItemLayout} label="促销名称">
                                { getFieldDecorator('salesName', {
                                    initialValue: role.promotionname || '',
                                    rules: [{required: true, message: '请输入促销名称!'}]
                                })(<Input placeholder="请输入促销名称" style={{ height: 30 }} />) }
                            </FormItem>
                        </Col>
                        <Col span={8}>
                            <FormItem {...formItemLayout} label="推广平台">
                                { getFieldDecorator('terminalIds', {
                                    initialValue: role.terminalName && this.getDefaultTerminal(role.terminalName) || [],
                                    rules: [{required: true, message: '请选择推广平台!'}]
                                })(
                                    <CheckboxGroup options={base.terminalData} />
                                ) }
                            </FormItem>
                        </Col>
                        <Col span={8}>
                            <FormItem {...formItemLayout} label="促销类型">
                                { getFieldDecorator('salesType', {
                                    initialValue: this.state.salesType == '-1' ? '' : this.state.salesType,
                                    rules: [{required: true, message: '请选择促销类型!'}]
                                })(
                                    <Select placeholder="请选择促销类型" onChange={this.selectType} disabled={ this.isEdit }>
                                        { base.setOptions(base.salesType) }
                                    </Select>
                                ) }
                            </FormItem>
                        </Col>
                        <Col span={8}>
                            <FormItem {...formItemLayout} label="开始时间" validateStatus={ startTimeError ? 'error' : null } help={ startTimeError ? '开始时间必须在优惠券有效时间范围内！' : null }>
                                { getFieldDecorator('startTime', {
                                    initialValue: role.fromtime && moment(role.fromtime, dateFormat) || moment(),
                                    rules: [{required: true, message: '请选择开始时间!'}]
                                })(<DatePicker style={{width: '100%'}} showTime={{ format: 'HH:mm:ss' }} format="YYYY-MM-DD HH:mm:ss"/>) }
                            </FormItem>
                        </Col>
                        <Col span={8}>
                            <FormItem {...formItemLayout} label="结束时间" validateStatus={ endTimeError ? 'error' : null } help={ endTimeError ? '结束时间必须在优惠券有效时间范围内！' : null }>
                                { getFieldDecorator('endTime', {
                                    initialValue: role.totime && moment(role.totime, dateFormat) || null,
                                    rules: [{type: 'object', required: true, message: '请选择结束时间!'}]
                                })(<DatePicker style={{width: '100%'}} showTime={{ format: 'HH:mm:ss' }} format="YYYY-MM-DD HH:mm:ss"/>) }
                            </FormItem>
                        </Col>
                        <Col span={8}>
                            <FormItem {...formItemLayout} label="启用状态">
                                { getFieldDecorator('disabled', {
                                    initialValue: typeof role.disabled == 'number' && role.disabled + '' || '',
                                    rules: [{required: true, message: '请选择启用状态!'}]
                                })(
                                    <Select placeholder="请选择启用状态" disabled={ role.status == 3 ? 'true' : false }>
                                        <Option value="1">启用</Option>
                                        <Option value="0">停用</Option>
                                    </Select>
                                ) }
                            </FormItem>
                        </Col>
                        <Col span={8}>
                            <FormItem {...formItemLayout} label="描述">
                                { getFieldDecorator('discription', { initialValue: role.description || '' })(<TextArea rows={4} />) }
                            </FormItem>
                        </Col>
                    </Row>

                    <div className={ this.state.salesType != '-1' ? `${styles.show}` : `${styles.hide}` }>
                        <CheckSalesRender shop={ this.state.ckShopId } type={ this.state.salesType } store={ this.state.ckStore.value } isEdit={ this.isEdit } mainProducts={ this.state.mainProducts } relProducts={ this.state.relProducts } onSelect={ this.getSelectProducts }></CheckSalesRender>
                    </div>

                    <Row gutter={16} style={{ textAlign: 'right' }}>
                        <Col>
                            <Button onClick={this.handleReset}>重置</Button>
                            <Button style={{marginLeft: 8}} onClick={this.backList}>返回</Button>
                            <Button style={{marginLeft: 8}} type="primary" htmlType="submit">保存</Button>
                        </Col>
                    </Row>
                </Form>
            </div>
        )
    }
}

class Salecontent extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            loading: false,
            proLoading: false,
            couponLoading: false,
            productPop: false,
            couponPop: false,
            mainProducts: [],
            relProducts: [],
            couponData: [],
            page: 1,
            couponPage: 1
        };

        this.selectProductType = '';
    }

    componentWillReceiveProps(props){
        this.ckShop = props.shop;
        this.saleType = props.type;
        this.ckStore = props.store;
        this.isEdit = props.isEdit;
        this.setState({ mainProducts: props.mainProducts || [], relProducts: props.relProducts || [] });
    };

    showProductPop = (key) => {
        if(!this.ckShop){
            base.openNotification('errpr', '请选择商城！');
            return;
        }

        if(!this.ckStore){
            base.openNotification('error', '请选择店铺！');
            return;
        }

        this.selectProductType = key;

        if(key == 'relProducts' && this.state.mainProducts.length == 0){
            base.openNotification('error', '请先选择主品！');
            return;
        }

        if(key == 'relProducts' && this.saleType == 4){
            this.setState({ couponPop: true }, function(){
                this.searchCouponData();
            });
        }else{
            this.setState({ productPop: true });
            this.search();
        }
    };

    hideProductPop = () => {
        this.setState({productPop: false});
    };

    hideCouponPop = () => {
        this.setState({couponPop: false});
    };

    searchPro = (e) => {
        e.preventDefault();
        let that = this;
        this.props.form.validateFields(['proName', 'proCode', 'proMerCode', 'marketable'], (err, values) => {
            if (!err) {
                that.search(this.state.page, values);
            }
        });
    };

    search = (page = 1, searchData) => {
        this.setState({ proLoading: true, page });

        let opt = searchData || {},
            name = opt.proName || '',
            code = opt.proCode || '',
            mercode = opt.proMerCode || '',
            marketable = opt.marketable || '',
            fbId = this.ckStore;

        request(`${domain}lenovo-pcsd-products-products/newGoods/pageQuery`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded'},
            body: 'pageSize=' + pageSize + '&name=' + name + '&code=' + code + '&materialNumber=' + mercode + '&currPage=' + page + '&mallType=' + this.ckShop + '&marketable=' + marketable + '&fabaseinfoesID=&faid='+fbId
        }).then((res) => {
            this.setState({ proLoading: false });
            if(res.data.errorCode == '0'){
                this.setState({ page, proData: res.data.datas, total: res.data.totalCount })
            }else{
                base.openNotification('error', '查询失败，请稍后重试!');
            }
        });
    };

    searchCoupon = (e) => {
        e.preventDefault();
        let that = this;
        this.props.form.validateFields(['couponId', 'couponName'], (err, values) => {
            if (!err) {
                that.searchCouponData(this.state.couponPage, values);
            }
        });
    };

    searchCouponData = (page = 1, searchData) => {
        this.setState({ couponLoading: true, couponPage: page });

        let opt = searchData || {},
            id = opt.couponId || '',
            name = opt.couponName || '';

        request(`${domain}pcsd-hs-coupon-web/couponOpenApi/getCouponToOrderSendCoupon.jhtm`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded'},
            body: 'pageNumber=' + page + '&pageSize=' + pageSize + '&pageSizeZero=false' + '&salescouponid=' + id + '&name=' + name + '&shopId=' + this.ckShop
        }).then((res) => {
            this.setState({ couponLoading: false });
            if(res.data.code == 1000){
                this.setState({ couponPage: page, couponData: res.data.data.datas, couponTotal: res.data.data.totalCount })
            }else{
                base.openNotification('error', '查询失败，请稍后重试!');
            }
        }, ()=>{
            this.setState({ couponLoading: false }, function(){
                base.openNotification('error', '查询失败，请稍后重试!');
            });
        });
    };

    transformMarketable = (record) => {
        if(record){
            const code = record.code;
            let name;
            switch(code){
                case '0':
                    name = '下架中'; break;
                case '1':
                    name = '上架中'; break;
            }
            return <span>{name}</span>
        }else{
            return '';
        }
    };

    delCkItem = (key, record) => {
        if(key == 'mainProducts' && this.isEdit && this.saleType != 7){
            base.openNotification('error', '主品不能删除!');
            return;
        }

        let data = key == 'mainProducts' ? this.state.mainProducts : this.state.relProducts, _data;

        if(this.saleType == 4){
            _data = data.filter((c) => c.id != record.id);
        }else{
            _data = data.filter((c) => (c.code || c.gcode) != (record.code || record.gcode));
        }
        let obj = {};

        if(key == 'mainProducts' && this.saleType != 7){
            this.setState({ mainProducts: [], relProducts: [] });
        }else{
            obj[key] = _data;
        }

        this.setState(obj, function(){
            let sObj = {
                'mainProducts': this.state.mainProducts,
                'relProducts': this.state.relProducts
            };
            this.props.onSelect(sObj);
        });
    };

    setPrice = (e, record) => {
        let type = this.saleType, data = type != 7 ? this.state.relProducts : this.state.mainProducts, _val = e;

        for(let i=0; i<data.length; i++){
            let cid= data[i].code || data[i].gcode,
                recordCode = record.code || record.gcode;

            if(cid == recordCode){
                if(_val < 0){
                    data[i].discount = 0;
                }else if(_val > record.salePrice){
                    base.openNotification('error', '价格不能高于商品价格！');
                    data[i].discount = record.salePrice;
                }else{
                    data[i].discount = _val;
                }
            }
        }

        this.updateData(data);
    };

    quantity = (e, record) => {
        let data = this.state.relProducts, _val = e;

        if(!/^[0-9]+$/.test(_val)){
            base.openNotification('error', '赠品必须是整数！');
            return;
        }

        for(let i=0; i<data.length; i++){
            if((data[i].code || data[i].gcode) == (record.code || record.gcode)){
                data[i].quantity = _val;
            }
        }

        this.updateData(data);
    };

    updateData = (data) => {
        this.setState({ data }, function(){
            let sObj = {
                'mainProducts': this.state.mainProducts,
                'relProducts': this.state.relProducts
            };
            this.props.onSelect(sObj);
        });
    };

    getCode = (record) => { return ( <span>{ record.code || record.gcode }</span> ) };

    render(){
        const { getFieldDecorator } = this.props.form;

        let that = this, _key = this.selectProductType;

        /* 1:赠品  3:套餐  4:下单立赠  7:下单立减 */
        const type = this.saleType;

        const mainCol = [
            {title: '商品名称', dataIndex: 'name'},
            {title: '物料编码', dataIndex: 'materialNumber'},
            {title: '商品编码', render: (text, record) => { return this.getCode(record) }},
            {title: '价格', render: (text, record) => { return record.salePrice || 0 }},
            {title: '操作', render: (text, record) => { return (<span onClick={this.delCkItem.bind(this, 'mainProducts', record)}><a>删除</a></span>) }}
        ];

        const relCol = [
            {title: '商品名称', dataIndex: 'name'},
            {title: '物料编码', dataIndex: 'materialNumber'},
            {title: '商品编码', render: (text, record) => { return this.getCode(record) }},
            {title: '价格', render: (text, record) => { return record.salePrice || 0 }},
            {title: '操作', render: (text, record) => {
                return (<span onClick={this.delCkItem.bind(this, 'relProducts', record)}><a>删除</a></span>)
            }}
        ];

        const proCol = [
            {title: '商品名称', dataIndex: 'name'},
            {title: '物料编码', dataIndex: 'materialNumber'},
            {title: '商品编码', dataIndex: 'code'},
            {title: '价格', render: (text, record) => { return record.salePrice || 0 }},
            {title: '上架状态', dataIndex: 'marketable', render: this.transformMarketable},
        ];

        let couponCol = [
            {title: '券ID', dataIndex: 'id'},
            {title: '券名称', dataIndex: 'name'},
            {title: '总库存', render: (text, record) => { return (record.totalStock || (record.sendnumber + record.maxnumber)) }},
            {title: '可用库存', render: (text, record) => { return (record.availableStock || record.maxnumber) }},
            {title: '有效期范围', render: (text, record) => { return ((record.beginTime || record.fromtime) + '--' + (record.endTime || record.totime)) }},
            {title: '优惠券类型', render: (text, record) => base.transformCoupon(text, record) },
            {title: '金额', render: (text, record) => { return (record.cost || record.amount) }},
            {title: '描述', dataIndex: 'description', width: 300}
        ];

        let ckCouponCol = _.clone(couponCol);
        ckCouponCol.push(
            {title: '操作', render: (text, record) => {
                return (<span onClick={this.delCkItem.bind(this, 'relProducts', record)}><a>删除</a></span>)
            }}
        );

        const pagination = {
            total: this.state.total,
            pageSize,
            onChange: (page, pageSize) => {
                this.search(page);
            }
        };

        const couponPagination = {
            total: this.state.couponTotal,
            pageSize,
            onChange: (page, pageSize) => {
                this.searchCouponData(page);
            }
        };

        let relText = '';

        if(type == 1){
            relText = '赠品';
            relCol.splice(4, 0, {title: '设置赠品数量', render: (text, record) => {return (<InputNumber style={{width: '130px'}} min="0" defaultValue={record.quantity || ''} placeholder="请设置赠品数量" onChange={e => this.quantity.call(this, e, record)} />)}});
        }else if(type == 4){
            relText = '赠券';
        }else if(type == 3){
            relText = '关联品';
            relCol.splice(4, 0, {title: '设置优惠价格', render: (text, record) => {return (<InputNumber style={{width: '130px'}} min="0" defaultValue={record.discount || ''} placeholder="请设置优惠价格" onChange={e => this.setPrice.call(this, e, record)} />)}});
        }else if(type == 7){
            mainCol.splice(4, 0, {title: '设置优惠价格', render: (text, record) => {return (<InputNumber style={{width: '130px'}} min="0" defaultValue={record.discount || ''} placeholder="请设置优惠价格" onChange={e => this.setPrice.call(this, e, record)} />)}});
        }

        const ckCurrentKeys = function(){
            let keys = [], data = that.state[_key] || [];

            for(let i=0; i<data.length; i++){
                keys.push(data[i].id);
            }

            return keys;
        };

        const checkItems = (record, selected, selectedRows) => {
            let obj = {},
                _data = that.state[_key],
                _record = that.state.mainProducts[0],
                code = _record && (_record.code || _record.gcode);

            if(_key == 'mainProducts' && (type != 7) && selectedRows.length > 1){
                base.openNotification('error', '主商品只能选择一个！');
                return;
            }

            if(_key == 'relProducts' && (type != 7) && record.length != 0){
                for(let i=0; i<selectedRows.length; i++){
                    if(selectedRows[i].code == code){
                        base.openNotification('error', '不能选择主品！');
                        return;
                    }
                }
            }

            if(record.length == 0){ //全选
                _.remove(selectedRows, function(n){
                    return n.code == code;
                });

                if(selected){
                    obj[_key] = selectedRows;
                }else{
                    obj[_key] = [];
                }
            }else{
                if(selected){
                    if(ckProductData.type == 'radio'){
                        _data = selectedRows;
                    }else{
                        let o = _.find(_data, function(n){
                            return n.id == record.id;
                        });

                        !o && _data.push(record);
                    }
                }else{
                    _.remove(_data, function(n){
                        return n.id == record.id;
                    })
                }
                obj[_key] = _data;
            }

            that.setState(obj, function(){
                let sObj = {
                    'mainProducts': that.state.mainProducts,
                    'relProducts': that.state.mainProducts.length == 0 ? [] : that.state.relProducts
                };
                that.props.onSelect(sObj);
            });
        };

        const ckProductData = {
            //type: _key == 'relProducts' && (type == 4) ? 'radio' : 'checkbox',

            selectedRowKeys: ckCurrentKeys(),

            onSelect: (record, selected, selectedRows) => {
                checkItems(record, selected, selectedRows);
            },

            onSelectAll: (selected, selectedRows) => {
                checkItems([], selected, selectedRows);
            }
        };

        return (
            <div>
                <h5>{ type == 7 ? '下单立减商品' : '主商品' } <Button type="primary" disabled={ this.isEdit && type != 7 ? true : false } onClick={ this.showProductPop.bind(this, 'mainProducts') }>添加</Button></h5>
                <Row className={styles.tablespace}>
                    <Table
                        loading={this.state.loading}
                        columns={ mainCol }
                        dataSource={ this.state.mainProducts }
                        rowKey={record => record.gcode || record.code}
                    />
                </Row>
                {
                    type != '7' ?
                    <div>
                        <h5>{ relText } <Button type="primary" onClick={ this.showProductPop.bind(this, 'relProducts') }>添加</Button></h5>
                        <Row className={styles.tablespace}>
                            <Table
                                loading={this.state.loading}
                                columns={ this.saleType == 4 ? ckCouponCol : relCol }
                                dataSource={ this.state.relProducts }
                                rowKey={record => record.gcode || record.code || record.id}
                            />
                        </Row>
                    </div>
                    : null
                }

                <Modal
                    width="800px"
                    title="选择商品"
                    visible={this.state.productPop}
                    onCancel={this.hideProductPop}
                    onOk={this.hideProductPop}
                >
                    <Form
                        className={styles.salesDetail}
                        onSubmit={this.searchPro}
                    >
                        <Row gutter={16}>
                            <Col span={12}>
                                <FormItem {...formItemLayout} label="商品名称">
                                    { getFieldDecorator('proName', {initialValue: ''})(<Input placeholder="请输入商品名称" />) }
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem {...formItemLayout} label="商品编码">
                                    { getFieldDecorator('proCode', {initialValue: ''})(<Input placeholder="请输入商品编码" />) }
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem {...formItemLayout} label="物料编码">
                                    { getFieldDecorator('proMerCode', {initialValue: ''})(<Input placeholder="请输入物料编码" />) }
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem {...formItemLayout} label="上架状态">
                                    { getFieldDecorator('marketable', {initialValue: ''})(
                                        <Select placeholder="请选择上架状态">
                                            <Option value="1">上架</Option>
                                            <Option value="0">下架</Option>
                                        </Select>
                                    ) }
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <Button style={{marginLeft: '110px'}} type="primary" htmlType="submit">查询</Button>
                            </Col>
                        </Row>
                    </Form>

                    <Table
                        loading={ this.state.proLoading }
                        rowSelection={ckProductData}
                        columns={proCol}
                        dataSource={this.state.proData}
                        rowKey={record => record.id}
                        pagination={ pagination }
                    />
                </Modal>

                <Modal
                    width="800px"
                    title="选择赠券"
                    visible={this.state.couponPop}
                    onCancel={this.hideCouponPop}
                    onOk={this.hideCouponPop}
                >
                    <Form
                        className={styles.salesDetail}
                        onSubmit={this.searchCoupon}
                    >
                        <Row gutter={16}>
                            <Col span={10}>
                                <FormItem {...formItemLayout} label="券ID">
                                    { getFieldDecorator('couponId', {initialValue: ''})(<Input placeholder="请输入券ID" />) }
                                </FormItem>
                            </Col>
                            <Col span={10}>
                                <FormItem {...formItemLayout} label="券名称">
                                    { getFieldDecorator('couponName', {initialValue: ''})(<Input placeholder="请输入券名称" />) }
                                </FormItem>
                            </Col>
                            <Col span={4}>
                                <Button type="primary" htmlType="submit">查询</Button>
                            </Col>
                        </Row>
                    </Form>

                    <Table
                        loading={ this.state.couponLoading }
                        rowSelection={ckProductData}
                        columns={couponCol}
                        dataSource={this.state.couponData}
                        rowKey={record => record.id}
                        pagination={ couponPagination }
                    />
                </Modal>
            </div>
        );
    }
}

let CheckSalesRender = Form.create()(Salecontent);

export default Form.create()(SalesSave);
