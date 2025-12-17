import mongoose, { Schema, Document } from 'mongoose';

export interface IParticipant {
  userId: mongoose.Types.ObjectId;
  permission: 'owner' | 'editor' | 'viewer';
}

export interface ISchedule extends Document {
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  participants: IParticipant[];
  tags: string[];
  status: 'pending' | 'in-progress' | 'completed';
  version: number; // 用于冲突检测
  shareToken?: string; // 微信分享token
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ScheduleSchema = new Schema<ISchedule>(
  {
    title: {
      type: String,
      required: [true, '日程标题不能为空'],
      trim: true,
      maxlength: [100, '标题最多100个字符'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, '描述最多500个字符'],
    },
    startTime: {
      type: Date,
      required: [true, '开始时间不能为空'],
    },
    endTime: {
      type: Date,
      required: [true, '结束时间不能为空'],
      validate: {
        validator: function (this: ISchedule, value: Date) {
          return value > this.startTime;
        },
        message: '结束时间必须晚于开始时间',
      },
    },
    participants: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        permission: {
          type: String,
          enum: ['owner', 'editor', 'viewer'],
          default: 'viewer',
        },
      },
    ],
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed'],
      default: 'pending',
    },
    version: {
      type: Number,
      default: 0,
    },
    shareToken: {
      type: String,
      unique: true,
      sparse: true, // 允许null值，但非null值必须唯一
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// 索引优化
ScheduleSchema.index({ createdBy: 1, startTime: -1 });
ScheduleSchema.index({ 'participants.userId': 1 });
ScheduleSchema.index({ shareToken: 1 });

export default mongoose.model<ISchedule>('Schedule', ScheduleSchema);
