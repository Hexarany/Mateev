import { Server } from 'socket.io'

let io: Server | null = null

export const initializeIO = (socketIO: Server) => {
  io = socketIO
  console.log('✅ Socket.IO manager initialized')
}

export const getIO = (): Server | null => {
  return io
}
