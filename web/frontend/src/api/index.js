import request from '@/utils/request';

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

// 获取磁盘信息
export function getDiskInfo() {
  return request({ url: '/system/disk_info', method: 'post' });
}

// 获取面板信息
export function getPanelInfo() {
  return request({ url: '/panel/get_panel_info', method: 'post' });
}
