import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import ReactPlayer from 'react-player';
import {
  ShoppingBag,
  Pause,
  PlayArrow,
  VolumeUp,
  VolumeOff,
  PauseOutlined,
  PlayArrowOutlined,
  VolumeMute,
  VolumeDown,
  VolumeMuteOutlined,
  VolumeOffRounded,
  VolumeOffOutlined,
  VolumeUpOutlined,
  ShoppingBagOutlined
} from '@mui/icons-material';
import { ProductInfo, ProductVideoPlayerProps, ProductVideoPlayerHandle } from '@/lib/types';
import {VolumeOffIcon} from "@/components/icons/VolumeOffIcon";
import {PlayIcon} from "@/components/icons/PlayIcon";
import {ExpandIcon} from "@/components/icons/ExpandIcon";
import {CollapseIcon} from "@/components/icons/CollapseIcon";
import {TooltipButton} from "@/components/TooltipButton";
import {VolumeUpIcon} from "@/components/icons/VolumeUpIcon";
import {PauseIcon} from "@/components/icons/PauseIcon";

const ProductVideoPlayer = forwardRef<ProductVideoPlayerHandle, ProductVideoPlayerProps>(({
  videoUrl,
  products,
  onProductSelect,
  width = '100%',
  height = '100%',
  autoPlay = true,
  onTimeUpdate,
  onPlayerReady,
}, ref) => {
  const [playing, setPlaying] = useState<boolean>(autoPlay);
  const [muted, setMuted] = useState<boolean>(true); // Start muted for autoplay compatibility
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [visibleProducts, setVisibleProducts] = useState<ProductInfo[]>([]);
  const [isHovering, setIsHovering] = useState<boolean>(false);
  const [controlsVisible, setControlsVisible] = useState<boolean>(false);
  const [duration, setDuration] = useState<number>(0);
  const [ended, setEnded] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [loaded, setLoaded] = useState<number>(0);
  const playerRef = useRef<ReactPlayer>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const hideControlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    stopPlayback: () => {
      setPlaying(false);
    }
  }), []);

  // Reset product states when video URL changes
  useEffect(() => {
    setCurrentTime(0);
    setVisibleProducts([]);
    setMuted(true); // Always start muted for autoplay compatibility
    setEnded(false);
    setIsFullscreen(false);
    setPlaying(autoPlay);
  }, [videoUrl, autoPlay]);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hideControlsTimeoutRef.current) {
        clearTimeout(hideControlsTimeoutRef.current);
      }
    };
  }, []);

  // Update current time, loaded buffer, and visible products
  const handleProgress = (state: { playedSeconds: number; loaded: number }) => {
    setCurrentTime(state.playedSeconds);
    setLoaded(state.loaded);
    if (onTimeUpdate) {
      onTimeUpdate(state.playedSeconds);
    }

    // Filter products that should be visible at current time
    const productsToShow = products.filter(
      product =>
        state.playedSeconds >= product.timeline[0] &&
        state.playedSeconds <= product.timeline[1]
    );

    setVisibleProducts(productsToShow);
  };

    // Handle play/pause toggle
  const togglePlayPause = () => {
    const newPlayingState = !playing;
    
    if (newPlayingState) {
      // Playing - just play without changing mute state
      setPlaying(true);
    } else {
      // Pausing - just pause
      setPlaying(false);
    }
  };

    // Handle mute/unmute toggle
  const toggleMute = () => {
    const newMutedState = !muted;

    if (newMutedState) {
      // Muting - just change mute state
      setMuted(true);
    } else {
      // Unmuting - need to handle autoplay policy
      if (!playing) {
        // If video is not playing, start it muted first, then unmute
        setMuted(false);
        setPlaying(true);
      } else {
        // If video is already playing, just unmute
        setMuted(false);
      }
    }
  };

  const toggleExpand = () => {
    if (!playerContainerRef.current) return;
    
    if (!document.fullscreenElement) {
      // Enter fullscreen
      playerContainerRef.current.requestFullscreen().catch(err => {
        console.error('Error attempting to enable fullscreen:', err);
      });
    } else {
      // Exit fullscreen
      document.exitFullscreen().catch(err => {
        console.error('Error attempting to exit fullscreen:', err);
      });
    }
  }

  // Handle video duration loaded
  const handleDuration = (duration: number) => {
    setDuration(duration);
  };

  // Handle video ready
  const handleReady = () => {
    if (onPlayerReady) {
      onPlayerReady({
        seekTo: (time: number) => {
          if (playerRef.current) {
            playerRef.current.seekTo(time);
          }
        }
      });
    }
  };

  // Show/hide controls when hovering over video
  const handleMouseEnter = () => {
    setIsHovering(true);
    setControlsVisible(true);
    
    // Clear any existing timeout
    if (hideControlsTimeoutRef.current) {
      clearTimeout(hideControlsTimeoutRef.current);
      hideControlsTimeoutRef.current = null;
    }
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    
    // Clear any existing timeout
    if (hideControlsTimeoutRef.current) {
      clearTimeout(hideControlsTimeoutRef.current);
    }
    
    // Hide controls after a delay if video is playing
    if (playing) {
      hideControlsTimeoutRef.current = setTimeout(() => {
        setControlsVisible(false);
      }, 2000);
    } else {
      // Hide immediately if video is paused
      setControlsVisible(false);
    }
  };

  // Format time for display (mm:ss)
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Calculate position for product markers using percentage-based coordinates
  const calculateMarkerPosition = (product: ProductInfo) => {
    // location is now in percentages: [x%, y%, width%, height%]
    const [xPercent, yPercent] = product.location;

    return {
      left: `${xPercent}%`,
      top: `${yPercent}%`,
    };
  };

  // Seek to a specific time when clicking on the progress bar
  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!playerRef.current || !playerContainerRef.current) return;

    const progressBar = e.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const clickPosition = (e.clientX - rect.left) / rect.width;
    const seekTime = duration * clickPosition;

    playerRef.current.seekTo(seekTime);
  };

  return (
    <div
      className="relative video-container bg-black rounded-lg overflow-hidden aspect-video"
      ref={playerContainerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <ReactPlayer
        ref={playerRef}
        url={videoUrl}
        width={width}
        height={height}
        playing={playing}
        muted={muted} // Start muted for autoplay compatibility
        volume={muted ? 0 : 1} // Ensure volume is 0 when muted
        controls={false} // We're using custom controls
        onProgress={handleProgress}
        onPause={() => {
          setPlaying(false);
        }}
        onPlay={() => {
          setPlaying(true);
          setEnded(false);
        }}
        onEnded={() => {
          setEnded(true);
          setPlaying(false);
        }}
        onError={(error) => {
          console.error('Video player error:', error);
        }}
        onDuration={handleDuration}
        onReady={handleReady}
        progressInterval={100} // Update progress more frequently for smoother marker updates
        config={{
          file: {
            attributes: {
              crossOrigin: "anonymous",
              controlsList: "nodownload",
              playsInline: true,
            },
          },
        }}
      />

      {/* Product Markers Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {visibleProducts.map(product => {
          const position = calculateMarkerPosition(product);
          return (
            <button
              key={product.product_name}
              className="absolute bg-black bg-opacity-25 border border-[#FFFFFF99] flex items-center justify-center cursor-pointer pointer-events-auto z-10 animate-fadeIn backdrop-blur-[20px] shadow-[0px_5px_5px_0px_rgba(0,0,0,0.25)] transition-[border-radius] duration-300 ease-in-out hover:!rounded-[15px] overflow-hidden isolate"
              style={{
                left: position.left,
                top: position.top,
                width: '35px',
                height: '35px',
                transform: 'translate(-50%, -50%)',
                borderRadius: '10px'
              }}
              onClick={(e) => {
                e.stopPropagation();
                console.log('Product marker clicked:', product.product_name);
                onProductSelect(product);
              }}
              aria-label={`View ${product.product_name} details`}
            >
              <ShoppingBagOutlined className="text-zinc-100" style={{ fontSize: '24px' }} />
            </button>
          );
        })}
      </div>

      {/* Custom Video Controls */}
      <div
        className={`video-controls absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/80 to-transparent px-6 pb-2 transition-opacity duration-300 ${controlsVisible ? 'opacity-100' : 'opacity-0'}`}
      >
        {/* Progress bar */}
        <div
          className="w-full h-2 bg-[#F4F3F399] rounded-lg mb-1 cursor-pointer overflow-hidden relative"
          onClick={handleProgressBarClick}
        >
          {/* Buffer indicator */}
          <div
            className="absolute top-0 left-0 h-full bg-[#F4F3F366] transition-all duration-100"
            style={{ width: `${Math.min(loaded * 100, 100)}%` }}
          >
          </div>
          {/* Progress indicator */}
          <div
            className="absolute top-0 left-0 h-full bg-[#F4F3F3] transition-all duration-100"
            style={{ width: ended ? '100%' : `${Math.min((currentTime / duration) * 100, 100)}%` }}
          >
          </div>
        </div>

        {/* Controls row */}
        <div className="flex items-center justify-between pb-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={togglePlayPause}
              className="w-6 h-6 flex items-center justify-center hover:bg-white/30 transition-colors"
              aria-label={playing ? 'Pause' : 'Play'}
            >
              {playing ? <PauseIcon /> : <PlayIcon />}
            </button>
            <button
              onClick={toggleMute}
              className="w-6 h-6 flex items-center justify-center hover:bg-white/30 transition-colors"
              aria-label={muted ? 'Unmute' : 'Mute'}
            >
              {muted ? <VolumeOffIcon /> : <VolumeUpIcon />}
            </button>
            <span className="text-white font-ibm-plex-mono font-medium" style={{ fontSize: '12px', lineHeight: '16px', letterSpacing: '0' }}>
              {formatTime(ended ? duration : currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div>
            <button
                onClick={toggleExpand}
                className="w-6 h-6 flex items-center justify-center hover:bg-white/30 transition-colors"
                aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              {isFullscreen ? <CollapseIcon /> : <ExpandIcon />}
            </button>
          </div>

          {/*<div className="text-white text-sm">*/}
          {/*  {visibleProducts.length > 0 && (*/}
          {/*    <span className="flex items-center">*/}
          {/*      <ShoppingBag fontSize="small" className="mr-1" />*/}
          {/*      {visibleProducts.length} product{visibleProducts.length !== 1 ? 's' : ''} available*/}
          {/*    </span>*/}
          {/*  )}*/}
          {/*</div>*/}
        </div>
      </div>
    </div>
  );
});

ProductVideoPlayer.displayName = 'ProductVideoPlayer';

export default ProductVideoPlayer;
export { ProductVideoPlayer };
