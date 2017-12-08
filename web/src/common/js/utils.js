import {
    RegexEnum
} from './enum/regexEnum'; // 正则规则枚举
var glob = require('src/store/states').glob;
import {cityOptionsWrap}  from 'src/store/states';
// 公共工具类
export const CommonUtils = {
    isEmptyOrNull(v) { // 判断字符串是否为空
        return typeof (v) === 'undefined' || v == '' || v == null ? true : false;
    },
    isObject(v) { // 判断是否为对象
        if (Object.prototype.toString.call(v) == '[object Array]') {
            return false;
        }
        return typeof (v) === 'object' || v != null ? true : false;
    },
    isArray(v) { // 判断是否为数组
        return Object.prototype.toString.call(v) === '[object Array]';
    },
    isNodeList(v) { // 判断是否为节点集
        return Object.prototype.toString.call(v) === '[object NodeList]';
    },
    isInputElement(v) { // 判断是否为input元素
        return Object.prototype.toString.call(v) === '[object HTMLInputElement]';
    },
    isFunction(v) { // 判断是否为函数
        return typeof (v) === 'function';
    },
    isNumber(v) { // 判断是否为整数
        return typeof (v) === 'number';
    },
    isString(v) { // 判断是否为字符串
        return typeof (v) === 'string';
    },
    formIsNull(els, debug, tips) { // 验证表单是否为空聚焦
        /**
         * 正则统一验证函数
         * @param (els : object) 元素对象
         * @param (debug : boolean) 弹出框
         * @param (tips : string) 弹出框提示内容
         * @return Boolean
         */
        let elArray = [];
        if (CommonUtils.isNodeList(els)) {
            elArray = Array.from(els); // 将节点集转换成数组
        }
        if (CommonUtils.isArray(els)) {
            elArray = els;
        }

        function _tips(el, _debug) { // 提示/测试
            let flag = false;
            if (!CommonUtils.isEmptyOrNull(el.value)) {
                flag = true;
                return flag;
            }
            el.focus();
            if (!_debug) {
                return flag;
            }
            if (CommonUtils.isEmptyOrNull(tips)) {
                alert('请填写输入框...');
                return flag;
            }
            alert(tips);
            return flag;
        }
        if (CommonUtils.isInputElement(els)) { // 单个验证
            if (!CommonUtils.isEmptyOrNull(els.value)) {
                return false;
            }
            if (!_tips(els, debug, tips)) {
                return false;
            }
        }
        for (let el of elArray) { // 多个验证
            if (!_tips(el, debug, tips)) {
                return false;
            }
        }
        return true;
    },
    regValidator(regx, value) {
        /**
         * 正则统一验证函数
         * @param (regex : regex) 正则规则
         * @param (value : Objext) 值
         * @return Boolean
         */
        if (CommonUtils.isEmptyOrNull(regx) || CommonUtils.isEmptyOrNull(value) || CommonUtils.isArray(value)) {
            // throw new Error('参数有误...');
            return false;
        }
        return regx.test(value);
    },
    elmRegValidator(rules, value, callback) {
        /**
         * 饿了么Form表单验证
         * @param (rules: reg)      验证规则
         * @param (rules: message)  提示信息
         * @param value             输入的值
         * @param callback          回调函数
         * @param (empty: boolean)  允许空值
         */

        //如果是省份选择 reg不必存在， 省份(100000) 和 城市(100100) 默认的时候也返回错误提示
        if (!rules.reg && (value == '100000' || value == '100100')) {
          return callback(new Error(rules.message)); //返回错误提示
        }

        /*如果允许为空 但不为空的时候需做验证*/
        if(rules.empty){
            if(value != '' && !rules.reg.test(value)){
                return callback(new Error(rules.message));
            }else{
                return callback()
            }
        }

        if (rules.reg && !rules.reg.test(value)) {
            return callback(new Error(rules.message)); // 返回错误提示
        }

        /* 验证是否唯一 */
        if(rules.checkSole){
            if(rules.checkSole && rules.oldValue != value){
                let params = {};
                params[rules.prop] = value;
                rules._this.$api.checkedSole(params, (success)=>{
                    if(success.code == 200){
                        return callback();
                    }else{
                        rules.message = success.info;
                        return callback(new Error(success.message));
                    }
                }, (error)=>{})
            }else{
                return callback();
            }
        }
        else{
            return callback();
        }
    },
    roleValidator(rules, value, callback) {
        if (rules.reg && !rules.reg.test(value)) {
            return callback(new Error(rules.message)); // 返回错误提示
        }
        return callback();
    },
    getDefaultPath(path = '/login') { // 默认跳转页面
        // window.location.href = window.location.origin + '/login';
        window.location.href = window.location.origin;
    },
    delayFunc(callback, times = 1000) {
        if (!this.isFunction(callback)) {
            throw TypeError('不是一个函数.');
        }
        setTimeout(callback, times);
    },
    getStatementObj(statements, disables){ //获取报表列头部信息
        /**
         * @param (statements: array)   报表列对象 [{},{}]
         * @param (disables: string)    导出excel时，屏蔽不需要导出的列的key  多个列用逗号分隔 'a,b,c'
         */
        let table = {
            header: [],
            headerKey: [],
            headerText: []
        }
        for(let i=0, len=statements.length; i<len; i++ ){
            if(statements[i].show){ //如果show == true 则显示
                let obj = {
                    prop: statements[i].prop,
                    text: statements[i].text,
                    show: statements[i].show,
                    module: statements[i].module || '',
                    child: statements[i].child || '',
                }
                //是否存在表头子级
                if(statements[i].children != '' && statements[i].children != undefined && statements[i].children != null){
                    obj.children = statements[i].children;
                }
                if(statements[i].width != '' && statements[i].width != undefined && statements[i].width != null){
                    obj.width = statements[i].width;
                }
                table.header.push(obj);
                if(disables){
                    let reg = new RegExp(statements[i].prop); //验证规则
                    if(!reg.test(disables)){ //在导出excel表数据的时候 不屏蔽的列
                        table.headerKey.push(statements[i].prop);
                        table.headerText.push(statements[i].text);
                    }
                }else{
                    table.headerKey.push(statements[i].prop);
                    table.headerText.push(statements[i].text);
                }
            }
        }
        return table;
    },
    getTableHeight(_this, table, container, header, pagebar, height){ // 获取表格部分最大高度
        _this.$nextTick(() => {
            _this[table] = _this.$refs[container].offsetHeight -  _this.$refs[header].offsetHeight - _this.$refs[pagebar].offsetHeight - height - 40;
        })
    },
    getTableHeightOnsize(that, proto, heightCb) {   // 根据窗口大小变动;
        that.$nextTick(() => {
            // addEventListener()
            that[proto] = CommonUtils.getTableHeightByOrvide(...heightCb());
            let firstOnResizeFire = true;
            window.onresize = (event) => {
                if (!firstOnResizeFire) return;
                firstOnResizeFire = false;
                that[proto] = CommonUtils.getTableHeightByOrvide(...heightCb());
                firstOnResizeFire = true;
            };
        });
    },
    getTableHeightByOrvide(...heights) {  // 数值取最大值减其他值;
        let sum = 0;
        sum = heights.find(item => sum < item);
        heights.forEach(item => {
            if (sum !== item) {
                sum = sum - item;
            };
        });
        return parseInt(sum);
    },
    setResize(which, callback, time) {
        /**
        * 这个是监听浏览器缩放响应事件（setResize和resetResize一般要一起使用）
        * 建议是在mounted事件里写
        * which: 定时器的data值
        * time：定时器间隔时间,建议默认200，可以另外设置
        * callback：函数节流回调函数
        */
        time = time? time : 200;
        window.onresize = ()=>{  
            clearTimeout(which);
            which = setTimeout(()=>{
                if(callback) callback();
            },time)
        }
    },
    resetResize() {
        /**
        * 这个是重置监听浏览器缩放响应事件
        * 建议在beforeDestroy事件里写
        */
        window.onresize = '';
    },
  /**
   * 处理新增权限显示列表项
   * 到权限新增页再调用
   * account：登陆时候拿到的账号权限数据
   * */
    changeData(account){
    var that = this;
    var permissionsList = account.info.permissionsList;
    if(permissionsList!= null){
      var OldArr =JSON.parse(JSON.stringify(cityOptionsWrap))
      OldArr.forEach((f, index) => {
        var parentShow = 0;
        f.roleType.forEach((item, ide) => {
          var bigBol = false;
          var permission = [0,0,0,0];
          item.forEach((ite, i) => {
            var bol = false
            if(ite.ifShow == true){
              permissionsList.roleType.forEach(( perItem, perIndex)=>{
                if(ite.state == perItem.operate && i == 0){
                  bol = true;//查到改值就显示
                  parentShow++;
                  bigBol = true;
                  permission = perItem.permmissions;
                  return
                }else if(i != 0){
                  if(permission[i-1]==0){//(非第一个，修改，删除，新增)
                    if(ite.ifShow){//原本显示的
                      ite.ifShow = false
                      f.OptionsLen--;
                    }
                  }
                }
              })
            }
          })
          if(!bigBol){//该权限不在，全部都删除（新增，修改，删除）
            f.OptionsLen--;
            item.forEach(function (_item,_index) {
              _item.ifShow = false
            })
          }
        });
        if(parentShow == 0){
          f.paeShow = false;
        }

      })
      Storage.setObj("cityOptions",OldArr);
    }else{
      Storage.setObj("cityOptions",glob.cityOptions);
    }
  },
    setPermission(data,navList) {
        /**
        * 这个是用于过滤权限，设置显示隐藏
        * 在login.vue和App.vue里有用到
        * data: 后台返回的权限列表
        * navList：前端设置的导航列表
        */
        let arr = JSON.parse(JSON.stringify(navList));//深拷贝导航数组，避免退出登录之后更换超级管理员账号permissionsList是null会引用旧的导航数据
        
        if(data && data.roleType && data.roleType.length !== 0){
            //以下是Anne show time
            arr.forEach(function (item,index) {
                /*最外层*/
                if(item.childs){
                    //1
                    var fFalseLen = 0;
                    var foldSLen = item.childs.length;
                    item.childs.forEach(function (ite,ind) {
                        //2
                        if(ite.childs){
                            var sFalseLen = 0;
                            var oldSLen = ite.childs.length;
                            ite.childs.forEach(function (_item,_index) {
                                var per = ifHaves(_item.operate);
                                _item.ifShow = per.bol;
                                _item.permmission = per.permmission;
                                if(per.bol==false){
                                   sFalseLen++;
                                }
                            })
                            if(sFalseLen==oldSLen){//第三层都是false，爸爸也是false
                               ite.ifShow = false;
                            }
                       }else{
                            // 只有两层
                            var perObj = ifHaves(ite.operate);
                            ite.ifShow = perObj.bol;
                            console.log(ite.operate)
                            console.log("zhi");
                            console.log(ite);
                            console.log(perObj)
                            console.log("liang")
                            ite.permmission = perObj.permmission;
                            if(perObj.bol == false){
                               fFalseLen++;
                            }
                       }
                    })
                    if(fFalseLen == foldSLen){//第二层都是false，爸爸也是false
                        item.ifShow = false;
                    }
                    var bigW = 0;
                    item.childs.forEach(function (iten,indx) {
                        if(iten.ifShow == false){
                           bigW++;
                        }
                    })
                    if(bigW == item.childs.length){
                        item.ifShow = false;
                    }
                }else{
                    if(item.operate){
                        var noPer = ifHaves(item.operate);
                        item.ifShow = noPer.bol;
                    }
                }
            });
        }
        return arr;       

        function ifHaves(value){
            var roleType = data.roleType;//后台拿到的权限数据
            var bol = false;
            var permmission = ['0','0','0','0'];
            roleType.forEach(function (item) {
                if( item.operate == value){
                    permmission = item.permmissions;
                    bol = true;
                }
            })
            return{
                bol:bol,
                permmission:permmission
            }
        }
    }
}

