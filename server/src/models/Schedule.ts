import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

// Participant接口
export interface IParticipant {
  userId: number;
  permission: 'owner' | 'editor' | 'viewer';
}

// Schedule属性接口
export interface ScheduleAttributes {
  id: number;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  participants: IParticipant[];
  tags: string[];
  status: 'pending' | 'in-progress' | 'completed';
  version: number;
  shareToken?: string;
  createdBy: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// 创建时的可选属性
interface ScheduleCreationAttributes
  extends Optional<ScheduleAttributes, 'id' | 'description' | 'tags' | 'status' | 'version' | 'shareToken' | 'createdAt' | 'updatedAt'> {}

// Schedule模型类
class Schedule extends Model<ScheduleAttributes, ScheduleCreationAttributes> implements ScheduleAttributes {
  public id!: number;
  public title!: string;
  public description?: string;
  public startTime!: Date;
  public endTime!: Date;
  public participants!: IParticipant[];
  public tags!: string[];
  public status!: 'pending' | 'in-progress' | 'completed';
  public version!: number;
  public shareToken?: string;
  public createdBy!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// 初始化Schedule模型
Schedule.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: {
          args: [1, 100],
          msg: '标题长度必须在1-100个字符之间',
        },
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    startTime: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    endTime: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isAfterStart(this: Schedule, value: Date) {
          if (value <= this.startTime) {
            throw new Error('结束时间必须晚于开始时间');
          }
        },
      },
    },
    participants: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
    tags: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
    status: {
      type: DataTypes.ENUM('pending', 'in-progress', 'completed'),
      defaultValue: 'pending',
    },
    version: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    shareToken: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
  },
  {
    sequelize,
    tableName: 'schedules',
    timestamps: true,
    indexes: [
      {
        fields: ['createdBy'],
      },
      {
        fields: ['startTime'],
      },
      {
        fields: ['shareToken'],
      },
    ],
  }
);

export default Schedule;
