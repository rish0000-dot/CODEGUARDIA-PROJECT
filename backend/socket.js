const { Server } = require('socket.io');

let io;

const init = (server) => {
    io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    io.on('connection', (socket) => {
        console.log(`🔌 [${new Date().toLocaleTimeString()}] User connected: ${socket.id}`);

        socket.on('join_scan', (repoId) => {
            socket.join(`scan_${repoId}`);
            console.log(`📡 Socket ${socket.id} joined scan room: scan_${repoId}`);
        });

        socket.on('disconnect', () => {
            console.log(`🔌 User disconnected: ${socket.id}`);
        });
    });

    return io;
};

const getIO = () => {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
};

const emitScanProgress = (repoUrl, progress, status, issuesCount = 0) => {
    if (io) {
        io.emit('scan_progress', {
            repoUrl,
            progress,
            status,
            issuesCount,
            timestamp: new Date().toISOString()
        });
        // Also emit to specific room if needed
        io.to(`scan_${repoUrl}`).emit('progress_update', { progress, status, issuesCount });
    }
};

module.exports = { init, getIO, emitScanProgress };
