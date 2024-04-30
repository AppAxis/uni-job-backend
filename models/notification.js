import mongoose from "mongoose";
const { Schema, model} = mongoose;

const NotifSchema = new Schema (
    {
        
        content :{
            type: String,
            required: true
        },
        title:{
            type: String,
        },
        notifDate:{
            type: Date,
            default: Date.now,
        },
        
    },
    {
        timestamps: true
    }
);
export default model('Notification',NotifSchema);