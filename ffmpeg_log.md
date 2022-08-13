
### Logs recieved from node server.

```log
From ffmpeg:
ffmpeg version 5.1 Copyright (c) 2000-2022 the FFmpeg developers
  built with Apple clang version 13.1.6 (clang-1316.0.21.2.5)
  configuration: --prefix=/opt/homebrew/Cellar/ffmpeg/5.1 --enable-shared --enable-pthreads --enable-version3 --cc=clang --host-cflags= --host-ldflags= --enable-ffplay --enable-gnutls --enable-gpl --enable-libaom --enable-libbluray --enable-libdav1d --enable-libmp3lame --enable-libopus --enable-librav1e --enable-librist --enable-librubberband --enable-libsnappy --enable-libsrt --enable-libtesseract --enable-libtheora --enable-libvidstab --enable-libvmaf --enable-libvorbis --enable-libvpx --enable-libwebp --enable-libx264 --enable-libx265 --enable-libxml2 --enable-libxvid --enable-lzma --enable-libfontconfig --enable-libfreetype --enable-frei0r --enable-libass --enable-libopencore-amrnb --enable-libopencore-amrwb --enable-libopenjpeg --enable-libspeex --enable-libsoxr --enable-libzmq --enable-libzimg --disable-libjack --disable-indev=jack --enable-videotoolbox --enable-neon

```

```log
From ffmpeg:
  libavutil      57. 28.100 / 57. 28.100
  libavcodec     59. 37.100 / 59. 37.100
  libavformat    59. 27.100 / 59. 27.100

```

```log
From ffmpeg:
  libavdevice    59.  7.100 / 59.  7.100
  libavfilter     8. 44.100 /  8. 44.100
  libswscale      6.  7.100 /  6.  7.100
  libswresample   4.  7.100 /  4.  7.100
  libpostproc    56.  6.100 / 56.  6.100

```

```log
From ffmpeg:
[sdp @ 0x129e05690] Could not find codec parameters for stream 1 (Video: h264, none): unspecified size
Consider increasing the value for the 'analyzeduration' (0) and 'probesize' (5000000) options
```

```log
From ffmpeg:
'Input #0, sdp, from '/Users/lahirudx/Projects/upwork/vaayuu/kurento-tutorial-node/kurento-hello-world/127.0.0.1_55000.sdp':
  Metadata:
    title           : KMS
```

```log
From ffmpeg:
  Duration: N/A, bitrate: 64 kb/s
  Stream #0:0: Audio: pcm_mulaw, 8000 Hz, mono, s16, 64 kb/s
  Stream #0:1: Video: h264, none, 90k tbr, 90k tbn
```

```log
From ffmpeg:
'Output #0, flv, to 'rtmp://localhost/live/127.0.0.1_55000':
  Metadata:
    title           : KMS
    encoder         : Lavf59.27.100
  Stream #0:0: Audio: pcm_mulaw ([8][0][0][0] / 0x0008), 8000 Hz, mono, s16, 64 kb/s
Stream mapping:
  Stream #0:0 -> #0:0 (copy)
Press [q] to stop, [?] for help
```

```log
From ffmpeg:
'/Users/lahirudx/Projects/upwork/vaayuu/kurento-tutorial-node/kurento-hello-world/127.0.0.1_55000.sdp: Operation timed out
```

```log
From ffmpeg:
size=       0kB time=00:00:00.00 bitrate=N/A speed=N/A    
[flv @ 0x119e04690] Failed to update header with correct duration.
[flv @ 0x119e04690] Failed to update header with correct filesize.
size=       0kB time=00:00:00.00 bitrate=N/A speed=   0x    
```

```log
From ffmpeg:
video:0kB audio:0kB subtitle:0kB other streams:0kB global headers:0kB muxing overhead: unknown
Output file is empty, nothing was encoded (check -ss / -t / -frames parameters if used)
```

```log
From ffmpeg:
'127.0.0.1_55000 closed'
Stopping video call ...
Senging message: {"id":"stop"}
```