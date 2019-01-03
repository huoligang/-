var md5 = require('md5.js')
function makeMd5Par(data = {}) {
  //传近来的data里不包含包含timestamp，ak这两个参数
  let str = '';
  let secretKey = 'k0KHnfQ0x2CHE0Bn';
  let nowDate = new Date().valueOf().toString().substr(0, 10);
  data.timestamp = nowDate;
  let nd = objKeySort(data);
  for (let i in nd) {
    str += i + nd[i];
  }
  let permd5 = secretKey + str + nowDate;
  nd['ak'] = md5.hex_md5(permd5);
  return nd;
}
function objKeySort(obj) {
  var newkey = Object.keys(obj).sort();
  var newObj = {};//创建一个新的对象，用于存放排好序的键值对
  for (var i = 0; i < newkey.length; i++) {//遍历newkey数组
    newObj[newkey[i]] = obj[newkey[i]];//向新创建的对象中按照排好的顺序依次增加键值对
  }
  return newObj;//返回排好序的新对象
}
module.exports.makeMd5Par = makeMd5Par;