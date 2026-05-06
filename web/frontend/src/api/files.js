import request from '@/utils/request';

// 获取目录列表
export function getDir(path) {
  return request({ url: '/files/get_dir', method: 'post', data: { path } });
}

// 获取文件内容
export function getFileContent(path) {
  return request({ url: '/files/get_file_content', method: 'post', data: { path } });
}

// 保存文件内容
export function saveFileContent(path, data) {
  return request({
    url: '/files/save_file_content',
    method: 'post',
    data: { path, data },
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

// 删除文件/目录
export function deleteFile(path) {
  return request({ url: '/files/delete_file', method: 'post', data: { path } });
}

// 重命名文件/目录
export function rename(source, target) {
  return request({
    url: '/files/rename',
    method: 'post',
    data: { source, target },
  });
}

// 复制文件
export function copyFile(source, target) {
  return request({
    url: '/files/copy_file',
    method: 'post',
    data: { source, target },
  });
}

// 移动文件
export function moveFile(source, target) {
  return request({
    url: '/files/move_file',
    method: 'post',
    data: { source, target },
  });
}

// 获取磁盘信息
export function getDisk() {
  return request({ url: '/files/get_disk', method: 'get' });
}
