import request from '@/utils/request';

// ==================== 系统信息 ====================

// 获取系统信息（CPU、内存基本信息）
export function getSystemInfo() {
  return request({ url: '/system/system_total', method: 'post' });
}

// 获取系统综合信息（CPU、负载、内存、磁盘IO、网络）
export function getSystemNetwork() {
  return request({ url: '/system/network', method: 'get' });
}

// 获取系统负载
export function getSystemLoad() {
  return request({ url: '/system/get_load_average', method: 'get' });
}

// 获取磁盘IO历史数据
export function getDiskIo(params = {}) {
  return request({ url: '/system/get_disk_io', method: 'get', params });
}

// 获取CPU IO历史数据
export function getCpuIo(params = {}) {
  return request({ url: '/system/get_cpu_io', method: 'get', params });
}

// 获取网络IO历史数据
export function getNetworkIo(params = {}) {
  return request({ url: '/system/get_network_io', method: 'get', params });
}

// 获取磁盘信息
export function getDiskInfo() {
  return request({ url: '/system/disk_info', method: 'post' });
}

// 获取面板信息
export function getPanelInfo() {
  return request({ url: '/panel/get_panel_info', method: 'post' });
}

// ==================== 网站管理 ====================

// 站点列表
export function getSiteList(params = {}) {
  const data = new URLSearchParams();
  data.append('p', params.page || 1);
  data.append('limit', params.limit || 10);
  if (params.type_id !== undefined && params.type_id !== '') data.append('type_id', params.type_id);
  if (params.search) data.append('search', params.search);
  if (params.order) data.append('order', params.order);
  return request({ url: '/site/list', method: 'post', data });
}

// 添加站点
export function addSite(params) {
  const data = new URLSearchParams();
  data.append('webinfo', params.name);
  data.append('ps', params.ps || '');
  data.append('path', params.path || '');
  data.append('version', params.php_version || '');
  data.append('port', params.port || '80');
  return request({ url: '/site/add', method: 'post', data });
}

// 启动站点
export function startSite(id) {
  const data = new URLSearchParams();
  data.append('id', id);
  return request({ url: '/site/start', method: 'post', data });
}

// 停止站点
export function stopSite(id) {
  const data = new URLSearchParams();
  data.append('id', id);
  return request({ url: '/site/stop', method: 'post', data });
}

// 删除站点
export function deleteSite(id) {
  const data = new URLSearchParams();
  data.append('id', id);
  return request({ url: '/site/del', method: 'post', data });
}

// ==================== 防火墙 ====================

// 防火墙规则列表
export function getFirewallList(params = {}) {
  const data = new URLSearchParams();
  data.append('p', params.page || 1);
  data.append('limit', params.limit || 10);
  return request({ url: '/firewall/get_list', method: 'post', data });
}

// 添加放行端口
export function addAcceptPort(params) {
  const data = new URLSearchParams();
  data.append('port', params.port);
  data.append('ps', params.ps || '');
  data.append('protocol', params.protocol || 'tcp');
  data.append('type', params.type || 'accept');
  return request({ url: '/firewall/add_accept_port', method: 'post', data });
}

// 删除放行端口
export function delAcceptPort(id, port, protocol) {
  const data = new URLSearchParams();
  data.append('id', id);
  data.append('port', port || '');
  data.append('protocol', protocol || '');
  return request({ url: '/firewall/del_accept_port', method: 'post', data });
}

// 获取SSH信息
export function getSshInfo() {
  return request({ url: '/firewall/get_ssh_info', method: 'post' });
}

// 设置SSH端口
export function setSshPort(port) {
  const data = new URLSearchParams();
  data.append('port', port);
  return request({ url: '/firewall/set_ssh_port', method: 'post', data });
}

// 设置ping状态
export function setPingStatus(status) {
  const data = new URLSearchParams();
  data.append('status', status);
  return request({ url: '/firewall/set_ping', method: 'post', data });
}

// 设置SSH Root登录状态
export function setSshRootStatus(status) {
  const data = new URLSearchParams();
  data.append('status', status);
  return request({ url: '/firewall/set_ssh_root_status', method: 'post', data });
}

// 设置SSH密码登录状态
export function setSshPassStatus(status) {
  const data = new URLSearchParams();
  data.append('status', status);
  return request({ url: '/firewall/set_ssh_pass_status', method: 'post', data });
}

