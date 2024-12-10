import type { Socket as SocketIO } from 'socket.io-client';

export interface ServerToClientEvents {
  personDoneSpeaking: (personId: string) => void;
  personMutedTheirMic: (personId: string) => void;
  personUnmutedTheirMic: (personId: string) => void;
  personSendingRtcOffer: (
    roomId: string,
    personId: string,
    sdp: string,
    type: string
  ) => void;
  personSendingRtcAnswer: (
    roomId: string,
    personId: string,
    sdp: string,
    type: string
  ) => void;
  personSendingIceCandidates: (personId: string, iceCandidate: string) => void;
  personJoinedRoom: (personId: string, name: string) => void;
  personLeftRoom: (personId: string) => void;
}

export interface ClientToServerEvents {
  muted: () => void;
  unmuted: () => void;
  joinRoom: (roomId: string, sdp: string, type: string) => void;
  auth: (username: string) => void;
  leaveRoom: () => void;
  sendOffer: (
    roomId: string,
    userId: string,
    sdp: string,
    type: string
  ) => void;
  sendAnswer: (
    roomId: string,
    userId: string,
    sdp: string,
    type: string
  ) => void;
  sendIceCandidates: (roomId: string, iceCandidates: string) => void;
  answerConnection: (
    roomId: string,
    userId: string,
    sdp: string,
    type: string
  ) => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  username: string;
  userId: string;
  currentRoomId?: string;
}

export type Socket = SocketIO<ServerToClientEvents, ClientToServerEvents>;
