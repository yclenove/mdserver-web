import request from '@/utils/request';

// 获取目录列表
export function getDir(path) {
  return request({ url: '/files/get_dir', method: 'post', data: { path } });
}

// 获取文件内容 (后端路由: /files/get_body)
export function getFileContent(path) {
  return request({ url: '/files/get_body', method: 'post', data: { path } });
}

// 保存文件内容 (后端路由: /files/save_body)
export function saveFileContent(path, data, encoding) {
  return request({
    url: '/files/save_body',
    method: 'post',
    data: { path, data, encoding: encoding || 'utf-8' },
  });
}

// 创建文件
export function createFile(path) {
  return request({ url: '/files/create_file', method: 'post', data: { path } });
}

// 创建目录
export function createDir(path) {
  return request({ url: '/files/create_dir', method: 'post', data: { path } });
}

// 删除文件/目录 (后端路由: /files/delete)
export function deleteFile(path) {
  return request({ url: '/files/delete', method: 'post', data: { path } });
}

// 重命名/移动文件 (后端路由: /files/mv_file)
export function rename(source, target) {
  return request({
    url: '/files/mv_file',
    method: 'post',
    data: { sfile: source, dfile: target },
  });
}

// 复制文件
export function copyFile(source, target) {
  return request({
    url: '/files/copy_file',
    method: 'post',
    data: { sfile: source, dfile: target },
  });
}

// 移动文件 (同 rename)
export function moveFile(source, target) {
  return rename(source, target);
}

// 获取磁盘信息
export function getDisk() {
  return request({ url: '/files/get_disk', method: 'get' });
}