// 设置SSH公钥登录状态
export function setSshPubkeyStatus(status) {
  const data = new URLSearchParams();
  data.append('status', status);
  return request({ url: '/firewall/set_ssh_pubkey_status', method: 'post', data });
}

// 设置防火墙状态
export function setFirewallStatus(status) {
  const data = new URLSearchParams();
  data.append('status', status);
  return request({ url: '/firewall/set_fw', method: 'post', data });
}

// ==================== 计划任务 ====================

// 计划任务列表
export function getCrontabList(params = {}) {
  const data = new URLSearchParams();
  data.append('p', params.page || 1);
  data.append('limit', params.limit || 10);
  return request({ url: '/crontab/list', method: 'post', data });
}

// 删除计划任务
export function deleteCrontab(id) {
  const data = new URLSearchParams();
  data.append('id', id);
  return request({ url: '/crontab/del', method: 'post', data });
}

// 设置计划任务状态
export function setCrontabStatus(id) {
  const data = new URLSearchParams();
  data.append('id', id);
  return request({ url: '/crontab/set_cron_status', method: 'post', data });
}

// 添加计划任务
export function addCrontab(params) {
  const data = new URLSearchParams();
  data.append('name', params.name || '');
  data.append('type', params.type || '');
  data.append('week', params.week || '');
  data.append('where1', params.where1 || '');
  data.append('hour', params.hour || '');
  data.append('minute', params.minute || '');
  data.append('save', params.save || '');
  data.append('backup_to', params.backup_to || '');
  data.append('stype', params.stype || '');
  data.append('sname', params.sname || '');
  data.append('sbody', params.sbody || '');
  data.append('url_address', params.url_address || '');
  data.append('attr', params.attr || '');
  return request({ url: '/crontab/add', method: 'post', data });
}

// 修改计划任务
export function modifyCrontab(id, params) {
  const data = new URLSearchParams();
  data.append('id', id);
  data.append('name', params.name || '');
  data.append('type', params.type || '');
  data.append('week', params.week || '');
  data.append('where1', params.where1 || '');
  data.append('hour', params.hour || '');
  data.append('minute', params.minute || '');
  data.append('save', params.save || '');
  data.append('backup_to', params.backup_to || '');
  data.append('stype', params.stype || '');
  data.append('sname', params.sname || '');
  data.append('sbody', params.sbody || '');
  data.append('url_address', params.url_address || '');
  data.append('attr', params.attr || '');
  return request({ url: '/crontab/modify_crond', method: 'post', data });
}

// 执行计划任务
export function startCrontabTask(id) {
  const data = new URLSearchParams();
  data.append('id', id);
  return request({ url: '/crontab/start_task', method: 'post', data });
}

// 获取计划任务日志
export function getCrontabLogs(id) {
  const data = new URLSearchParams();
  data.append('id', id);
  return request({ url: '/crontab/logs', method: 'post', data });
}

// 删除计划任务日志
export function deleteCrontabLogs(id) {
  const data = new URLSearchParams();
  data.append('id', id);
  return request({ url: '/crontab/del_logs', method: 'post', data });
}

// ==================== 日志管理 ====================

// 获取日志列表
export function getLogList(params = {}) {
  const data = new URLSearchParams();
  data.append('p', params.page || 1);
  data.append('limit', params.limit || 10);
  if (params.search) data.append('search', params.search);
  return request({ url: '/logs/get_log_list', method: 'post', data });
}

// 清空日志
export function clearLogs() {
  return request({ url: '/logs/del_panel_logs', method: 'post' });
}

// ==================== 面板设置 ====================

// 获取面板设置信息
export function getPanelSettings() {
  return request({ url: '/setting/get_panel_settings', method: 'post' });
}

// 设置面板名称
export function setWebname(webname) {
  const data = new URLSearchParams();
  data.append('webname', webname);
  return request({ url: '/setting/set_webname', method: 'post', data });
}

// 设置服务器IP
export function setServerIp(host_ip) {
  const data = new URLSearchParams();
  data.append('host_ip', host_ip);
  return request({ url: '/setting/set_ip', method: 'post', data });
}

// 设置备份目录
export function setBackupDir(backup_path) {
  const data = new URLSearchParams();
  data.append('backup_path', backup_path);
  return request({ url: '/setting/set_backup_dir', method: 'post', data });
}

