import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const chatSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    recruiter: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    message: [
      {
        senderid: {
          type: Schema.Types.ObjectId,
          required: true,
        },
        receiverid: {
          type: Schema.Types.ObjectId,
          required: true,
        },
        msgContent: {
          type: String,
          required: true,
        },
        type: {
          type: String,
          enum: ['message', 'image', 'file'],
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Chat = model('Chat', chatSchema);

export default Chat;