<template>
  <div class="permission-management">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>权限管理</span>
        </div>
      </template>

      <el-descriptions :column="1" border>
        <el-descriptions-item label="说明">
          系统采用基于角色的访问控制（RBAC），不同角色拥有不同的权限。
        </el-descriptions-item>
      </el-descriptions>

      <!-- 角色列表 -->
      <el-table
        v-loading="loading"
        :data="roles"
        border
        style="width: 100%; margin-top: 24px"
      >
        <el-table-column prop="label" label="角色名称" width="150" />
        <el-table-column prop="value" label="角色标识" width="150" />
        <el-table-column prop="description" label="描述" />
        <el-table-column label="权限" width="400">
          <template #default="{ row }">
            <el-tag
              v-for="permission in getPermissions(row.value)"
              :key="permission"
              size="small"
              type="success"
              style="margin-right: 8px; margin-bottom: 4px"
            >
              {{ permission }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>

      <!-- 权限说明 -->
      <el-card class="permission-card" shadow="never">
        <template #header>
          <span>权限说明</span>
        </template>
        <el-descriptions :column="1">
          <el-descriptions-item label="查看者 (viewer)">
            只能查看自己创建或参与的日程，无法创建或编辑日程。
          </el-descriptions-item>
          <el-descriptions-item label="编辑者 (editor)">
            可以创建、编辑、删除自己的日程，以及编辑别人分享给自己的日程（需要编辑权限）。
          </el-descriptions-item>
          <el-descriptions-item label="管理员 (admin)">
            除了编辑者的所有权限外，还可以访问管理后台，管理用户、查看统计数据等。
          </el-descriptions-item>
          <el-descriptions-item label="超级管理员 (super-admin)">
            拥有系统的所有权限，包括管理其他管理员、修改系统配置等。
          </el-descriptions-item>
        </el-descriptions>
      </el-card>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { getRoles, type Role } from '../../api/admin';

const loading = ref(false);
const roles = ref<Role[]>([]);

/**
 * 加载角色列表
 */
const loadRoles = async () => {
  loading.value = true;
  try {
    const response = await getRoles();
    roles.value = response.roles;
  } catch (error) {
    console.error('加载角色列表失败:', error);
    ElMessage.error('加载角色列表失败');
  } finally {
    loading.value = false;
  }
};

/**
 * 获取权限列表
 */
const getPermissions = (role: string): string[] => {
  const permissionMap: Record<string, string[]> = {
    'viewer': [
      '查看日程',
    ],
    'editor': [
      '查看日程',
      '创建日程',
      '编辑日程',
      '删除日程',
      '分享日程',
    ],
    'admin': [
      '查看日程',
      '创建日程',
      '编辑日程',
      '删除日程',
      '分享日程',
      '管理用户',
      '查看统计',
      '系统配置',
    ],
    'super-admin': [
      '所有权限',
      '管理管理员',
      '修改角色',
      '系统高级配置',
    ],
  };
  return permissionMap[role] || [];
};

onMounted(() => {
  loadRoles();
});
</script>

<style scoped lang="scss">
.permission-management {
  .card-header {
    font-size: 18px;
    font-weight: 600;
  }

  .permission-card {
    margin-top: 24px;
  }
}
</style>
