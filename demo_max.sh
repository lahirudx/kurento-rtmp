#	 stream deno signal to kurento server
ffmpeg \
    -re \
    -fflags +genpts \
	-f lavfi -i testsrc2=size=1280x720:rate=30 \
    -an \
    -c:v vp8 \
    -f rtp \
    -sdp_file debug_max.sdp \
    "rtp://127.0.0.1:55007"

