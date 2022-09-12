ffmpeg \
-v trace  \
	2>&1 \
-protocol_whitelist \
file,udp,rtp \
-i \
/home/ubuntu/kurento-rtmp/35.89.201.148_55000.sdp \
-max_interleave_delta 20000000 \
-filter_complex fps=60 \
-an \
-c:v libx264 -pix_fmt yuv420p  \
-f flv \
'rtmps://live-api-s.facebook.com:443/rtmp/2991749514304695?s_bl=1&s_oil=2&s_psm=1&s_sw=0&s_tids=1&s_vt=api-s&a=AbxUgt1hyO8Y9eEj'

'rtmps://live-api-s.facebook.com:443/rtmp/2991737027639277?s_bl=1&s_oil=2&s_psm=1&s_sw=0&s_tids=1&s_vt=api-s&a=Abw8_aqMn_KlNWd1'

'rtmps://live-api-s.facebook.com:443/rtmp/2991733410972972?s_bl=1&s_oil=2&s_psm=1&s_sw=0&s_tids=1&s_vt=api-s&a=Abx505P5L6dLL60a'
'rtmps://live-api-s.facebook.com:443/rtmp/2991726457640334?s_bl=1&s_oil=2&s_psm=1&s_sw=0&s_tids=1&s_vt=api-s&a=AbwX-loLqx9ZuBB5'

'rtmps://live-api-s.facebook.com:443/rtmp/2991720260974287?s_bl=1&s_oil=2&s_psm=1&s_sw=0&s_tids=1&s_vt=api-s&a=AbwxFQozBbAuZZf5'
exit
'rtmps://live-api-s.facebook.com:443/rtmp/2991676217645358?s_bl=1&s_oil=2&s_psm=1&s_sw=0&s_tids=1&s_vt=api-s&a=AbyacDInWkjlGfyQ'

exit;
'rtmps://live-api-s.facebook.com:443/rtmp/2988987931247520?s_bl=1&s_oil=2&s_psm=1&s_sw=0&s_tids=1&s_vt=api-s&a=Abz5xvS8moSXwyH2'

--- fifo
-f fifo \
-fifo_format flv \
-map 0:a \
-map 0:v \
-attempt_recovery 1 \
-recovery_wait_time 1 \
-queue_size 200 \
-rtbufsize 128000k \
	-fflags nobuffer \
-c:a aac  \
