import { Server } from "socket.io";
import jwt from "jsonwebtoken";


export default function initSocket(server){
    const io = new Server(server);
    
    // Ajoutez un console.log pour vérifier la création du serveur Socket.IO
    console.log("Socket.IO server created successfully.");

    io.use((socket, next) => {
        try {
            const decoded = jwt.decode(socket.request.headers.token);
            socket.userId = decoded.id;
            // Ajoutez un console.log pour afficher les informations sur la demande de connexion
            console.log(`User ${socket.userId} authenticated successfully.`);
            next();
        } catch (error) {
            next(new Error("not auth"));
        }
    });

    io.on('connection',(socket)=>{
        // Ajoutez un console.log pour afficher un message chaque fois qu'un utilisateur se connecte
        console.log(`User connected with socket id ${socket.id} and with a userid ${socket.userId}`);
        console.log(socket);

        socket.join(socket.userId);

        socket.on('sendingMessage',(message)=>{
            // Ajoutez un console.log pour afficher les messages envoyés
            console.log(`Message sent by ${socket.userId}: ${message}`);
            socket.to(message.receiverId).emit("receiveMessage",{content:message.content,senderId:socket.userId});
        });

        socket.on('notify',(notification)=>{
            // Ajoutez un console.log pour afficher les notifications reçues
            console.log(`Notification received by ${socket.userId}: ${notification}`);
            socket.broadcast("sendNotification",notification);
        });

        socket.on('disconnect', () => {
            socket.leave(socket.userId);
            // Ajoutez un console.log pour afficher un message chaque fois qu'un utilisateur se déconnecte
            console.log(`User disconnected: ${socket.id}`);
        });
    });
}