// 正则工具类
export const RegexUtils = {
    accountFormat(v) {  //账户格式
        return CommonUtils.regValidator(RegexEnum.ISACCOUNT, v);
    },
    phoneFormat(v) { // 手机格式
        return CommonUtils.regValidator(RegexEnum.ISMOBILE, v);
    },
    TelFormat(v) { // 座机格式
        return CommonUtils.regValidator(RegexEnum.TELPHONE, v);
    },
    email(v) { // 邮箱
        return CommonUtils.regValidator(RegexEnum.EMAIL, v);
    },
    userName(v) { // 用户名格式
        return CommonUtils.regValidator(RegexEnum.USERNAME, v);
    },
    isName(v) { // 名称
        return CommonUtils.regValidator(RegexEnum.NAME, v);
    },
    isPassword(v) { // 检测密码格式
        return CommonUtils.regValidator(RegexEnum.ISPWD, v);
    },
    isNumber(v) { // 是否为数字
        return CommonUtils.regValidator(RegexEnum.NUMBER, v);
    },
    lowLevel(v) { // 弱密码格式
        return CommonUtils.regValidator(RegexEnum.LOWPWD, v);
    },
    highLevel(v) { // 强密码格式
        return CommonUtils.regValidator(RegexEnum.HIGHPWD, v);
    },
    isMileage(v) { // Mileage
        return CommonUtils.regValidator(RegexEnum.MILEAGE, v);
    },
    isCost(v) { // COST
        return CommonUtils.regValidator(RegexEnum.COST, v);
    },
    isErrorCost(v) { // setError COST
        return CommonUtils.regValidator(RegexEnum.ERRORCOST, v);
    },
    isUrl(v) { // 匹配url地址
        return CommonUtils.regValidator(RegexEnum.URL, v);
    }
}

