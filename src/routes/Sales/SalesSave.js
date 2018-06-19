/**
 * Created by chaoqin on 17/10/17.
 */

import React from 'react';
import {Select, Button, Form, Input, Row, Col, DatePicker, Checkbox, Icon, Table, Modal, AutoComplete} from 'antd';
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
            xdljData: [],
            zpzspData: [],
            zpData: [],
            tczspData: [],
            tcglpData: [],
            ckRowKeys: [],
            productpop: false,
            proData: [],
            proLoading: false,
            searchData: {},
            total: 0,
            dataKey: '',
            storeData: [],
            storeId: '',
            storeName: '',
            storeFBid: '',
            role: {},
            groups: [],
        };

        this.ckShopid = '';
        this.shopid = this.props.params.shopid;
        this.salesid = this.props.params.salesid;
        this.actionType = this.props.params.actionType;
        this.isEdit = this.actionType == 'edit' ? true : false;
    };

    componentDidMount() {
        base.getFaInfo().then((res)=>{
            if(res.data.code == '200'){
                this.setState({ storeData: res.data.data[0].permission })
            }else{
                base.openNotification('error', '查询店铺失败！');
            }
        });

        if(this.actionType == 'edit'){
            this.getDetail(this.shopid, this.salesid);
        }
    }

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
                this.ckShopid = res.data.t.role.shopid;

                this.setState({
                    role: res.data.t.role,
                    groups: res.data.t.groups,
                    storeFBid: res.data.t.role.faId
                });

                let salesType = res.data.t.role.promotiontype,
                    mainProducts = res.data.t.mainProducts,
                    relProducts = res.data.t.relProducts;
                switch (salesType){
                    case 1: { //赠品
                        this.setState({ zpzspData: mainProducts, zpData: relProducts });
                        break;
                    }
                    case 3: { //套餐
                        this.setState({ tczspData: mainProducts, tcglpData: relProducts });
                        break;
                    }
                    case 7: { //下单立减
                        this.setState({ xdljData: mainProducts });
                        break;
                    }
                }

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
                let _api = '',
                    shopId = values.shopId,
                    name = values.salesName,
                    beginTime = values.startTime.format(dateFormat),
                    endTime = values.endTime.format(dateFormat),
                    terminal = values.terminalIds,
                    terminalName = that.getTerminalById(values.terminalIds),
                    enable = values.disabled,
                    showInList = 0,
                    description = values.discription,
                    promotionType = values.salesType,
                    group = this.state.storeId || this.state.groups[0] && this.state.groups[0].code,
                    groupName = this.state.storeName || this.state.groups[0] && this.state.groups[0].groupName,
                    mainProducts = [],
                    relProducts = [],
                    body = {
                        "faIds": this.getFaIDs(this.state.storeId || this.state.groups[0] && this.state.groups[0].code),
                        "userid": loginInfo.loginId,
                        "shopIds": base.getShopIds()
                    },
                    _postBody = '';

                if(this.state.salesType == '7' || (this.state.role.promotiontype && this.state.role.promotiontype == '7')){
                    if(this.state.xdljData.length < 1){
                        base.openNotification('error', '请选择参与下单立减的商品！');

                        return;
                    }

                    for(let i=0; i<this.state.xdljData.length; i++){
                        if(!this.state.xdljData[i].discount){
                            base.openNotification('error', '请设置下单立减优惠价格！');
                            return;
                        }

                        let obj = {}, _xdljData = this.state.xdljData[i] ? this.state.xdljData[i] : {};

                        obj.productid1 = _xdljData.id;
                        obj.gcode = _xdljData.code || _xdljData.gcode;
                        obj.name = _xdljData.name;
                        obj.materialNumber = _xdljData.materialNumber;
                        obj.quantity = '';
                        obj.discount = _xdljData.discount;
                        obj.faId = this.state.storeId || this.state.groups[0] && this.state.groups[0].code;

                        mainProducts.push(obj);
                    }

                    _postBody = `authdata=${JSON.stringify(body)}&shopId=${shopId}&name=${name}&beginTime=${beginTime}&endTime=${endTime}&terminal=${terminal}&terminalName=${terminalName}&enable=${enable}&showInList=${showInList}&description=${description}&promotionType=${promotionType}&mainProducts=${JSON.stringify(mainProducts)}&group=${group}&groupName=${groupName}`;
                }else if(this.state.salesType == '1' || (this.state.role.promotiontype && this.state.role.promotiontype == '1')){
                    if(this.state.zpzspData.length < 1){
                        base.openNotification('error', '请选择赠品主商品！');

                        return;
                    }

                    if(this.state.zpData.length < 1){
                        base.openNotification('error', '请选择赠品！');

                        return;
                    }

                    for(let i=0; i<this.state.zpzspData.length; i++){
                        let obj = {}, _zdzspData = this.state.zpzspData[i] ? this.state.zpzspData[i] : {};

                        obj.productid1 = _zdzspData.id;
                        obj.gcode = _zdzspData.code || _zdzspData.gcode;
                        obj.name = _zdzspData.name;
                        obj.materialNumber = _zdzspData.materialNumber;
                        obj.faId = _zdzspData.faid || _zdzspData.faId;
                        obj.materialType = '';
                        obj.productGroup = _zdzspData.productGroupNo;

                        mainProducts.push(obj);
                    }

                    for(let q=0; q<this.state.zpData.length; q++){
                        if(!this.state.zpData[q].quantity){
                            base.openNotification('error', '请设置赠品数量！');
                            return;
                        }

                        let zpobj = {}, _zpData = this.state.zpData[q] ? this.state.zpData[q] : {};

                        zpobj.productid2 = _zpData.id;
                        zpobj.gcode = _zpData.code || _zpData.gcode;
                        zpobj.name = _zpData.name;
                        zpobj.materialNumber = _zpData.materialNumber;
                        zpobj.faId = _zpData.faid || _zpData.faId;
                        zpobj.materialType = '';
                        zpobj.productGroup = _zpData.productGroupNo;
                        zpobj.quantity = _zpData.quantity;

                        relProducts.push(zpobj);
                    }

                    _postBody = `authdata=${JSON.stringify(body)}&shopId=${shopId}&name=${name}&beginTime=${beginTime}&endTime=${endTime}&terminal=${terminal}&terminalName=${terminalName}&enable=${enable}&showInList=${showInList}&description=${description}&promotionType=${promotionType}&mainProducts=${JSON.stringify(mainProducts)}&group=${group}&groupName=${groupName}&relProducts=${JSON.stringify(relProducts)}`;
                }else if(this.state.salesType == '3' ||  (this.state.role.promotiontype && this.state.role.promotiontype == 3)){
                    if(this.state.tczspData.length < 1){
                        base.openNotification('error', '请选择套餐主商品！');

                        return;
                    }

                    if(this.state.tcglpData.length < 1){
                        base.openNotification('error', '请选择套餐关联品！');

                        return;
                    }

                    for(let i=0; i<this.state.tczspData.length; i++){
                        let obj = {}, _tczspData = this.state.tczspData[i] ? this.state.tczspData[i] : {};

                        obj.productid1 = _tczspData.id;
                        obj.gcode = _tczspData.code || _tczspData.gcode;
                        obj.name = _tczspData.name;
                        obj.materialNumber = _tczspData.materialNumber;
                        obj.faId = _tczspData.faid || _tczspData.faId;
                        obj.materialType = '';
                        obj.productGroup = _tczspData.productGroupNo;
                        obj.discount = _tczspData.discount;

                        mainProducts.push(obj);
                    }

                    for(let q=0; q<this.state.tcglpData.length; q++){
                        if(!this.state.tcglpData[q].discount){
                            base.openNotification('error', '请设置关联品优惠价格！');
                            return;
                        }

                        let glpobj = {}, _tcglpData = this.state.tcglpData[q] ? this.state.tcglpData[q] : {};

                        glpobj.productid2 = _tcglpData.id;
                        glpobj.gcode = _tcglpData.code || _tcglpData.gcode;
                        glpobj.name = _tcglpData.name;
                        glpobj.materialNumber = _tcglpData.materialNumber;
                        glpobj.faId = _tcglpData.faid || _tcglpData.faId;
                        glpobj.materialType = '';
                        glpobj.productGroup = _tcglpData.productGroupNo;
                        glpobj.discount = _tcglpData.discount;

                        relProducts.push(glpobj);
                    }

                    //let _relProducts = mainProducts.concat(relProducts); //套餐关联品 包含主商品
                    let _relProducts = relProducts;

                    _postBody = `authdata=${JSON.stringify(body)}&shopId=${shopId}&name=${name}&beginTime=${beginTime}&endTime=${endTime}&terminal=${terminal}&terminalName=${terminalName}&enable=${enable}&showInList=${showInList}&description=${description}&promotionType=${promotionType}&mainProducts=${JSON.stringify(mainProducts)}&group=${group}&groupName=${groupName}&relProducts=${JSON.stringify(_relProducts)}`;
                }

                if(this.actionType == 'edit'){
                    _api = 'pcsd-hs-promotion-admin/api/promotion/update.jhtm';
                    _postBody += '&Id='+this.state.role.id+'&status='+this.state.role.status;
                }else if(this.actionType == 'add'){
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

    selectType = (e) => {
        this.setState({salesType: e});
    };

    handleReset = () => {
        this.props.form.resetFields();
    };

    showProductPop = (key) => {
        if(this.state.role.shopid == '' || this.ckShopid == ''){
            base.openNotification('error', '请选择商城！');
            return;
        }

        if(!this.state.storeFBid || (this.state.groups[0] && this.state.groups[0].groupName == '')){
            base.openNotification('error', '请选择店铺！');
            return;
        }

        this.setState({ dataKey: key });

        if(key == 'zpData'){
            if(this.state.zpzspData.length == 0){
                base.openNotification('error', '请先选择主商品');
                return;
            }
        }

        if(key == 'tcglpData'){
            if(this.state.tczspData.length == 0){
                base.openNotification('error', '请先选择主商品');
                return;
            }
        }

        this.setState({ productpop: true }, () => {
            this.search();
        });
    };

    searchPro = (e) => {
        e.preventDefault();
        let that = this;
        this.props.form.validateFields(['proName', 'proCode', 'proMerCode', 'marketable'], (err, values) => {
            if (!err) {
                that.setState({searchData: values}, function(){
                    that.search();
                });
            }
        });
    };

    ckShop = (e) => {
        this.ckShopid = e;
    };

    search = (page = 1) => {
        this.setState({ proLoading: true });

        let opt = this.state.searchData,
            name = opt.proName || '',
            code = opt.proCode || '',
            mercode = opt.proMerCode || '',
            marketable = opt.marketable || '',
            fbId = this.state.storeFBid;

        //let arg = this.actionType == 'edit' ? '&fabaseinfoesID=' + '' + '&faid=' + fbId : '&fabaseinfoesID=' + fbId + '&faid=' + '';
        let arg = '&fabaseinfoesID=&faid='+fbId;

        request(`${domain}lenovo-pcsd-products-products/newGoods/pageQuery`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded'},
            body: 'pageSize=' + pageSize + '&name=' + name + '&code=' + code + '&materialNumber=' + mercode + '&currPage=' + page + '&mallType=' + this.ckShopid + '&marketable=' + marketable + arg
        }).then((res) => {
            this.setState({ proLoading: false });
            if(res.data.errorCode == '0'){
                this.setState({ page, proData: res.data.datas, total: res.data.totalCount })
            }else{
                this.openNotification('error', '查询失败，请稍后重试!');
            }
        });
    };

    hideProductPop = () => {
        this.setState({productpop: false});
    };

    setSelectPros = () => {
        this.setState({productpop: false});
    };

    setPrice = (data, e, record) => {
        const _val = e.target.value;

        for(let i=0; i<data.length; i++){
            if((data[i].code || data[i].gcode) == (record.code || record.gcode)){
                data[i].discount = _val;
            }
        }

        this.setState({ data });
    };

    quantity = (data, e, record) => {
        const _val = e.target.value;

        if(!/^[0-9]+$/.test(_val)){
            base.openNotification('error', '赠品必须是整数！');
            return;
        }

        for(let i=0; i<data.length; i++){
            if((data[i].code || data[i].gcode) == (record.code || record.gcode)){
                data[i].quantity = _val;
            }
        }

        this.setState({ data });
    };

    delCkItem = (key, data, record) => {
        let _data = data.filter((c) => (c.code || c.gcode) != (record.code || record.gcode));
        let obj = {};

        obj[key] = _data;

        this.setState(obj);
    };

    getCode = (record) => {
        return (
            <span>{ record.code || record.gcode }</span>
        )
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

    getdefaultterminal = (text) => {
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

    checkStore = (value, option) => {
        let _data = option.props.mid;
        this.setState({ storeId: _data.value, storeName: _data.label, storeFBid: _data.value });
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

    render () {
        const {getFieldDecorator} = this.props.form;

        const pagination = {
            total: this.state.total,
            pageSize,
            onChange: (page, pageSize) => {
                this.search(page);
            }
        };

        const _key = this.state.dataKey;

        const that = this;

        const ckCurrentKeys = function(){
            let keys = [], data = that.state[_key] || [];

            for(let i=0; i<data.length; i++){
                keys.push(data[i].id);
            }

            return keys;
        };

        const ckProductData = {
            selectedRowKeys: ckCurrentKeys(),

            onSelect: (record, selected, selectedRows) => {
                let obj = {}, _data = that.state[_key];

                if((_key == 'zpzspData' || _key == 'tczspData') && selectedRows.length > 1){
                    base.openNotification('error', '主商品只能选择一个！');

                    return;
                }

                /*关联品不能与主品一样*/
                if(_key == 'zpData' && selectedRows.length>0){
                    let code = that.state.zpzspData[0] && (that.state.zpzspData[0].code || that.state.zpzspData[0].gcode);

                    for(let i=0; i<selectedRows.length; i++){
                        if(selectedRows[i].code == code){
                            base.openNotification('error', '赠品不能是主品！');
                            return;
                        }
                    }
                }

                if(_key == "tcglpData"){
                    let code = that.state.tczspData[0] && (that.state.tczspData[0].code || that.state.tczspData[0].gcode);

                    for(let i=0; i<selectedRows.length; i++){
                        if(selectedRows[i].code == code){
                            base.openNotification('error', '关联品不能是主品！');
                            return;
                        }
                    }
                }

                if(selected){
                    let o = _.find(_data, function(n){
                        return n.id == record.id;
                    });

                    !o && _data.push(record);
                }else{
                    _.remove(_data, function(n){
                        return n.id == record.id;
                    })
                }

                obj[_key] = [ ..._data ];
                that.setState(obj);
            }
        };

        const xdljCol = [
            {title: '商品名称', dataIndex: 'name'},
            {title: '物料编码', dataIndex: 'materialNumber'},
            {title: '商品编码', render: (text, record) => { return this.getCode(record) }},
            {title: '价格', render: (text, record) => { return record.salePrice || 0 }},
            {title: '设置优惠价格', render: (text, record) => {return (<Input style={{width: '130px'}} defaultValue={record.discount || ''} placeholder="请设置优惠价格" onChange={e => this.setPrice.call(null, this.state.xdljData, e, record)} />)}},
            {title: '操作', render: (text, record) => { return (<span onClick={this.delCkItem.bind(null, 'xdljData', this.state.xdljData, record)}><a>删除</a></span>) }}
        ];

        const zpzspCol = [
            {title: '商品名称', dataIndex: 'name'},
            {title: '物料编码', dataIndex: 'materialNumber'},
            {title: '商品编码', render: (text, record) => { return this.getCode(record) }},
            {title: '价格', render: (text, record) => { return record.salePrice || 0 }},
            {title: '操作', render: (text, record) => { return (<span onClick={this.delCkItem.bind(null, 'zpzspData', this.state.zpzspData, record)}><a>删除</a></span>) }}
        ];

        const zpCol = [
            {title: '商品名称', dataIndex: 'name'},
            {title: '物料编码', dataIndex: 'materialNumber'},
            {title: '商品编码', render: (text, record) => { return this.getCode(record) }},
            {title: '价格', render: (text, record) => { return record.salePrice || 0 }},
            {title: '设置赠品数量', render: (text, record) => {return (<Input style={{width: '130px'}} defaultValue={record.quantity || ''} placeholder="请设置赠品数量" onChange={e => this.quantity.call(null, this.state.zpData, e, record)} />)}},
            {title: '操作', render: (text, record) => { return (<span onClick={this.delCkItem.bind(null, 'zpData', this.state.zpData, record)}><a>删除</a></span>) }}
        ];

        const tczspCol = [
            {title: '商品名称', dataIndex: 'name'},
            {title: '物料编码', dataIndex: 'materialNumber'},
            {title: '商品编码', render: (text, record) => { return this.getCode(record) }},
            {title: '价格', render: (text, record) => { return record.salePrice || 0 }},
            //{title: '设置优惠价格', render: (text, record) => {return (<Input style={{width: '130px'}} defaultValue={record.discount || ''} placeholder="请设置优惠价格" onChange={e => this.setPrice.call(null, this.state.tczspData, e, record)} />)}},
            {title: '操作', render: (text, record) => { return (<span onClick={this.delCkItem.bind(null, 'tczspData', this.state.tczspData, record)}><a>删除</a></span>) }}
        ];

        const tcglpCol = [
            {title: '商品名称', dataIndex: 'name'},
            {title: '物料编码', dataIndex: 'materialNumber'},
            {title: '商品编码', render: (text, record) => { return this.getCode(record) }},
            {title: '价格', render: (text, record) => { return record.salePrice || 0 }},
            {title: '设置优惠价格', render: (text, record) => {return (<Input style={{width: '130px'}} defaultValue={record.discount || ''} placeholder="请设置优惠价格" onChange={e => this.setPrice.call(null, this.state.tcglpData, e, record)} />)}},
            {title: '操作', render: (text, record) => {
                if(record.code != (this.state.tczspData[0].code || this.state.tczspData[0].gcode)){
                    return (<span onClick={this.delCkItem.bind(null, 'tcglpData', this.state.tcglpData, record)}><a>删除</a></span>)
                }
            }}
        ];

        const proCol = [
            {title: '商品名称', dataIndex: 'name'},
            {title: '物料编码', dataIndex: 'materialNumber'},
            {title: '商品编码', dataIndex: 'code'},
            {title: '价格', render: (text, record) => { return record.salePrice || 0 }},
            {title: '上架状态', dataIndex: 'marketable', render: this.transformMarketable},
        ];

        return (
            <div>
                <Form
                    className={styles.salesDetail}
                    onSubmit={this.submitHandler}
                >
                    <h5>促销信息</h5>
                    <Row gutter={16}>
                        <Col span={8}>
                            <FormItem {...formItemLayout} label="商城">
                                { getFieldDecorator('shopId', {
                                    initialValue: this.state.role.shopid && this.state.role.shopid + '' || '',
                                    rules: [{required: true, message: '请选择商城!'}]
                                })(
                                    <Select placeholder="请选择商城" onChange={this.ckShop}>
                                        { base.setOptions(base.shopsData) }
                                    </Select>
                                ) }
                            </FormItem>
                        </Col>
                        <Col span={8}>
                            <FormItem {...formItemLayout} label="促销名称">
                                { getFieldDecorator('salesName', {
                                    initialValue: this.state.role.promotionname || '',
                                    rules: [{required: true, message: '请输入促销名称!'}]
                                })(<Input placeholder="请输入促销名称" style={{ height: 30 }} />) }
                            </FormItem>
                        </Col>
                        <Col span={8}>
                            <FormItem {...formItemLayout} label="推广平台">
                                { getFieldDecorator('terminalIds', {
                                    initialValue: this.state.role.terminalName && this.getdefaultterminal(this.state.role.terminalName) || [],
                                    rules: [{required: true, message: '请选择推广平台!'}]
                                })(
                                    <CheckboxGroup options={base.terminalData} />
                                ) }
                            </FormItem>
                        </Col>
                        <Col span={8}>
                            <FormItem {...formItemLayout} label="促销类型">
                                { getFieldDecorator('salesType', {
                                    initialValue: this.state.role.promotiontype && this.state.role.promotiontype + '' || '',
                                    rules: [{required: true, message: '请选择促销类型!'}]
                                })(
                                    <Select placeholder="请选择促销类型" onChange={this.selectType} disabled={ this.isEdit }>
                                        { base.setOptions(base.salesType) }
                                    </Select>
                                ) }
                            </FormItem>
                        </Col>
                        <Col span={8}>
                            <FormItem {...formItemLayout} label="启用状态">
                                { getFieldDecorator('disabled', {
                                    initialValue: typeof this.state.role.disabled == 'number' && this.state.role.disabled + '' || '',
                                    rules: [{required: true, message: '请选择启用状态!'}]
                                })(
                                    <Select placeholder="请选择启用状态">
                                        <Option value="1">启用</Option>
                                        <Option value="0">停用</Option>
                                    </Select>
                                ) }
                            </FormItem>
                        </Col>
                        <Col span={8}>
                            <FormItem {...formItemLayout} label="店铺">
                                { getFieldDecorator('group', {
                                    initialValue: this.state.groups[0] && this.state.groups[0].groupName || '',
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
                        <Col span={8}>
                            <FormItem {...formItemLayout} label="开始时间">
                                { getFieldDecorator('startTime', {
                                    initialValue: this.state.role.fromtime && moment(this.state.role.fromtime, dateFormat) || moment(),
                                    rules: [{required: true, message: '请选择开始时间!'}]
                                })(<DatePicker style={{width: '100%'}} showTime={{ format: 'HH:mm:ss' }} format="YYYY-MM-DD HH:mm:ss"/>) }
                            </FormItem>
                        </Col>
                        <Col span={8}>
                            <FormItem {...formItemLayout} label="结束时间">
                                { getFieldDecorator('endTime', {
                                    initialValue: this.state.role.totime && moment(this.state.role.totime, dateFormat) || null,
                                    rules: [{type: 'object', required: true, message: '请选择结束时间!'}]
                                })(<DatePicker style={{width: '100%'}} showTime={{ format: 'HH:mm:ss' }} format="YYYY-MM-DD HH:mm:ss"/>) }
                            </FormItem>
                        </Col>
                        <Col span={8}>
                            <FormItem {...formItemLayout} label="描述">
                                { getFieldDecorator('discription', { initialValue: this.state.role.description || '' })(<TextArea rows={4} />) }
                            </FormItem>
                        </Col>
                    </Row>

                    <div className={this.state.salesType == 7 || this.state.role.promotiontype == 7 ? `${styles.show}` : `${styles.hide}`}>
                        <h5>下单立减商品 <Button type="primary" onClick={this.showProductPop.bind(null, 'xdljData')}>添加</Button></h5>
                        <Row className={styles.tablespace}>
                            <Table
                                loading={this.state.loading}
                                columns={xdljCol}
                                dataSource={this.state.xdljData}
                                rowKey={record => record.gcode || record.code}
                            />
                        </Row>
                    </div>

                    <div className={this.state.salesType == 3 || this.state.role.promotiontype == 3 ? `${styles.show}` : `${styles.hide}`}>
                        <h5>主商品 <Button type="primary" onClick={this.showProductPop.bind(null, 'tczspData')} disabled={ this.isEdit }>添加</Button></h5>
                        <Row className={styles.tablespace}>
                            <Table
                                loading={this.state.loading}
                                columns={tczspCol}
                                dataSource={this.state.tczspData}
                                rowKey={record => record.gcode || record.code}
                            />
                        </Row>
                        <h5>关联品 <Button type="primary" onClick={this.showProductPop.bind(null, 'tcglpData')}>添加</Button></h5>
                        <Row className={styles.tablespace}>
                            <Table
                                loading={this.state.loading}
                                columns={tcglpCol}
                                dataSource={this.state.tcglpData}
                                rowKey={record => record.gcode || record.code}
                            />
                        </Row>
                    </div>

                    <div className={this.state.salesType == 1 || this.state.role.promotiontype == 1 ? `${styles.show}` : `${styles.hide}`}>
                        <h5>主商品 <Button type="primary" onClick={this.showProductPop.bind(null, 'zpzspData')}>添加</Button></h5>
                        <Row>
                            <Table
                                loading={this.state.loading}
                                columns={zpzspCol}
                                dataSource={this.state.zpzspData}
                                rowKey={record => record.gcode || record.code}
                            />
                        </Row>
                        <h5>赠品 <Button type="primary" onClick={this.showProductPop.bind(null, 'zpData')}>添加</Button></h5>
                        <Row className={styles.tablespace}>
                            <Table
                                loading={this.state.loading}
                                columns={zpCol}
                                dataSource={this.state.zpData}
                                rowKey={record => record.gcode || record.code}
                            />
                        </Row>
                    </div>

                    <Row gutter={16} style={{ textAlign: 'right' }}>
                        <Col>
                            <Button type="primary" htmlType="submit">保存</Button>
                            <Button style={{marginLeft: 8}} onClick={this.handleReset}>重置</Button>
                        </Col>
                    </Row>
                </Form>

                <Modal
                    width="800px"
                    title="选择商品"
                    visible={this.state.productpop}
                    onCancel={this.hideProductPop}
                    onOk={this.setSelectPros}
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
            </div>
        )
    }
}

export default Form.create()(SalesSave);
