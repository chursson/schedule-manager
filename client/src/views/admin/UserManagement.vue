<template>
  <div class="user-management">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>用户管理</span>
        </div>
      </template>

      <!-- 搜索和筛选 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="搜索">
          <el-input
            v-model="searchForm.search"
            placeholder="用户名或邮箱"
            clearable
            @clear="handleSearch"
          />
        </el-form-item>
        <el-form-item label="角色">
          <el-select
            v-model="searchForm.role"
            placeholder="全部"
            clearable
            @change="handleSearch"
          >
            <el-option label="超级管理员" value="super-admin" />
            <el-option label="管理员" value="admin" />
            <el-option label="编辑者" value="editor" />
            <el-option label="查看者" value="viewer" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select
            v-model="searchForm.status"
            placeholder="全部"
            clearable
            @change="handleSearch"
          >
            <el-option label="正常" value="active" />
            <el-option label="禁用" value="disabled" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
        </el-form-item>
      </el-form>

      <!-- 用户列表 -->
      <el-table
        v-loading="loading"
        :data="users"
        border
        style="width: 100%"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" width="150" />
        <el-table-column prop="email" label="邮箱" width="200" />
        <el-table-column label="角色" width="120">
          <template #default="{ row }">
            <el-tag :type="getRoleType(row.role)">
              {{ getRoleLabel(row.role) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'danger'">
              {{ row.status === 'active' ? '正常' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="250">
          <template #default="{ row }">
            <el-button
              size="small"
              @click="handleEdit(row)"
            >
              编辑
            </el-button>
            <el-button
              size="small"
              type="warning"
              @click="handleResetPassword(row)"
            >
              重置密码
            </el-button>
            <el-button
              size="small"
              type="danger"
              @click="handleDelete(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.limit"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @current-change="loadUsers"
        @size-change="loadUsers"
        class="pagination"
      />
    </el-card>

    <!-- 编辑用户对话框 -->
    <el-dialog
      v-model="editDialogVisible"
      :title="editingUser ? '编辑用户' : '新建用户'"
      width="500px"
    >
      <el-form
        v-if="editingUser"
        :model="editForm"
        label-width="80px"
      >
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="editForm.email" />
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="editForm.role">
            <el-option label="超级管理员" value="super-admin" />
            <el-option label="管理员" value="admin" />
            <el-option label="编辑者" value="editor" />
            <el-option label="查看者" value="viewer" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="editForm.status">
            <el-radio label="active">正常</el-radio>
            <el-radio label="disabled">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>

    <!-- 重置密码对话框 -->
    <el-dialog
      v-model="resetPasswordDialogVisible"
      title="重置密码"
      width="400px"
    >
      <el-form :model="resetPasswordForm" label-width="80px">
        <el-form-item label="新密码">
          <el-input
            v-model="resetPasswordForm.newPassword"
            type="password"
            placeholder="至少6个字符"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="resetPasswordDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirmResetPassword">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  getUserList,
  updateUser,
  resetUserPassword,
  deleteUser,
  type User,
} from '../../api/admin';

const loading = ref(false);
const users = ref<User[]>([]);

// 搜索表单
const searchForm = reactive({
  search: '',
  role: '',
  status: '',
});

// 分页
const pagination = reactive({
  page: 1,
  limit: 20,
  total: 0,
});

// 编辑相关
const editDialogVisible = ref(false);
const editingUser = ref<User | null>(null);
const editForm = reactive({
  username: '',
  email: '',
  role: 'editor' as 'super-admin' | 'admin' | 'editor' | 'viewer',
  status: 'active' as 'active' | 'disabled',
});

// 重置密码相关
const resetPasswordDialogVisible = ref(false);
const resetPasswordUser = ref<User | null>(null);
const resetPasswordForm = reactive({
  newPassword: '',
});

/**
 * 加载用户列表
 */
const loadUsers = async () => {
  loading.value = true;
  try {
    const response = await getUserList({
      page: pagination.page,
      limit: pagination.limit,
      search: searchForm.search,
      role: searchForm.role,
      status: searchForm.status,
    });

    users.value = response.users;
    pagination.total = response.pagination.total;
  } catch (error) {
    console.error('加载用户列表失败:', error);
    ElMessage.error('加载用户列表失败');
  } finally {
    loading.value = false;
  }
};

/**
 * 搜索
 */
const handleSearch = () => {
  pagination.page = 1;
  loadUsers();
};

/**
 * 编辑用户
 */
const handleEdit = (user: User) => {
  editingUser.value = user;
  editForm.username = user.username;
  editForm.email = user.email;
  editForm.role = user.role;
  editForm.status = user.status;
  editDialogVisible.value = true;
};

/**
 * 保存用户
 */
const handleSave = async () => {
  if (!editingUser.value) return;

  try {
    await updateUser(editingUser.value.id, editForm);
    ElMessage.success('保存成功');
    editDialogVisible.value = false;
    loadUsers();
  } catch (error: any) {
    console.error('保存失败:', error);
    ElMessage.error(error.response?.data?.message || '保存失败');
  }
};

/**
 * 重置密码
 */
const handleResetPassword = (user: User) => {
  resetPasswordUser.value = user;
  resetPasswordForm.newPassword = '';
  resetPasswordDialogVisible.value = true;
};

/**
 * 确认重置密码
 */
const handleConfirmResetPassword = async () => {
  if (!resetPasswordUser.value) return;

  if (resetPasswordForm.newPassword.length < 6) {
    ElMessage.error('密码长度至少6个字符');
    return;
  }

  try {
    await resetUserPassword(
      resetPasswordUser.value.id,
      resetPasswordForm.newPassword
    );
    ElMessage.success('密码重置成功');
    resetPasswordDialogVisible.value = false;
  } catch (error: any) {
    console.error('重置密码失败:', error);
    ElMessage.error(error.response?.data?.message || '重置密码失败');
  }
};

/**
 * 删除用户
 */
const handleDelete = async (user: User) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除用户 ${user.username} 吗？此操作不可恢复。`,
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );

    await deleteUser(user.id);
    ElMessage.success('删除成功');
    loadUsers();
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除失败:', error);
      ElMessage.error(error.response?.data?.message || '删除失败');
    }
  }
};

/**
 * 获取角色类型
 */
const getRoleType = (role: string) => {
  const typeMap: Record<string, any> = {
    'super-admin': 'danger',
    'admin': 'warning',
    'editor': 'success',
    'viewer': 'info',
  };
  return typeMap[role] || 'info';
};

/**
 * 获取角色标签
 */
const getRoleLabel = (role: string) => {
  const labelMap: Record<string, string> = {
    'super-admin': '超级管理员',
    'admin': '管理员',
    'editor': '编辑者',
    'viewer': '查看者',
  };
  return labelMap[role] || role;
};

/**
 * 格式化日期
 */
const formatDate = (date: string) => {
  return new Date(date).toLocaleString('zh-CN');
};

onMounted(() => {
  loadUsers();
});
</script>

<style scoped lang="scss">
.user-management {
  .card-header {
    font-size: 18px;
    font-weight: 600;
  }

  .search-form {
    margin-bottom: 16px;
  }

  .pagination {
    margin-top: 16px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>
