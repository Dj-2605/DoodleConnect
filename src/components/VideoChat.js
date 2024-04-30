import React, { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import './VideoChat.css';

const VideoChat = ({ roomId, userId }) => {
  const [stream, setStream] = useState(null);
  const [peerConnection, setPeerConnection] = useState(null);
  const [socket, setSocket] = useState(null);
  const [remoteStream, setRemoteStream] = useState(new MediaStream());
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const videoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    const newSocket = io('http://localhost:3001'); // Adjust as needed
    setSocket(newSocket);

    newSocket.emit('join-room', roomId, userId); // Join the room

    newSocket.on('offer', async (offer, senderId) => {
      if (!peerConnection) {
        const pc = createPeerConnection(newSocket);
        setPeerConnection(pc);
      }

      await peerConnection.setRemoteDescription(offer);
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);

      newSocket.emit('answer', answer, roomId, userId);
    });

    newSocket.on('answer', async (answer) => {
      if (peerConnection) {
        await peerConnection.setRemoteDescription(answer);
      }
    });

    newSocket.on('ice-candidate', async (candidate) => {
      if (peerConnection && candidate) {
        await peerConnection.addIceCandidate(candidate);
      }
    });

    return () => {
      endCall(); // Clean up resources on component unmount
      newSocket.disconnect();
    };
  }, [roomId, userId]);

  const createPeerConnection = (socket) => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }], // STUN server
    });

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('ice-candidate', event.candidate, roomId, userId);
      }
    };

    pc.ontrack = (event) => {
      event.streams[0].getTracks().forEach((track) => {
        remoteStream.addTrack(track);
      });
    };

    return pc;
  };

  const startCall = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: isVideoEnabled,
        audio: !isMuted,
      });

      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream; // Set local stream
      }

      const pc = createPeerConnection(socket);
      setPeerConnection(pc);

      mediaStream.getTracks().forEach((track) => {
        pc.addTrack(track, mediaStream); // Add media tracks to peer connection
      });

      const offerDescription = await pc.createOffer();
      await pc.setLocalDescription(offerDescription);

      socket.emit('offer', offerDescription, roomId, userId); // Emit the offer
    } catch (error) {
      console.error('Error accessing media devices:', error);
    }
  };

  const endCall = () => {
    if (peerConnection) {
      peerConnection.close(); // Close peer connection
    }

    if (stream) {
      stream.getTracks().forEach((track) => track.stop()); // Stop all tracks
    }

    if (socket) {
      socket.emit('end-call', roomId, userId); // Notify server about end of call
    }

    setStream(null);
    setPeerConnection(null);
  };

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
    if (stream) {
      stream.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled; // Toggle audio
      });
    }
  };

  const toggleVideo = () => {
    setIsVideoEnabled((prev) => !prev);
    if (stream) {
      stream.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled; // Toggle video
      });
    }
  };

  const startScreenSharing = async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });

      setIsScreenSharing(true);
      setStream(screenStream); // Set new stream to screen sharing

      if (videoRef.current) {
        videoRef.current.srcObject = screenStream; // Set local stream to screen sharing
      }

      // Replace video track in peer connection
      if (peerConnection) {
        const videoTrack = screenStream.getVideoTracks()[0];
        const sender = peerConnection.getSenders().find((s) => s.track?.kind === 'video');
        if (sender) {
          sender.replaceTrack(videoTrack); // Replace with screen sharing track
        }

        screenStream.getVideoTracks()[0].onended = () => {
          // Handle when screen sharing ends
          setIsScreenSharing(false);
          startCall(); // Revert back to camera
        };
      }
    } catch (error) {
      console.error('Error accessing display media:', error);
    }
  };

  return (
    <div className="video-chat">
      <video ref={videoRef} autoPlay playsInline muted={isMuted} /> {/* Local video */}
      <video ref={remoteVideoRef} autoPlay playsInline /> {/* Remote video */}
      <div className="controls">
        <button onClick={startCall}>Start Call</button>
        <button onClick={endCall}>End Call</button>
        <button onClick={toggleMute}>{isMuted ? 'Unmute' : 'Mute'}</button> {/* Mute/Unmute */}
        <button onClick={toggleVideo}>{isVideoEnabled ? 'Disable Video' : 'Enable Video'}</button> {/* Toggle video */}
        <button onClick={startScreenSharing}>
          {isScreenSharing ? 'Stop Sharing' : 'Start Screen Sharing'}
        </button> {/* Screen sharing button */}
      </div>
    </div>
  );
};

export default VideoChat;
