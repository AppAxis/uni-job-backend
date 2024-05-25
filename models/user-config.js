import mongoose from "mongoose";
const { Schema, model} = mongoose;

const UserCongfigsSchema = new Schema (
    {
       userId:{
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },

      socketIds: [String]
    },
    {
        timestamps: true
    }
);
export default model('UserCongfigs',UserCongfigsSchema);