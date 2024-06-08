import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const messageSchema = new Schema({
  sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const chatSchema = new Schema({
  participants: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  messages: [messageSchema],
  lastMessage: {
    content: { type: String },
    timestamp: { type: Date },
  }
}, {
  timestamps: true,
});
const Chat = model('Chat', chatSchema);

export { Chat };