// 对Array的扩展
// 添加元素（含重复）
Array.prototype.add = function (val) {
    if (CommonUtils.isEmptyOrNull(val)) return false;
    this.push(val);
    return true;
}

// 添加元素（去除重复）
Array.prototype.addSet = function (val) {
    if (CommonUtils.isEmptyOrNull(val)) return false;
    for (var i = 0; i < this.length; i++) {
        if (typeof (this[i]) === val) break;
        this[i].push(val);
    }
    return true;
}

// 根据角标删除
Array.prototype.removeByIndex = function (index) {
    return !CommonUtils.isEmptyOrNull(this.splice(index, 1));
}

// 根据值删除
Array.prototype.removeByValue = function (val) {
    for (var i = 0; i < this.length; i++) {
        if (typeof (this[i]) === val) {
            this.splice(i, 1);
            return true;
        }
        return false;
    }
}

Array.prototype.indexOf = function(val) {
  for (var i = 0; i < this.length; i++) {
    if (this[i] == val) return i;
  }
  return -1;
};
Array.prototype.removeArray = function(val) {
  var index = this.indexOf(val);
  if (index > -1) {
    this.splice(index, 1);
  }
};

/**
 * 将数据转换成base64
 * @param {any} str
 * @returns
 */
function base64encode(str) {
    var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    var output = "";
    var chr1, chr2, chr3 = "";
    var enc1, enc2, enc3, enc4 = "";
    var i = 0;
    var input = utf16to8(str);
    do {
        chr1 = input.charCodeAt(i++);
        chr2 = input.charCodeAt(i++);
        chr3 = input.charCodeAt(i++);
        enc1 = chr1 >> 2;
        enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
        enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
        enc4 = chr3 & 63;
        if (isNaN(chr2)) {
            enc3 = enc4 = 64;
        } else if (isNaN(chr3)) {
            enc4 = 64;
        }
        output = output + keyStr.charAt(enc1) + keyStr.charAt(enc2) + keyStr.charAt(enc3) + keyStr.charAt(enc4);
        chr1 = chr2 = chr3 = "";
        enc1 = enc2 = enc3 = enc4 = "";
    } while (i < input.length);
    return output;

}
/**
 *
 * @param {*} str
 */
