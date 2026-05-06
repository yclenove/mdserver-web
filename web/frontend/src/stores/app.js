import { defineStore } from 'pinia';
import { ref } from 'vue';
import { getSystemInfo } from '@/api/index';

export const useAppStore = defineStore('app', () => {
  const systemInfo = ref({
    cpu: { cores: 0, usage: 0, model: '' },
    memory: { total: 0, used: 0, free: 0, usage: 0 },
    disk: { total: 0, used: 0, free: 0, usage: 0 },
    network: { up: 0, down: 0 },
    uptime: 0,
    hostname: '',
    os: '',
  });

  const sidebarCollapsed = ref(false);
  const theme = ref(localStorage.getItem('mw_theme') || 'light');

  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value;
  }

  function setTheme(newTheme) {
    theme.value = newTheme;
    localStorage.setItem('mw_theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  }

  async function fetchSystemInfo() {
    try {
      const res = await getSystemInfo();
      if (res.data) {
        systemInfo.value = { ...systemInfo.value, ...res.data };
      }
      return systemInfo.value;
    } catch (error) {
      console.error('获取系统信息失败:', error);
      throw error;
    }
  }

  return {
    systemInfo,
    sidebarCollapsed,
    theme,
    toggleSidebar,
    setTheme,
    fetchSystemInfo,
  };
});
