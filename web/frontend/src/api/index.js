import request from '@/utils/request';

// 获取系统信息（CPU、内存、磁盘、网络等）
export function getSystemInfo() {
  return request({ url: '/api/system/system_total', method: 'get' });
}

// 获取系统负载
export function getSystemLoad() {
  return request({ url: '/api/system/get_load_average', method: 'get' });
}

// 获取网络流量
export function getNetworkInfo() {
  return request({ url: '/api/system/get_network', method: 'get' });
}

// 获取磁盘信息
export function getDiskInfo() {
  return request({ url: '/api/system/get_disk_info', method: 'get' });
}

// 获取面板信息
export function getPanelInfo() {
  return request({ url: '/api/panel/get_panel_info', method: 'get' });
}
