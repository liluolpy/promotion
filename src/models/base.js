import request from '../utils/request';
import { domain } from '../models/config';

import {notification, Select} from 'antd';

export default {
    toFixed: function (num, s) {
        let times = Math.pow(10, s);
        let des = num * times + 0.5;
        des = parseInt(des, 10) / times;
        return des;
    },

    openNotification : function (type, desc){
        notification[type]({
            message: '提示信息',
            description: desc
        })
    },

    shopsData: [{"code": "20", "name": "无人店"}, {"code": "28", "name": "Think"}, {"code": "68", "name": "百应"}],

    getShopIds: function(){
        let _arr = [];

        for(let i=0; i<this.shopsData.length; i++){
            _arr.push(this.shopsData[i].code);
        }

        return _arr;
    },

    transformNameById : function(data, id){
        for(let i=0; i<data.length; i++){
            if(data[i].code == id){
                return data[i].name;
            }
        }
    },

    transformCoupon: function(text, record){
        let type = '', flag = record.couponType || record.usescope;

        switch (flag){
            case 1:
                type = '服务券';
                break;
            case 2:
                type = '代金券';
                break;
            case 3:
                type = '满减券';
                break;
            case 4:
                type = '折扣券';
                break;
        }

        return type;
    },

    //salesType: [{"code": "3", "name": "套餐"}, {"code": "7", "name": "下单立减"}],
    salesType: [{"code": "3", "name": "套餐"}, {"code": "7", "name": "下单立减"}, {"code": "1", "name": "赠品"}, {"code": "4", "name": "下单立赠"}],

    setOptions: function (data) {
        let _options = [];

        for(let i=0; i<data.length; i++){
            _options.push(<Select.Option value={data[i].code} key={data[i].code}>{ data[i].name }</Select.Option>);
        }

        return _options;
    },

    tlist: function (data) {
        let re = [];
        if (data) {
            re = data.map((d, index) => {
                const id = d.id + '', name = d.text;
                return <Select.Option key={id} value={id}>{name}</Select.Option>
            });
        }
        return re;
    },

    terminalData: [{ value: '1', label: 'PC' }, { value: '2', label: 'WAP' }, { value: '3', label: 'APP' }, { value: '4', label: 'Wechat' }],

    transformTerminal: function(ids){
        let _html = [],
            _ids = ids.split(",");

        for(let i=0; i<_ids.length; i++){
            for(let q=0; q<this.terminalData.length; q++){
                if(_ids[i] == this.terminalData[q].value){
                    _html.push(this.terminalData[q].label);
                }
            }
        }

        return _html.join(",");
    },
    toThousands: function (num) {
        var num = (num || 0).toString(), result = '';
        while (num.length > 3) {
            result = ',' + num.slice(-3) + result;
            num = num.slice(0, num.length - 3);
        }
        if (num) { result = num + result; }
        return result;
    },

    getFaInfo(){
        let appkey = loginInfo.appKey;
        return request(`${domain}pcsd-newretail-ac/newretail-acl/application/dataPermission?dataIds=5f478c76af4e6d12&appKey=${appkey}`, {
            method: 'GET',
        })
    }
}
