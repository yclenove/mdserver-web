import os
import pytest


def test_development_mode_enabled(monkeypatch):
    """测试开发模式启用"""
    monkeypatch.setenv('MW_ENV', 'development')
    import importlib
    import web.config
    importlib.reload(web.config)
    assert web.config.DEV_MODE is True
    assert web.config.DISABLE_CAPTCHA is True


def test_development_mode_disabled(monkeypatch):
    """测试开发模式禁用"""
    monkeypatch.delenv('MW_ENV', raising=False)
    import importlib
    import web.config
    importlib.reload(web.config)
    assert web.config.DEV_MODE is False
