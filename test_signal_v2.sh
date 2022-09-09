ffmpeg \
	-fflags nobuffer \
	2>&1 \
-v trace  \
-rtbufsize 128000k \
-protocol_whitelist \
file,udp,rtp \
-max_interleave_delta 20000000 \
-i \
/home/ubuntu/kurento-rtmp/52.33.38.36_55000.sdp \
-c:a \
copy \
-c:v copy \
-f flv \
'rtmps://live-api-s.facebook.com:443/rtmp/2988828287930151?s_bl=1&s_oil=2&s_psm=1&s_sw=0&s_tids=1&s_vt=api-s&a=AbwwaJpOg18lQscG'

'rtmps://live-api-s.facebook.com:443/rtmp/2988822601264053?s_bl=1&s_oil=2&s_psm=1&s_sw=0&s_tids=1&s_vt=api-s&a=AbwvB6QOZra5WK7p'

'rtmps://live-api-s.facebook.com:443/rtmp/2988812204598426?s_bl=1&s_oil=2&s_psm=1&s_sw=0&s_tids=1&s_vt=api-s&a=Abw5YJ0PSJ_sHtli'

exit
'rtmps://live-api-s.facebook.com:443/rtmp/2988799594599687?s_bl=1&s_oil=2&s_psm=1&s_sw=0&s_tids=1&s_vt=api-s&a=AbzbmjGY6hlrP0Wz'
exit

'rtmps://live-api-s.facebook.com:443/rtmp/2988792881267025?s_bl=1&s_oil=2&s_psm=1&s_sw=0&s_tids=1&s_vt=api-s&a=Abxl3d-jI9YvM-gS'

'rtmps://live-api-s.facebook.com:443/rtmp/2988774067935573?s_bl=1&s_oil=2&s_psm=1&s_sw=0&s_tids=1&s_vt=api-s&a=AbznslL2c2J0AF9q'

libx264 \
-pix_fmt \
yuv420p \
aac \
--- fifo
-f fifo \
-fifo_format flv \
-map 0:a \
-map 0:v \
-attempt_recovery 1 \
-recovery_wait_time 1 \
-queue_size 200 \
