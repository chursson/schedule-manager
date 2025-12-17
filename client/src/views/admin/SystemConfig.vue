<template>
  <div class="system-config">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>系统配置</span>
        </div>
      </template>

      <el-tabs v-model="activeTab">
        <!-- 基本配置 -->
        <el-tab-pane label="基本配置" name="basic">
          <el-form :model="config" label-width="120px">
            <el-form-item label="系统名称">
              <el-input v-model="config.systemName" placeholder="日程管理系统" />
            </el-form-item>
            <el-form-item label="系统描述">
              <el-input
                v-model="config.systemDescription"
                type="textarea"
                :rows="3"
                placeholder="一个支持多人实时协作的日程管理平台"
              />
            </el-form-item>
            <el-form-item label="允许注册">
              <el-switch v-model="config.allowRegister" />
              <span style="margin-left: 8px; color: #909399">
                关闭后新用户无法注册
              </span>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSave">保存配置</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 微信配置 -->
        <el-tab-pane label="微信配置" name="wechat">
          <el-alert
            title="微信配置说明"
            type="info"
            :closable="false"
            style="margin-bottom: 16px"
          >
            <p>需要在微信公众平台配置以下信息：</p>
            <ul>
              <li>AppID: 微信公众号的唯一标识</li>
              <li>AppSecret: 微信公众号的密钥</li>
              <li>JS接口安全域名: 需要配置您的域名</li>
            </ul>
          </el-alert>
          <el-form :model="config" label-width="120px">
            <el-form-item label="AppID">
              <el-input
                v-model="config.wechatAppId"
                placeholder="wx1234567890abcdef"
              />
            </el-form-item>
            <el-form-item label="AppSecret">
              <el-input
                v-model="config.wechatAppSecret"
                type="password"
                placeholder="请输入微信AppSecret"
                show-password
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSave">保存配置</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 安全配置 -->
        <el-tab-pane label="安全配置" name="security">
          <el-form :model="config" label-width="150px">
            <el-form-item label="登录过期时间">
              <el-input-number
                v-model="config.sessionTimeout"
                :min="1"
                :max="30"
              />
              <span style="margin-left: 8px">天</span>
            </el-form-item>
            <el-form-item label="密码最小长度">
              <el-input-number
                v-model="config.minPasswordLength"
                :min="6"
                :max="20"
              />
              <span style="margin-left: 8px">字符</span>
            </el-form-item>
            <el-form-item label="启用IP白名单">
              <el-switch v-model="config.enableIpWhitelist" />
            </el-form-item>
            <el-form-item v-if="config.enableIpWhitelist" label="IP白名单">
              <el-input
                v-model="config.ipWhitelist"
                type="textarea"
                :rows="3"
                placeholder="每行一个IP地址"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSave">保存配置</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 关于 -->
        <el-tab-pane label="关于" name="about">
          <el-descriptions :column="1" border>
            <el-descriptions-item label="系统版本">1.0.0</el-descriptions-item>
            <el-descriptions-item label="开发框架">
              Vue 3 + TypeScript + Vite + Element Plus
            </el-descriptions-item>
            <el-descriptions-item label="后端框架">
              Node.js + Express + SQLite
            </el-descriptions-item>
            <el-descriptions-item label="数据库">SQLite 3</el-descriptions-item>
            <el-descriptions-item label="实时通信">Socket.IO</el-descriptions-item>
          </el-descriptions>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { ElMessage } from 'element-plus';

const activeTab = ref('basic');

const config = reactive({
  systemName: '日程管理系统',
  systemDescription: '一个支持多人实时协作的日程管理平台',
  allowRegister: true,
  wechatAppId: '',
  wechatAppSecret: '',
  sessionTimeout: 7,
  minPasswordLength: 6,
  enableIpWhitelist: false,
  ipWhitelist: '',
});

/**
 * 保存配置
 */
const handleSave = () => {
  // 这里应该调用后端API保存配置
  // 目前只是演示
  ElMessage.success('配置已保存（演示功能）');
};
</script>

<style scoped lang="scss">
.system-config {
  .card-header {
    font-size: 18px;
    font-weight: 600;
  }

  :deep(.el-alert) {
    ul {
      margin: 8px 0 0 0;
      padding-left: 20px;
    }
  }
}
</style>