function utf16to8(str) {
    var out, i, len, c;
    out = "";
    len = str.length;
    for (i = 0; i < len; i++) {
        c = str.charCodeAt(i);
        if ((c >= 0x0001) && (c <= 0x007F)) {
            out += str.charAt(i);
        } else if (c > 0x07FF) {
            out += String.fromCharCode(0xE0 | ((c >> 12) & 0x0F));
            out += String.fromCharCode(0x80 | ((c >> 6) & 0x3F));
            out += String.fromCharCode(0x80 | ((c >> 0) & 0x3F));
        } else {
            out += String.fromCharCode(0xC0 | ((c >> 6) & 0x1F));
            out += String.fromCharCode(0x80 | ((c >> 0) & 0x3F));
        }
    }
    return out;
}

/**
 * 本地保存父类
 */
class StorageS {
    constructor(storage) {
        if (!storage) {
            return new Error('当前浏览器不支持本地存储...');
        }
        this.storage = storage;
    }
    setItem(key, value) { // 保存单个字符串
        if (this.storage == null || CommonUtils.isEmptyOrNull(key) || CommonUtils.isEmptyOrNull(value) || !CommonUtils.isString(value)) {
            return;
        }
        console.log(key)
        this.storage.setItem(key, value);
    }
    getItem(key) { // 获取单个字符串
        if (this.storage == null || CommonUtils.isEmptyOrNull(key)) {
            return null;
        }
        if (CommonUtils.isEmptyOrNull(this.storage.getItem(key))) {
            return null;
        }
        return this.storage.getItem(key);
    }
    setObj(key, value) { // 保存json对象
        if (this.storage == null || CommonUtils.isEmptyOrNull(key) || CommonUtils.isEmptyOrNull(value)) {
            return;
        }
        if (!CommonUtils.isObject(value) && CommonUtils.isString(value)) {
            this.storage.setItem(key, value);
            return;
        }
        this.storage.setItem(key, JSON.stringify(value));
    }
    getObj(key) { // 获取json对象
        if (this.storage == null || CommonUtils.isEmptyOrNull(key)) {
            return null;
        }
        if (CommonUtils.isEmptyOrNull(this.storage.getItem(key))) {
            return null;
        }
        return JSON.parse(this.storage.getItem(key));
    }
    remove(key) { // 删除本地存储
        if (this.storage == null || CommonUtils.isEmptyOrNull(key)) {
            return true;
        }
        if (CommonUtils.isEmptyOrNull(this.storage.getItem(key))) {
            return true;
        }
        this.storage.removeItem(key);
        if (!CommonUtils.isEmptyOrNull(this.storage.getItem(key))) {
            return false;
        }
        return true;
    }
    clear() {
        this.storage.clear();
    }
}

