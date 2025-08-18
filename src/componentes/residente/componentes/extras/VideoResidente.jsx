import React from 'react'

const VideoResidente = () => {
  return (
    <div className="video-container" style={{
      padding: '2rem',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      <h3 style={{
        textAlign: 'center',
        fontSize: '2rem',
        marginBottom: '2rem',
        color: '#333'
      }}>Video Residente</h3>
      <div className="video-wrapper" style={{
        position: 'relative',
        width: '100%',
        paddingBottom: '56.25%', // 16:9 aspect ratio
        height: 0,
        overflow: 'hidden',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
      }}>
        <iframe
          src="https://drive.google.com/file/d/1GiKqDB2y7uKlPMVaN90ZMWm7bvwlPlXl/preview"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            border: 'none',
            borderRadius: '12px'
          }}
          allow="autoplay"
          title="Video Residente"
        ></iframe>
      </div>
    </div>
  )
}

export default VideoResidente