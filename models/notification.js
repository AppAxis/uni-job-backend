import mongoose from "mongoose";
const { Schema, model} = mongoose;

const NotifSchema = new Schema (
    {
        
        receiverId: { 
            type: Schema.Types.ObjectId,
             ref: 'User', 
             required: true ,
            }, 
        senderId: { 
            type: Schema.Types.ObjectId,
             ref: 'User',
              required: true ,
            }, 
        title: { 
            type: String,
            required: true, 
        },
        message: { 
            type: String, 
            required: true,
         },
        timestamp: { 
            type: Date, 
            default: Date.now,
         }, 
        
      }
      );
export default model('Notification',NotifSchema);