// 本地存储对象
class LocalStorage extends StorageS {
    constructor() {
        super(window.localStorage);
    }
}
export const Storage = new LocalStorage();

// 会话存储对象
class SessionStorage extends StorageS {
    constructor() {
        super(window.sessionStorage);
    }
}
export const SessionLocal = new SessionStorage();

// 登录用户信息
class LoginAccount {
    constructor() {
        this.LocalStorage = new LocalStorage();
    }
    getToken(name = 'account') { // 登录返回的token
        let account = this.LocalStorage.getObj(name);
        if (CommonUtils.isEmptyOrNull(account)) {
            return '';
        }
        return account.token;
    }
    getUserInfo(name = 'account') { // 获取登录用户信息
        let account = this.LocalStorage.getObj(name);
        if (CommonUtils.isEmptyOrNull(account)) {
            CommonUtils.getDefaultPath();
        }
        return account.info;
    }
    getCompany(name = 'account') { // 获取登录公司名称
        let account = this.LocalStorage.getObj(name);
        if (CommonUtils.isEmptyOrNull(account)) {
            return '';
        }
        return account.info.name;
    }
}

export const Account = new LoginAccount();
/**
 * Cookie对象
 * @param {string} name
 * @param {string} value
 * @param {string} time 注意：d 代表天; h 代表小时; m 代表分钟
 * @class CookieStorage
 */
