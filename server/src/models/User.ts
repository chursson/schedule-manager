import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import bcrypt from 'bcrypt';

// User属性接口
export interface UserAttributes {
  id: number;
  username: string;
  email: string;
  password: string;
  role: 'super-admin' | 'admin' | 'editor' | 'viewer';
  status: 'active' | 'disabled';
  avatar?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// 创建时的可选属性
interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'role' | 'status' | 'avatar' | 'createdAt' | 'updatedAt'> {}

// User模型类
class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  public username!: string;
  public email!: string;
  public password!: string;
  public role!: 'super-admin' | 'admin' | 'editor' | 'viewer';
  public status!: 'active' | 'disabled';
  public avatar?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // 验证密码方法
  public async comparePassword(candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
  }
}

// 初始化User模型
User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        len: {
          args: [3, 30],
          msg: '用户名长度必须在3-30个字符之间',
        },
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: {
          msg: '请输入有效的邮箱地址',
        },
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: {
          args: [6, 100],
          msg: '密码长度必须至少6个字符',
        },
      },
    },
    role: {
      type: DataTypes.ENUM('super-admin', 'admin', 'editor', 'viewer'),
      defaultValue: 'editor',
    },
    status: {
      type: DataTypes.ENUM('active', 'disabled'),
      defaultValue: 'active',
    },
    avatar: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'users',
    timestamps: true,
    hooks: {
      // 保存前加密密码
      beforeCreate: async (user: User) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      beforeUpdate: async (user: User) => {
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
    },
  }
);

export default User;
