"use client";

import { io } from "socket.io-client";

export const socket = io(`${process.env.NEXT_PUBLIC_Base_URL}`);
export const socketNotification= io(`${process.env.NEXT_PUBLIC_Base_URL}/notification`,{
    transports: ['websocket'],

})