class CookieStorage {
    setCookie(name, value, time) {
        if (CommonUtils.isEmptyOrNull(name) || CommonUtils.isEmptyOrNull(value)) {
            return;
        }
        let date = new Date();
        let times = 0;
        if (time.charAt(0).toLowerCase() === 'd') { // 以天为单位
            times = parseInt(time.substr(1));
            date.setTime(date.getTime() + times * 24 * 60 * 60 * 1000);
        } else if (time.charAt(0).toLowerCase() === 'h') { // 以小时为单位
            times = parseInt(time.substr(1));
            date.setTime(date.getTime() + times * 60 * 60 * 1000);
        }
        document.cookie = name + '=' + escape(value) + ' ;expires=' + date.toGMTString();
    }
    getCookie(name) {
        if (CommonUtils.isEmptyOrNull(name)) {
            return;
        }
        let reg = new RegExp('(^| )' + name + '=([^;]*)(;|$)');
        let arr = document.cookie.match(reg);
        if (!CommonUtils.isArray(arr)) {
            return null;
        }
        return unescape(arr[2]);
    }
    clearCookie(name) {
        let cookie = this.getCookie(name);
        if (CommonUtils.isEmptyOrNull(name) || CommonUtils.isEmptyOrNull(cookie)) {
            return;
        }
        let date = new Date();
        date.setTime(date.getTime() - 1);
        document.cookie = name + '=' + cookie + ' ;expires=' + date.toGMTString();
    }
}
export const Cookie = new CookieStorage();

// 对Date的扩展，将 Date 转化为指定格式的String
// 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符，
// 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
// 例子：
// (new Date()).Format("yyyy-MM-dd HH:mm:ss.S") ==> 2006-07-02 08:09:04.423
// (new Date()).Format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18
Date.prototype.Format = function (fmt) {
    var o = {
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate(), //日
        "H+": this.getHours(), //小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        S: this.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt))
        fmt = fmt.replace(
            RegExp.$1,
            (this.getFullYear() + "").substr(4 - RegExp.$1.length)
        );
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt))
            fmt = fmt.replace(
                RegExp.$1,
                RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length)
            );
    return fmt;
};

//扩展, 获取当月最后一天
Date.prototype.GetLastDay = function () {
    var has31 = [1, 3, 5, 7, 8, 10, 12];
    var nowYear = this.getFullYear();
    var nowMonth = this.getMonth() + 1;
    nowMonth = nowMonth >= 10 ? nowMonth : '0' + nowMonth;
    var nowDay = 0;
    if (nowMonth == 2) {
        if (nowYear % 4 === 0 && nowYear % 100 !== 0) {
            nowDay = 29
        } else {
            nowDay = 28
        }
    } else if (has31.indexOf(Number(nowMonth)) !== -1) {
        nowDay = 31
    } else {
        nowDay = 30
    }
    return nowYear + '/' + nowMonth + '/' + nowDay;
};

//扩展, 获取上n个月第一天
Date.prototype.GetLastMonthFirstDay = function (n) {
  var nowYear = this.getFullYear();
  var nowMonth = this.getMonth();
  if(nowMonth <= n-1) {
    nowYear -= 1;
    nowMonth = 12 - n + nowMonth;
  } else nowMonth -= (n-1)
  nowMonth = nowMonth >= 10 ? nowMonth : '0' + nowMonth;
  return nowYear + '/' + nowMonth + '/' + '01';
};

//扩展, 获取上月最后一天
Date.prototype.GetLastMonthLastDay = function () {
  var has31 = [1, 3, 5, 7, 8, 10, 12];
  var nowYear = this.getFullYear();
  var nowMonth = this.getMonth();
  if(nowMonth == '0') {
    nowYear -= 1;
    nowMonth = 12;
  }
  nowMonth = nowMonth >= 10 ? nowMonth : '0' + nowMonth;
  var nowDay = 0;
  if (nowMonth == 2) {
    if (nowYear % 4 === 0 && nowYear % 100 !== 0) {
      nowDay = 29
    } else {
      nowDay = 28
    }
  } else if (has31.indexOf(Number(nowMonth)) !== -1) {
    nowDay = 31
  } else {
    nowDay = 30
  }
  return nowYear + '/' + nowMonth + '/' + nowDay;
};

