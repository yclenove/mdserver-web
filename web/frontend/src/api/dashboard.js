import request from '@/utils/request';

// 登录
export function login(username, password, code) {
  const data = { username, password };
  if (code) {
    data.code = code;
  }
  return request({ url: '/do_login', method: 'post', data });
}

// 登出
export function logout() {
  return request({ url: '/api/user/logout', method: 'post' });
}

// 检查登录状态
export function checkLogin() {
  return request({ url: '/check_login', method: 'get' });
}

// 获取验证码
export function getVerifyCode() {
  return request({ url: '/api/user/get_verify_code', method: 'get' });
}

// 修改密码
export function changePassword(oldPassword, newPassword) {
  return request({
    url: '/api/user/change_password',
    method: 'post',
    data: { password: oldPassword, new_password: newPassword },
  });
}