// 设置站点目录
export function setSitesDir(sites_path) {
  const data = new URLSearchParams();
  data.append('sites_path', sites_path);
  return request({ url: '/setting/set_www_dir', method: 'post', data });
}

// 设置安全入口
export function setAdminPath(admin_path) {
  const data = new URLSearchParams();
  data.append('admin_path', admin_path);
  return request({ url: '/setting/set_admin_path', method: 'post', data });
}

// 设置BasicAuth
export function setBasicAuth(params) {
  const data = new URLSearchParams();
  data.append('basic_user', params.basic_user || '');
  data.append('basic_pwd', params.basic_pwd || '');
  data.append('is_open', params.is_open ? 'true' : 'false');
  return request({ url: '/setting/set_basic_auth', method: 'post', data });
}

// 设置未授权状态码
export function setStatusCode(status_code) {
  const data = new URLSearchParams();
  data.append('status_code', status_code);
  return request({ url: '/setting/set_status_code', method: 'post', data });
}

// 切换调试模式
export function toggleDebug() {
  return request({ url: '/setting/open_debug', method: 'post' });
}

// 切换面板开关
export function togglePanel() {
  return request({ url: '/setting/close_panel', method: 'post' });
}

// 设置IPv6状态
export function setIpv6Status() {
  return request({ url: '/setting/set_ipv6_status', method: 'post' });
}

// 设置面板用户名
export function setName(name1, name2) {
  const data = new URLSearchParams();
  data.append('name1', name1);
  data.append('name2', name2);
  return request({ url: '/setting/set_name', method: 'post', data });
}

// 设置面板密码
export function setPassword(password1, password2) {
  const data = new URLSearchParams();
  data.append('password1', password1);
  data.append('password2', password2);
  return request({ url: '/setting/set_password', method: 'post', data });
}

// 设置面板端口
export function setPort(port) {
  const data = new URLSearchParams();
  data.append('port', port);
  return request({ url: '/setting/set_port', method: 'post', data });
}

// ==================== 软件/插件管理 ====================

// 获取插件列表
export function getPluginList(params = {}) {
  return request({ url: '/plugins/list', method: 'get', params });
}

// 获取首页插件列表
export function getIndexPluginList() {
  return request({ url: '/plugins/index_list', method: 'post' });
}

// 安装插件
export function installPlugin(name, version) {
  const data = new URLSearchParams();
  data.append('name', name);
  data.append('version', version);
  return request({ url: '/plugins/install', method: 'post', data });
}

// 卸载插件
export function uninstallPlugin(name, version) {
  const data = new URLSearchParams();
  data.append('name', name);
  data.append('version', version);
  return request({ url: '/plugins/uninstall', method: 'post', data });
}

// 设置插件首页展示
export function setPluginIndex(name, status, version) {
  const data = new URLSearchParams();
  data.append('name', name);
  data.append('status', status);
  data.append('version', version);
  return request({ url: '/plugins/set_index', method: 'post', data });
}

// 运行插件回调
export function runPlugin(name, func, version, args, script) {
  const data = new URLSearchParams();
  data.append('name', name);
  data.append('func', func);
  data.append('version', version || '');
  data.append('args', args || '');
  data.append('script', script || 'index');
  return request({ url: '/plugins/run', method: 'post', data });
}

// ==================== 文件管理 ====================

// 获取目录列表
export function getDirList(path, showHidden) {
  const data = new URLSearchParams();
  data.append('path', path || '/');
  data.append('showHidden', showHidden ? '1' : '0');
  return request({ url: '/files/get_dir', method: 'post', data });
}

// 获取文件内容
export function getFileBody(path) {
  const data = new URLSearchParams();
  data.append('path', path);
  return request({ url: '/files/get_body', method: 'post', data });
}

// 保存文件内容
export function saveFileBody(path, data_content) {
  const data = new URLSearchParams();
  data.append('path', path);
  data.append('data', data_content);
  return request({ url: '/files/save_body', method: 'post', data });
}

// 删除文件
export function deleteFile(path) {
  const data = new URLSearchParams();
  data.append('path', path);
  return request({ url: '/files/delete', method: 'post', data });
}

// 创建目录
export function createDir(path) {
  const data = new URLSearchParams();
  data.append('path', path);
  return request({ url: '/files/create_dir', method: 'post', data });
}

// 创建文件
export function createFile(path) {
  const data = new URLSearchParams();
  data.append('path', path);
  return request({ url: '/files/create_file', method: 'post', data });
}