// 扩展, 获取本周的开始日期
Date.prototype.GetWeekStartDate = function () {
    var nowDayOfWeek = this.getDay(); //今天本周的第几天
    var nowDay = this.getDate(); //当前日
    var nowMonth = this.getMonth(); //当前月
    var nowYear = this.getFullYear(); //当前年
    var weekStartDate = new Date(nowYear, nowMonth, nowDay - nowDayOfWeek + 1);
    return weekStartDate.Format("yyyy/MM/dd")
};

// 扩展, 获取本周的结束日期
Date.prototype.GetWeekEndDate = function () {
    var nowDayOfWeek = this.getDay(); // 今天本周的第几天
    var nowDay = this.getDate(); // 当前日
    var nowMonth = this.getMonth(); // 当前月
    var nowYear = this.getFullYear(); // 当前年
    var weekEndDate = new Date(nowYear, nowMonth, nowDay + (7 - nowDayOfWeek));
    return weekEndDate.Format('yyyy/MM/dd');
};

// 扩展, 获取上周的开始日期
Date.prototype.GetLastWeekStartDate = function () {
  var nowDayOfWeek = this.getDay(); //今天本周的第几天
  var nowDay = this.getDate(); //当前日
  var nowMonth = this.getMonth(); //当前月
  var nowYear = this.getFullYear(); //当前年
  var weekLastStartDate = new Date(nowYear, nowMonth, nowDay - nowDayOfWeek - 6);
  return weekLastStartDate.Format("yyyy/MM/dd")
};

// 扩展, 获取上周的结束日期
Date.prototype.GetLastWeekEndDate = function () {
  var nowDayOfWeek = this.getDay(); // 今天本周的第几天
  var nowDay = this.getDate(); // 当前日
  var nowMonth = this.getMonth(); // 当前月
  var nowYear = this.getFullYear(); // 当前年
  var weekLastEndDate = new Date(nowYear, nowMonth, nowDay - nowDayOfWeek);
  return weekLastEndDate.Format('yyyy/MM/dd');
};

// 扩展， 获取最近七天
// 2017-04-13 TODO 需完善
// 简化功能
Date.prototype.GetSevenDays = function (type = '') {
    let days = [];
    let nowDay = this.getDate();
    let nowMonth = this.getMonth() + 1;
    let nowYear = this.getFullYear();
    let has31 = [1, 3, 5, 7, 8, 10, 12];

    for (let i = 0; i < 7; ++i) {
        if (nowDay === 0) {
            nowMonth -= 1;
            if (nowMonth === 2) {
                nowDay = nowYear % 4 === 0 && nowYear % 100 !== 0 ? 29 : 28;
            } else {
                nowDay = has31.indexOf(nowMonth) !== -1 ? 31 : 30;
            }
        }
        if (nowMonth === 0) {
            nowYear -= 1;
            nowMonth = 12;
        }
        switch (type) {
            case 'y':
                days.push(`${nowYear}/${nowMonth >= 10 ? nowMonth : '0' + nowMonth}/${nowDay >= 10 ? nowDay : '0' + nowDay}`);
                break;
            case 'm':
                days.push(`${nowMonth >= 10 ? nowMonth : '0' + nowMonth}/${nowDay >= 10 ? nowDay : '0' + nowDay}`);
                break;
            case 'd':
                days.push(`${nowDay >= 10 ? nowDay : '0' + nowDay}`);
                break;
            default:
                days.push(parseInt(nowDay));
                break;
        }
        nowDay -= 1;
    }
    return days.reverse();
};

// 扩展， 按类别获取最近七个
Date.prototype.GetSeven = function (type) {
    let arr = [];
    let nowYear = this.getFullYear();
    let nowMonth = this.getMonth() + 1;
    if (type === 'd') {
        return this.GetSevenDays({
            y: true
        })
    } else if (type === 'm') {
        for (let i = 0; i < 7; ++i) {
            arr.push(`${nowYear}/${nowMonth >= 10 ? nowMonth : '0' + nowMonth}`);
            nowMonth -= 1;
            if (nowMonth === 0) {
                nowMonth = 12;
                nowYear -= 1
            }
        }
    } else if (type === 'y') {
        for (let i = 0; i < 7; ++i) {
            arr.push(`${nowYear}`);
            nowYear -= 1
        }
    }
    return arr.reverse()
}

