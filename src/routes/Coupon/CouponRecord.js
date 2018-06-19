import React from "react";
import {
  Form,
  Input,
  Table,
  Button,
  Select,
  Row,
  Col,
  DatePicker,
  Modal,
  Checkbox
} from "antd";
import styles from "./coupon.css";
import { couponapi } from "../../models/config";
import request from "../../utils/request";
import base from "../../models/base";
let appkey, clientID, clientSecret, upload, token;
if (/(?:uat|dev)\./.test(document.domain)) {
  appkey = "C73E23AC2B400001C57218701746A360";
  clientID = "C73E23AC2B5000016E801A581E77112A";
  clientSecret = "C73E23AC2B40000169301A56C2F0EE10";
  token = "http://10.122.12.243:8080";
} else {
  appkey = "C73E23AC2760000134621118E3EC3BB0";
  clientID = "C73E23AC27800001C250CBDB79651D19";
  clientSecret = "C73E23AC27700001E4BACAB1988A1CB9";
  token = "https://wngfp.unifiedcloud.lenovo.com";
}
const FormItem = Form.Item;
const Option = Select.Option;
const formItemLayout = {
  labelCol: { span: 7 },
  wrapperCol: { span: 17 }
};
const { RangePicker } = DatePicker;
const pageSize = 10;
class formWrapper extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading1: false,
      loading2: false,
      loading3: false,
      shops: [],
      terminal: [],
      searchData: {},
      preoccupation: [],
      useloglist: [],
      rollbacklist: [],
      tableCol: [
        { key: "id", name: "id" ,disabled:false},
        { key: "userid", name: "会员id" ,disabled:false},
        { key: "salescouponid", name: "优惠券id" ,disabled:false},
        { key: "membercouponrelsid", name: "会员优惠券id",disabled:false},
        { key: "couponcode", name: "核销码",disabled:false},
        { key: "shopid", name: "商城" ,disabled:false},
        { key: "terminal", name: "平台" ,disabled:false},
        { key: "usenumber", name: "使用张数" ,disabled:false},
        { key: "orderid", name: "订单号" ,disabled:false},
        { key: "ordermainid", name: "主单号",disabled:false },
        { key: "orderamount", name: "订单金额" ,disabled:false},
        { key: "realamount", name: "真实抵扣的金额" ,disabled:false},
        { key: "status", name: "优惠券原有状态" ,disabled:false},
        { key: "operatetype", name: "创建来源" ,disabled:false},
        { key: "operate", name: "领取来源",disabled:false },
        { key: "createtime", name: "创建时间" ,disabled:false},
        { key: "updatetime", name: "更新时间" ,disabled:false},
        { key: "createby", name: "操作人",disabled:false },
        { key: "sourceid", name: "来源id" ,disabled:false}
      ],
      downshow: false,
      total1: 0,
      total2: 0,
      total3: 0,
      current1: 1,
      current2: 1,
      current3: 1,
      disabled: false,
      checked:true,
      check: [],
      type: "",
      shopId:""
    };
  }
  componentDidMount() {
    const log = window.loginInfo;
    this.setState({shopId:log.rCode})
    console.log(log);
    // request(`${couponapi}pagePropertiesOpenApi/getShopIds.jhtm`, {
    //   method: "GET"
    // }).then(res => {
    //   if (res.data.code == 200) {
    //     this.setState({ shops: res.data.data || [] });
    //   } else {
    //     base.openNotification("error", res.data.msg);
    //   }
    // });
    this.tranShopName(log.rCode)
    this.searchyz(this.state.current1);
    this.searchsy(this.state.current2);
    this.searchhg(this.state.current3);
    this.getTerminal();
    // let arr = [];
    // for (var { key: k, name: n } of this.state.tableCol) {
    //   arr.push(k + "=" + n);
    // }
    // this.setState({ check: arr });
    // this.props.form.setFields({ outx: { value: arr } });
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
  searchyz(page) {
    this.setState({ loading1: true });
    this.props.form.validateFields((err, values) => {
      let createStartTime =
        (values.createTimeyz && values.createTimeyz[0]
          ? values.createTimeyz[0].format("YYYY-MM-DD")
          : "") || (values.createTime && values.createTime[0]
            ? values.createTime[0].format("YYYY-MM-DD")
            : "");
      let createEndTime =
        (values.createTimeyz && values.createTimeyz[1]
          ? values.createTimeyz[1].format("YYYY-MM-DD")
          : "") || (values.createTime && values.createTime[1]
            ? values.createTime[1].format("YYYY-MM-DD")
            : "");
      request(
        `${couponapi}salesCouponOpenApi/queryMemberReserveLogInfoPage.jhtm?userid=${values.useridyz || values.userid || 
          ""}&salescouponid=${values.salescouponidyz || values.salescouponid || 
          ""}&createtime_start=${createStartTime ||
          ""}&createtime_end=${createEndTime || ""}&shopid=${values.shopidyz || values.shopid || 
          ""}&terminal=${values.terminalyz || values.terminal || ""}&rows=${pageSize}&page=${page}`,
        {
          method: "GET"
        }
      ).then(res => {
        this.setState({ loading1: false });
        if (res.data.code == 200) {
          this.setState({
            preoccupation: res.data.data.datas,
            total1: res.data.data.totalCount
          });
        } else {
          base.openNotification("errer", res.data.msg);
        }
      });
    });
  }
  searchsy(page) {
    this.setState({ loading2: true });
    this.props.form.validateFields((err, values) => {
      let createStartTime =
        (values.createTimesy && values.createTimesy[0]
          ? values.createTimesy[0].format("YYYY-MM-DD")
          : "") ||  (values.createTime && values.createTime[0]
            ? values.createTime[0].format("YYYY-MM-DD")
            : "");
      let createEndTime =
        (values.createTimesy && values.createTimesy[1]
          ? values.createTimesy[1].format("YYYY-MM-DD")
          : "") || (values.createTime && values.createTime[1]
            ? values.createTime[1].format("YYYY-MM-DD")
            : "");
      request(
        `${couponapi}salesCouponOpenApi/queryMemberPaidLogInfoPage.jhtm?userid=${values.useridsy || values.userid || 
          ""}&salescouponid=${values.salescouponidsy || values.salescouponid || 
          ""}&createtime_start=${createStartTime ||
          ""}&createtime_end=${createEndTime || ""}&shopid=${values.shopidsy || values.shopid || 
          ""}&terminal=${values.terminalsy || values.terminal || ""}&rows=${pageSize}&page=${page}`,
        {
          method: "GET"
        }
      ).then(res => {
        this.setState({ loading2: false });
        if (res.data.code == 200) {
          console.log(res.data)
          this.setState({
            useloglist: res.data.data.datas,
            total2: res.data.data.totalCount
          });
        } else {
          base.openNotification("errer", res.data.msg);
        }
      });
    });
  }
  searchhg(page) {
    this.setState({ loading3: true });
    this.props.form.validateFields((err, values) => {
      let createStartTime =
       (values.createTimehg && values.createTimehg[0]
          ? values.createTimehg[0].format("YYYY-MM-DD")
          : "") || (values.createTime && values.createTime[0]
            ? values.createTime[0].format("YYYY-MM-DD")
            : "");
      let createEndTime =
        (values.createTimehg && values.createTimehg[1]
          ? values.createTimehg[1].format("YYYY-MM-DD")
          : "") || (values.createTime && values.createTime[1]
            ? values.createTime[1].format("YYYY-MM-DD")
            : "");
      request(
        `${couponapi}salesCouponOpenApi/queryMemberRollbackLogInfoPage.jhtm?userid=${values.useridhg ||
          ""}&salescouponid=${values.salescouponidhg || values.salescouponid || 
          ""}&createtime_start=${createStartTime ||
          ""}&createtime_end=${createEndTime || ""}&shopid=${values.shopidhg || values.shopid || 
          ""}&terminal=${values.terminalhg || values.terminal || ""}&rows=${pageSize}&page=${page}`,
        {
          method: "GET"
        }
      ).then(res => {
        this.setState({ loading3: false });
        if (res.data.code == 200) {
          console.log(res.data);
          this.setState({
            rollbacklist: res.data.data.datas,
            total3: res.data.data.totalCount
          });
        } else {
          base.openNotification("errer", res.data.msg);
        }
      });
    });
  }
  search =()=>{
    this.setState({current1:1,current2:1,current3:1})
    this.searchhg(1);
    this.searchsy(1);
    this.searchyz(1);
  }
  handleReset = () => {
    this.props.form.resetFields(["salescouponid","userid","createTime","shopid","terminal"]);
    this.props.form.setFields({ 'outx': { value: this.state.check } });
    this.setState({ current1: 1,current2: 1 ,current3: 1}, function () {
      this.searchyz(this.state.current1);
      this.searchsy(this.state.current2);
      this.searchhg(this.state.current3);
    });
};
handleResetyz=()=>{
  this.props.form.resetFields(["salescouponidyz","useridyz","createTimeyz","shopidyz","terminalyz"]);
  this.setState({current1:1},function(){
    this.searchyz(this.state.current1);
  })
}
handleResetsy=()=>{
  this.props.form.resetFields(["salescouponidsy","useridsy","createTimesy","shopidsy","terminalsy"]);
  this.setState({current2:1},function(){
    this.searchsy(this.state.current2);
  })
}
handleResethg=()=>{
  this.props.form.resetFields(["salescouponidhg","useridhg","createTimehg","shopidhg","terminalhg"]);
  this.setState({current3:1},function(){
    this.searchhg(this.state.current3);
  })
}
  getTerminal=()=>{
    request(`${couponapi}pagePropertiesOpenApi/getTerminal.jhtm`, {
        method: 'GET',
    }).then((res) => {
        if (res.data.code == 200) {
            this.setState({ terminal: res.data.data || [] });
        } else {
            base.openNotification('error', res.data.msg)
        }
    });
}
  shopchange = (v)=> {
    this.props.form.setFields({ type: { value: "0" } });
  }
  transformShopId = text => {
    if (text == "20") {
      return "无人店";
    }else if (text == "28") {
      return "Think"
    } else if (text == "58"){
      return "阳光"
    } else if (text =="68"){
      return "百应"
    } else if (text =="78"){
      return "MoTo"
    } else if (text =="88"){
      return "扬天"
    } else if (text == "25"){
      return "消费"
    }else if(text =="35"){
      return "千禧"
    }
  };

  transformTerminal = text => {
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
  transformOperatetype = text => {
    if (text == "0") {
      return "领取";
    } else if (text == "1") {
      return "使用";
    } else if (text == "2") {
      return "规则变更";
    } 
  }
  render() {
    const columnsyz = [
      {
        title: "用户ID",
        dataIndex: "userid",
        key: "userid",
        fixed: "left",
        width:150
      },
      {
        title: "优惠券ID",
        dataIndex: "salescouponid",
        key: "salescouponid",
        fixed: "left",
        width:80
      },
      {
        title: "商城",
        dataIndex: "shopid",
        key: "shopid",
        render: this.transformShopId
      },
      {
        title: "平台",
        dataIndex: "terminal",
        key: "terminal",
        render: this.transformTerminal
      },
      {
        title: "主订单号",
        dataIndex: "ordermainid",
        key: "ordermainid"
      },
      {
        title: "订单号",
        dataIndex: "orderid",
        key: "orderid"
      },
      {
        title: "订单金额",
        dataIndex: "orderamount",
        key: "orderamount"
      },
      {
        title: "优惠商品航向",
        dataIndex: "couponsource",
        key: "couponsource"
      },
      {
        title: "创建人",
        dataIndex: "createby",
        key: "createby"
      },
      {
        title: "创建时间",
        dataIndex: "createtime",
        key: "createtime"
      },
      {
        title: "修改人",
        dataIndex: "updateby",
        key: "updateby"
      },
      {
        title: "更新时间",
        dataIndex: "updatetime",
        key: "updatetime"
      },
      {
        title: "日志产生方式",
        dataIndex: "operatetype",
        key: "operatetype",
        render:this.transformOperatetype
      },
      {
        title: "领取来源",
        dataIndex: "operate",
        key: "operate"
      },
      {
        title: "使用数",
        dataIndex: "usenumber",
        key: "usenumber"
      },
      {
        title: "数据来源",
        dataIndex: "",
        key: "sourceid"
      }
    ];
    const columnssy = [
      {
        title: "用户ID",
        dataIndex: "userid",
        key: "userid",
        fixed: "left",
        width:150
      },
      {
        title: "优惠券ID",
        dataIndex: "salescouponid",
        key: "salescouponid",
        fixed: "left",
        width:80
      },
      {
        title: "商城",
        dataIndex: "shopid",
        key: "shopid",
        render: this.transformShopId
      },
      {
        title: "平台",
        dataIndex: "terminal",
        key: "terminal",
        render: this.transformTerminal
      },
      {
        title: "主订单号",
        dataIndex: "ordermainid",
        key: "ordermainid"
      },
      {
        title: "订单号",
        dataIndex: "orderid",
        key: "orderid"
      },
      {
        title: "订单金额",
        dataIndex: "orderamount",
        key: "orderamount"
      },
      {
        title: "优惠券抵价金额",
        dataIndex: "realamount",
        key: "realamount"
      },
      {
        title: "创建人",
        dataIndex: "createby",
        key: "createby"
      },
      {
        title: "创建时间",
        dataIndex: "createtime",
        key: "createtime"
      },
      {
        title: "修改人",
        dataIndex: "updateby",
        key: "updateby"
      },
      {
        title: "更新时间",
        dataIndex: "updatetime",
        key: "updatetime"
      },
      {
        title: "日志产生方式",
        dataIndex: "operatetype",
        key: "operatetype",
        render:this.transformOperatetype
      },
      {
        title: "领取来源",
        dataIndex: "operate",
        key: "operate"
      },
      {
        title: "使用数",
        dataIndex: "usenumber",
        key: "usenumber"
      },
      {
        title: "数据来源",
        dataIndex: "sourceid",
        key: "sourceid"
      }
    ];
    const columnshg = [
      {
        title: "用户ID",
        dataIndex: "userid",
        key: "userid",
        fixed: "left",
        width:150
      },
      {
        title: "优惠券ID",
        dataIndex: "salescouponid",
        key: "salescouponid",
        fixed: "left",
        width:80
      },
      {
        title: "商城",
        dataIndex: "shopid",
        key: "shopid",
        render: this.transformShopId
      },
      {
        title: "平台",
        dataIndex: "terminal",
        key: "terminal",
        render: this.transformTerminal
      },
      {
        title: "主订单号",
        dataIndex: "ordermainid",
        key: "ordermainid"
      },
      {
        title: "订单号",
        dataIndex: "orderid",
        key: "orderid"
      },
      {
        title: "订单金额",
        dataIndex: "orderamount",
        key: "orderamount"
      },
      {
        title: "创建人",
        dataIndex: "createby",
        key: "createby"
      },
      {
        title: "创建时间",
        dataIndex: "createtime",
        key: "createtime"
      },
      {
        title: "修改人",
        dataIndex: "updateby",
        key: "updateby"
      },
      {
        title: "更新时间",
        dataIndex: "updatetime",
        key: "updatetime"
      },
      {
        title: "日志产生方式",
        dataIndex: "operatetype",
        key: "operatetype",
        render:this.transformOperatetype
      },
      {
        title: "领取来源",
        dataIndex: "operate",
        key: "operate"
      },
      {
        title: "使用数",
        dataIndex: "usenumber",
        key: "usenumber"
      },
      {
        title: "数据来源",
        dataIndex: "sourceid",
        key: "sourceid"
      }
    ];
    const spselect = this.state.shops.map((d, index) => {
      const id = d.shopid + "",
        name = d.name;
      return (
        <Option key={id} value={id}>
          {name}
        </Option>
      );
    });
    const tmselect = this.state.terminal.map((d, index) => {
      const id = d.value + "",
        name = d.label;
      return (
        <Option key={id} value={id}>
          {name}
        </Option>
      );
    });
    const showlist = this.state.tableCol.map((d, index) => {
      const id = d.key,
        name = d.name;
      return (
        <Checkbox
          key={id}
          value={id + "=" + name}
          defaultChecked={this.props.value}
          disabled={d.disabled}
        >
          {name}
        </Checkbox>
      );
    });
    const { getFieldDecorator } = this.props.form;
    const pagination1 = {
      total: this.state.total1,
      current: this.state.current1,
      pageSize: pageSize,
      showQuickJumper: true,
      onChange: (page, pageSize) => {
        this.setState({ current1: page });
        console.log(this.state.current1)
        this.searchyz(page);
      }
    };
    const pagination2 = {
      total: this.state.total2,
      current: this.state.current2,
      pageSize: pageSize,
      showQuickJumper: true,
      onChange: (page, pageSize) => {
        this.setState({ current2: page });
        this.searchsy(page);
      }
    };
    const pagination3 = {
      total: this.state.total3,
      current: this.state.current3,
      pageSize: pageSize,
      showQuickJumper: true,
      onChange: (page, pageSize) => {
        this.setState({ current3: page });
        this.searchhg(page);
      }
    };
    return (
      <div>
        <Form className={styles.form}>
          <Row gutter={16}>
            <Col span={8}>
              <FormItem {...formItemLayout} label="用户ID">
                {getFieldDecorator("userid", { initialValue: ""})(
                  <Input placeholder="请输入用户ID" />
                )}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem {...formItemLayout} label="优惠券ID">
                {getFieldDecorator("salescouponid", { initialValue: "" })(
                  <Input placeholder="请输入优惠券ID" />
                )}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem label="创建时间" {...formItemLayout}>
                {getFieldDecorator("createTime")(
                  <RangePicker format="YYYY-MM-DD" />
                )}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem {...formItemLayout} label="商城">
                {getFieldDecorator("shopid", { initialValue: "20" })(
                  <span>{this.state.shopName}</span>
                )}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem {...formItemLayout} label="终端">
                {getFieldDecorator("terminal", { initialValue: "99" })(
                  <Select placeholder="全部终端">
                    <Option value="99">全部终端</Option>
                    {tmselect}
                  </Select>
                )}
              </FormItem>
            </Col>
            <Col span={8} style={{ textAlign: "right" }}>
              <Button type="primary" onClick={this.search}>
                查询
              </Button>
              <Button style={{ marginLeft: 8 }} onClick={this.handleReset}>重置</Button>
            </Col>
          </Row>
        </Form>
        <h2 style={{ display: "inline", fontWeight: 800 }}>预占日志的条件</h2>
        <Form className={styles.form}>
          <Row gutter={16}>
            <Col span={8}>
              <FormItem {...formItemLayout} label="用户ID">
                {getFieldDecorator("useridyz", { initialValue: ""})(
                  <Input placeholder="请输入用户ID" />
                )}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem {...formItemLayout} label="优惠券ID">
                {getFieldDecorator("salescouponidyz", { initialValue: "" })(
                  <Input placeholder="请输入优惠券ID" />
                )}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem label="创建时间" {...formItemLayout}>
                {getFieldDecorator("createTimeyz")(
                  <RangePicker format="YYYY-MM-DD" />
                )}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem {...formItemLayout} label="商城">
                {getFieldDecorator("shopidyz", { initialValue: "20" })(
                  <span>{this.state.shopName}</span>
                )}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem {...formItemLayout} label="终端">
                {getFieldDecorator("terminalyz", { initialValue: "99" })(
                  <Select placeholder="全部终端">
                    <Option value="99">全部终端</Option>
                    {tmselect}
                  </Select>
                )}
              </FormItem>
            </Col>
            <Col span={8} style={{ textAlign: "right" }}>
              <Button type="primary" onClick={this.searchyz.bind(this,1)}>
                查询
              </Button>
              <Button style={{ marginLeft: 8 }} onClick={this.handleResetyz}>重置</Button>
            </Col>
          </Row>
        </Form>
        <div className={styles.operations}>
          <h2 style={{ display: "inline", fontWeight: 800 }}>预占日志列表</h2>
          <Button
            style={{ marginLeft: "10px", marginBottom: "10px" }}
            onClick={this.out.bind(this, "reserve")}
            type="primary"
          >
            导出
          </Button>
          <Modal
            title="导出列项"
            visible={this.state.downshow}
            onOk={this.handleOk}
            onCancel={this.handleCancel}
            okText="确认导出"
            cancelText="Cancel"
          >
            <FormItem
              {...{ labelCol: { span: 3 }, wrapperCol: { span: 21 } }}
              label=""
            >
              {getFieldDecorator("outx")(
                <Checkbox.Group
                  style={{ width: "100%" }}
                  onChange={this.onChange}
                >
                  {showlist}
                </Checkbox.Group>
              )}
            </FormItem>
          </Modal>
          <Table
            loading={this.state.loading1}
            rowKey="id"
            columns={columnsyz}
            dataSource={this.state.preoccupation}
            pagination={pagination1}
            scroll={{ x: 1600 }}
          />
        </div>
        <h2 style={{ display: "inline", fontWeight: 800 }}>使用日志的条件</h2>
        <Form className={styles.form}>
          <Row gutter={16}>
            <Col span={8}>
              <FormItem {...formItemLayout} label="用户ID">
                {getFieldDecorator("useridsy", { initialValue: ""})(
                  <Input placeholder="请输入用户ID" />
                )}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem {...formItemLayout} label="优惠券ID">
                {getFieldDecorator("salescouponidsy", { initialValue: "" })(
                  <Input placeholder="请输入优惠券ID" />
                )}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem label="创建时间" {...formItemLayout}>
                {getFieldDecorator("createTimesy")(
                  <RangePicker format="YYYY-MM-DD" />
                )}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem {...formItemLayout} label="商城">
                {getFieldDecorator("shopidsy", { initialValue: "20" })(
                  <span>{this.state.shopName}</span>
                )}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem {...formItemLayout} label="终端">
                {getFieldDecorator("terminalsy", { initialValue: "99" })(
                  <Select placeholder="全部终端">
                    <Option value="99">全部终端</Option>
                    {tmselect}
                  </Select>
                )}
              </FormItem>
            </Col>
            <Col span={8} style={{ textAlign: "right" }}>
              <Button type="primary" onClick={this.searchsy.bind(this,1)}>
                查询
              </Button>
              <Button style={{ marginLeft: 8 }} onClick={this.handleResetsy}>重置</Button>
            </Col>
          </Row>
        </Form>
        <div className={styles.operations}>
          <h2 style={{ display: "inline", fontWeight: 800 }}>使用日志列表</h2>
          <Button
            style={{ marginLeft: "10px", marginBottom: "10px" }}
            onClick={this.out.bind(this, "paid")}
            type="primary"
          >
            导出
          </Button>
          <Modal
            title="导出列项"
            visible={this.state.downshow}
            onOk={this.handleOk}
            onCancel={this.handleCancel}
            okText="确认导出"
            cancelText="Cancel"
          >
            <FormItem
              {...{ labelCol: { span: 3 }, wrapperCol: { span: 21 } }}
              label=""
            >
              {getFieldDecorator("outx")(
                <Checkbox.Group
                  style={{ width: "100%" }}
                  onChange={this.onChange}
                >
                  {showlist}
                </Checkbox.Group>
              )}
            </FormItem>
          </Modal>
          <Table
            loading={this.state.loading2}
            rowKey="id"
            columns={columnssy}
            dataSource={this.state.useloglist}
            pagination={pagination2}
            scroll={{ x: 1600 }}
          />
        </div>
        <h2 style={{ display: "inline", fontWeight: 800 }}>回滚日志的条件</h2>
        <Form className={styles.form}>
          <Row gutter={16}>
            <Col span={8}>
              <FormItem {...formItemLayout} label="用户ID">
                {getFieldDecorator("useridhg", { initialValue: ""})(
                  <Input placeholder="请输入用户ID" />
                )}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem {...formItemLayout} label="优惠券ID">
                {getFieldDecorator("salescouponidhg", { initialValue: "" })(
                  <Input placeholder="请输入优惠券ID" />
                )}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem label="创建时间" {...formItemLayout}>
                {getFieldDecorator("createTimesyhg")(
                  <RangePicker format="YYYY-MM-DD" />
                )}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem {...formItemLayout} label="商城">
                {getFieldDecorator("shopidhg", { initialValue: "20" })(
                  <span>{this.state.shopName}</span>
                )}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem {...formItemLayout} label="终端">
                {getFieldDecorator("terminalhg", { initialValue: "99" })(
                  <Select placeholder="全部终端">
                    <Option value="99">全部终端</Option>
                    {tmselect}
                  </Select>
                )}
              </FormItem>
            </Col>
            <Col span={8} style={{ textAlign: "right" }}>
              <Button type="primary" onClick={this.searchhg.bind(this,1)}>
                查询
              </Button>
              <Button style={{ marginLeft: 8 }} onClick={this.handleResethg}>重置</Button>
            </Col>
          </Row>
        </Form>
        <div className={styles.operations}>
          <h2 style={{ display: "inline", fontWeight: 800 }}>回滚日志列表</h2>
          <Button
            style={{ marginLeft: "10px", marginBottom: "10px" }}
            onClick={this.out.bind(this, "rollback")}
            type="primary"
          >
            导出
          </Button>
          <Modal
            title="导出列项"
            visible={this.state.downshow}
            onOk={this.handleOk}
            onCancel={this.handleCancel}
            okText="确认导出"
            cancelText="Cancel"
          >
            <FormItem
              {...{ labelCol: { span: 3 }, wrapperCol: { span: 21 } }}
              label=""
            >
              {getFieldDecorator("outx")(
                <Checkbox.Group
                  style={{ width: "100%" }}
                  onChange={this.onChange}
                >
                  {showlist}
                </Checkbox.Group>
              )}
            </FormItem>
          </Modal>
          <Table
            loading={this.state.loading3}
            rowKey="id"
            columns={columnshg}
            dataSource={this.state.rollbacklist}
            pagination={pagination3}
            scroll={{ x: 1600 }}
          />
        </div>
      </div>
    );
  }
  out(flag) {
    this.props.form.setFieldsValue((err, option) => {
      console.log(option);
    });
    const newCol = this.state.tableCol;
    const arr = [];
    for (let [index,item] of newCol.entries()){
      if(flag == 'reserve'){
        if(item.key == 'realamount' || item.key =='sourceid'){
          item.disabled = true;
        }else{
          arr.push(item.key + "=" + item.name);
        }
      }else if(flag == "rollback"){
        if(item.key == 'realamount'){
          item.disabled = true;
        }else{
          arr.push(item.key + "=" + item.name);
        }
      }else{
        item.disabled = false;
        arr.push(item.key + "=" + item.name);
      }
        
    }
    this.setState({
      type: flag,
      downshow: true,
      tableCol:newCol,
      check:arr
    });
    this.props.form.setFields({ outx: { value: arr } })
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
  handleOk = e => {
    if (!/accessToken=/i.test(document.cookie)) {
      base.openNotification('error', '验证信息出错，请稍后重试!');
      this.initMadp();
      return false;
    }
    this.props.form.validateFields((err, option) => {
      if (option.outx.length > 0) {
        let createStartTime =
          option.createTime && option.createTime[0]
            ? option.createTime[0].format("YYYY-MM-DD")
            : "";
        let createEndTime =
          option.createTime && option.createTime[1]
            ? option.createTime[1].format("YYYY-MM-DD")
            : "";
        request(
          `${couponapi}salesCouponOpenApi/excel/exportExcelMemberSalescouponslogs.jhtm?flag=${this.state.type
          }&userid=${option.userid || ''}&createtime_end=${createEndTime}&createtime_start=${createStartTime}&shopid=${
            option.shopid
          }&terminal=${
            option.terminal
          }`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded;charset=utf-8"
            },
            body:`exporttitle=${this.props.form.getFieldValue("outx").toString()}`
          }
        ).then(res => {
          if (res.data.code == 200) {
            window.open(res.data.data);
            this.setState({ downshow: false })
          } else {
            base.openNotification("error", res.data.msg);
          }
        });
      } else {
        base.openNotification("error", "导出列项不能为空");
      }
    });
  };
  handleCancel = e => {
    console.log(e);
    this.setState({
      downshow: false
    });
  };
}
const CouponRecord = Form.create()(formWrapper);
export default CouponRecord;
