import UserConfigs from "../models/user-config.js"; 

export async function getUserConfigs(userId) {
  try {
    const userConfigs = await UserConfigs.findOne({ userId: userId }); 
    return userConfigs;
  } catch (e) {
    console.log("Error in getting user config " + e);
    return null;
  }
}

export async function addSocketId(userId, socketId) {
  try {
    const userConf =  await UserConfigs.findOne({ userId: userId }); 
    if (!userConf) {
  
     const newUserConfigs = new UserConfigs({ 
        userId,
        socketIds : [socketId],
      });
      const savedUserConfigs = await newUserConfigs.save();

      return savedUserConfigs
    }

   const userConfigs = await UserConfigs.findOneAndUpdate( 
      { userId: userId },
      {
        $push: { socketIds: socketId }, 
      },
      { new: true }
    );

    return userConfigs;
  } catch (error) {
    console.log("Error adding user socket id: " + error.message); 
    return null;
  }
}