/***
 * 转换成时间差
 * @param  nTime  时间差(时间戳)
 */
Date.prototype.subtractTime =function (nTime) {
    // var days = Math.floor(nTime / (24 * 3600))
    // var leave1 = nTime % (24 * 3600)    //计算天数后剩余的毫秒数
    var hours = Math.floor(nTime / (3600))
    var leave2 = nTime % (3600)      //计算小时数后剩余的毫秒数
    var minutes = Math.floor(leave2 / (60))
    var leave3 = leave2 % (60)      //计算分钟数后剩余的毫秒数
    var seconds = Math.round(leave3)
    return   hours + "时" + minutes + "分" + seconds + "秒"
}

class Debugger {
    constructor() {
        this.sty = {fs: '', color: '', bc: '', pd: '', bd: '', bdrs: ''};
        this.isty = ['18px', '#008b8b', '#006400', '2px', '1px solid #ffa500', '2px'];
        this.esty = ['18px', '#b22222', '#b22222', '2px', '1px solid #ffa500', '2px'];
        this.wsty = ['18px', '#daa520', '#006400', '2px', '1px solid #ffa500', '2px'];
        this.psty = ['18px', '#4b0082', '#006400', '2px', '1px solid #ffa500', '2px'];
    }
    debug(fuc) { // 测试执行时间
        let start = new Date().getMilliseconds();
        console.log('%c%s', 'color: #00008b', '**************** 开始打印 (' + start + 'ms) ****************');
        fuc();
        let end = new Date().getMilliseconds();
        console.log('%c%s', 'color: #00008b', `********* 结束打印 (${end}ms --> 耗时：${end - start}ms) *********`);
    }
    printI(msg) { // 普通打印
        let start = new Date().getMilliseconds();
        console.log('%c%s', 'color: #00008b', '**************** 开始打印 (' + start + 'ms) ****************');
        console.log('%c%o', this.getStyle(this.getStyleObj(...this.isty)), msg);
        let end = new Date().getMilliseconds();
        console.log('%c%s', 'color: #00008b', `********* 结束打印 (${end}ms --> 耗时：${end - start}ms) *********`);
    }
    printE(msg) { // 错误打印
        let start = new Date().getMilliseconds();
        console.log('%c%s', 'color: #00008b', '**************** 开始打印 (' + start + 'ms) ****************');
        console.log('%c%o', this.getStyle(this.getStyleObj(...this.esty)), msg);
        let end = new Date().getMilliseconds();
        console.log('%c%s', 'color: #00008b', `********* 结束打印 (${end}ms --> 耗时：${end - start}ms) *********`);
    }
    printW(msg) { // 报警打印
        let start = new Date().getMilliseconds();
        console.log('%c%s', 'color: #00008b', '**************** 开始打印 (' + start + 'ms) ****************');
        console.log('%c%o', this.getStyle(this.getStyleObj(...this.wsty)), msg);
        let end = new Date().getMilliseconds();
        console.log('%c%s', 'color: #00008b', `********* 结束打印 (${end}ms --> 耗时：${end - start}ms) *********`);
    }
    printP(msg, clo) { // 对象打印,
        let start = new Date().getMilliseconds();
        console.log('%c%s', 'color: #00008b', '**************** 开始打印 (' + start + 'ms) ****************');
        if (clo === 'undefined') console.table(msg);
        else console.table(msg, clo);
        let end = new Date().getMilliseconds();
        console.log('%c%s', 'color: #00008b', `********* 结束打印 (${end}ms --> 耗时：${end - start}ms) *********`);
    }
    getStyle(sty) {
        return `font-size: ${sty.fs}; color: ${sty.color}; padding: ${sty.pd}; border-radius: ${sty.bdrs}; text-align: center`;
    };
    getStyleObj(...nfs) {
        let tg = {...this.sty};
        tg.fs = nfs[0];
        tg.color = nfs[1];
        tg.bc = nfs[2];
        tg.pd = nfs[3];
        tg.bd = nfs[4];
        tg.bdrs = nfs[5];
        return tg;
    }
}

export const DBUG = new Debugger();