/*
 * (C) Copyright 2014-2015 Kurento (http://kurento.org/)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

var path = require('path');
var url = require('url');
var cookieParser = require('cookie-parser')
var express = require('express');
var session = require('express-session')
var minimist = require('minimist');
var ws = require('ws');
var kurento = require('kurento-client');
var fs    = require('fs');
var https = require('https');
var spawn = require('child_process').spawn;

const NodeMediaServer = require('node-media-server');

var argv = minimist(process.argv.slice(2), {
    default: {
        as_uri: 'https://localhost:8443/',
        ws_uri: 'ws://52.27.166.165:8888/kurento',
        // ws_uri: 'ws://localhost:8888/kurento'
    }
});

var options =
{
  key:  fs.readFileSync('keys/server.key'),
  cert: fs.readFileSync('keys/server.crt')
};

const rtmp_server_config = {
    logType: 3,
    rtmp: {
        port: 1935,
        chunk_size: 60000,
        gop_cache: true,
        ping: 60,
        ping_timeout: 30
    },
    http: {
        port: 3000,
        allow_origin: '*'
    }
};

var app = express();
var session_index = 0;

/*
 * Management of sessions
 */
app.use(cookieParser());

var sessionHandler = session({
    secret : 'none',
    rolling : true,
    resave : true,
    saveUninitialized : true
});

app.use(sessionHandler);

/*
 * Definition of global variables.
 */
var sessions = {};
var candidatesQueue = {};
var kurentoClient = null;

/*
 * Server startup
 */
var asUrl = url.parse(argv.as_uri);
var port = asUrl.port;
var server = https.createServer(options, app).listen(port, function() {
    console.log('Kurento Tutorial started');
    console.log('Open ' + url.format(asUrl) + ' with a WebRTC capable browser');
});

var wss = new ws.Server({
    server : server,
    path : '/helloworld'
});

/*
 * Management of WebSocket messages
 */
wss.on('connection', function(ws, req) {
    var sessionId = null;
    var request = req;
    var response = {
        writeHead : {}
    };

    sessionHandler(request, response, function(err) {
        sessionId = request.session.id;
        console.log('Connection received with sessionId ' + sessionId);
    });

    ws.on('error', function(error) {
        console.log('Connection ' + sessionId + ' error');
        stop(sessionId);
    });

    ws.on('close', function() {
        console.log('Connection ' + sessionId + ' closed');
        stop(sessionId);
    });

    ws.on('message', function(_message) {
        var message = JSON.parse(_message);
        // console.log('Connection ' + sessionId + ' received message ', message);

        switch (message.id) {
        case 'start':
            sessionId = request.session.id;
            start(sessionId, ws, message.sdpOffer, function(error, sdpAnswer) {
                if (error) {
                    return ws.send(JSON.stringify({
                        id : 'error',
                        message : error
                    }));
                }
                ws.send(JSON.stringify({
                    id : 'startResponse',
                    sdpAnswer : sdpAnswer
                }));
            });
            break;

        case 'stop':
            stop(sessionId);
            break;

        case 'onIceCandidate':
            onIceCandidate(sessionId, message.candidate);
            break;

        default:
            ws.send(JSON.stringify({
                id : 'error',
                message : 'Invalid message ' + message
            }));
            break;
        }

    });
});

/*
 * Definition of functions
 */

// Recover kurentoClient for the first time.
function getKurentoClient(callback) {
    if (kurentoClient !== null) {
        return callback(null, kurentoClient);
    }

    kurento(argv.ws_uri, function(error, _kurentoClient) {
        if (error) {
            console.log("Could not find media server at address " + argv.ws_uri);
            return callback("Could not find media server at address" + argv.ws_uri
                    + ". Exiting with error " + error);
        }

        kurentoClient = _kurentoClient;
        callback(null, kurentoClient);
    });
}

function start(sessionId, ws, sdpOffer, callback) {
    // console.log({ sdpOffer });
    if (!sessionId) {
        return callback('Cannot use undefined sessionId');
    }

    getKurentoClient(function(error, kurentoClient) {
        if (error) {
            return callback(error);
        }

        kurentoClient.create('MediaPipeline', function(error, pipeline) {
            if (error) {
                return callback(error);
            }

            createMediaElements(pipeline, ws, function(error, webRtcEndpoint, rtpEndpoint) {
                if (error) {
                    pipeline.release();
                    return callback(error);
                }

                if (candidatesQueue[sessionId]) {
                    while(candidatesQueue[sessionId].length) {
                        var candidate = candidatesQueue[sessionId].shift();
                        webRtcEndpoint.addIceCandidate(candidate);
                    }
                }

                connectMediaElements(webRtcEndpoint, rtpEndpoint, function(error) {
                    if (error) {
                        pipeline.release();
                        return callback(error);
                    }

                    webRtcEndpoint.on('IceCandidateFound', function(event) {
                        var candidate = kurento.getComplexType('IceCandidate')(event.candidate);
                        ws.send(JSON.stringify({
                            id : 'iceCandidate',
                            candidate : candidate
                        }));
                    });

                    webRtcEndpoint.processOffer(sdpOffer, function(error, sdpAnswer) {
                        if (error) {
                            pipeline.release();
                            return callback(error);
                        }

                        console.log('my session id:', sessionId);
                        var streamPort = 55000 + (session_index * 2);
                        var audioPort = 49170 + (session_index * 2);
                        session_index++;    //change to next port
                        // var streamIp = '127.0.0.1';//Test ip
                        var streamIp = '35.89.201.148';//Test ip
                        generateSdpStreamConfig(streamIp, streamPort, audioPort, function (err, sdpRtpOfferString) {
                            if (err) {
                                return callback(error);
                            }

                            console.log({ sdpRtpOfferString });
                            rtpEndpoint.processOffer(sdpRtpOfferString, function (error) {
                                if (error) {
                                    return callback(error);
                                }
                                console.log('start process on: rtp://' + streamIp + ':' + streamPort);
                                console.log('recv sdp answer:', sdpAnswer);
                                var _ffmpeg_child = bindFFmpeg(streamIp, streamPort, sdpRtpOfferString, ws);
                                var _ffmpeg_child = undefined;
                                sessions[sessionId] = {
                                    'pipeline': pipeline,
                                    'webRtcEndpoint': webRtcEndpoint,
                                    'rtpEndpoint': rtpEndpoint,
                                    'ffmpeg_child_process': _ffmpeg_child
                                }
                                return callback(null, sdpAnswer);
                            });
                        });

                        // sessions[sessionId] = {
                        //     'pipeline' : pipeline,
                        //     'webRtcEndpoint' : webRtcEndpoint
                        // }
                        // return callback(null, sdpAnswer);
                    });

                    webRtcEndpoint.gatherCandidates(function(error) {
                        if (error) {
                            return callback(error);
                        }
                    });
                });
            });
        });
    });
}

function createMediaElements(pipeline, ws, callback) {
    pipeline.create('WebRtcEndpoint', function(error, webRtcEndpoint) {
        if (error) {
            return callback(error);
        }

        webRtcEndpoint.setMaxVideoRecvBandwidth(200);
        webRtcEndpoint.setMinVideoRecvBandwidth(100);

        pipeline.create("RtpEndpoint", function (error, rtpEndpoint) {
            if (error) {
                console.log("Recorder problem");
                return callback(error);
            }
            callback(null, webRtcEndpoint, rtpEndpoint);
        });
    });
}

function connectMediaElements(webRtcEndpoint, rtpEndpoint, callback) {
    webRtcEndpoint.connect(rtpEndpoint, function(error) {
        if (error) {
            return callback(error);
        }

        webRtcEndpoint.connect(webRtcEndpoint, function (error) {
            if (error) {
                return callback(error);
            }
            return callback(null);
        });

        // return callback(null);
    });
}

function stop(sessionId) {
    if (sessions[sessionId]) {
        var pipeline = sessions[sessionId].pipeline;
        console.info('Releasing pipeline');
        pipeline.release();

        delete sessions[sessionId];
        delete candidatesQueue[sessionId];
    }
}

function onIceCandidate(sessionId, _candidate) {
    var candidate = kurento.getComplexType('IceCandidate')(_candidate);

    if (sessions[sessionId]) {
        console.info('Sending candidate');
        var webRtcEndpoint = sessions[sessionId].webRtcEndpoint;
        webRtcEndpoint.addIceCandidate(candidate);
    }
    else {
        console.info('Queueing candidate');
        if (!candidatesQueue[sessionId]) {
            candidatesQueue[sessionId] = [];
        }
        candidatesQueue[sessionId].push(candidate);
    }
}

function generateSdpStreamConfig(nodeStreamIp, port, audioport, callback) {
    if (typeof nodeStreamIp === 'undefined'
        || nodeStreamIp === null
        || typeof port === 'undefined'
        || port === null) {
        return callback('nodeStreamIp and port for generating Sdp Must be setted');
    }
    var sdpRtpOfferString = 'v=0\n';
    sdpRtpOfferString += 'o=- 0 0 IN IP4 ' + nodeStreamIp + '\n';
    sdpRtpOfferString += 's=KMS\n';
    sdpRtpOfferString += 'c=IN IP4 ' + nodeStreamIp + '\n';
    sdpRtpOfferString += 't=0 0\n';
    sdpRtpOfferString += 'm=audio ' + audioport + ' RTP/AVP 97\n';
    sdpRtpOfferString += 'a=recvonly\n';
    sdpRtpOfferString += 'a=rtpmap:97 PCMU/8000\n';
    sdpRtpOfferString += 'a=fmtp:97 profile-level-id=1;mode=AAC-hbr;sizelength=13;indexlength=3;indexdeltalength=3;config=1508\n';
    sdpRtpOfferString += 'm=video ' + port + ' RTP/AVP 96\n';
    sdpRtpOfferString += 'a=rtpmap:96 H264/90000\n';
    sdpRtpOfferString += 'a=fmtp:96 packetization-mode=1\n';
    return callback(null, sdpRtpOfferString);
}

// ffplay  -protocol_whitelist rtp,file,udp   -v trace  127.0.0.1_55000.sdp

/*ffmpeg 
-protocol_whitelist "file,udp,rtp" 
-i test.sdp 
-vcodec copy 
-f flv 
rtmp://localhost/live/stream
*/
/*
SDP:
v=0
o=- 0 0 IN IP4 127.0.0.1
s=No Name
c=IN IP4 127.0.0.1
t=0 0
a=tool:libavformat 57.71.100
m=video 55000 RTP/AVP 96
b=AS:200
a=rtpmap:96 H264/90000
*/
function bindFFmpeg(streamip, streamport, sdpData, ws) {
    fs.writeFileSync(streamip + '_' + streamport + '.sdp', sdpData);

    // Stream a flv file.
    // var ffmpeg_args = [
    //     '-re',
    //     '-stream_loop', 0,
    //     '-i', path.join(__dirname, 'test.flv'),
    //     '-f', 'flv',
    //     '-flvflags', 'no_duration_filesize',
    //     'rtmps://live-api-s.facebook.com:443/rtmp/2971908729622107?s_bl=1&s_oil=2&s_psm=1&s_sw=0&s_tids=1&s_vt=api-s&a=Abxxz50xSB7h-Jfm'
    // ].concat();

    var ffmpeg_args = [
	    //'-v','trace',
        '-protocol_whitelist', 'file,udp,rtp',
        '-i', path.join(__dirname, streamip + '_' + streamport + '.sdp'),
        //'-vcodec', 'copy',
        //'-acodec', 'copy',
	'-c:a','aac',
	'-c:v','libx264','-pix_fmt','yuv420p',
        '-f', 'flv',
        // 'rtmp://localhost/live/' + streamip + '_' + streamport
	//'rtmps://live-api-s.facebook.com:443/rtmp/2988742661272047?s_bl=1&s_oil=2&s_psm=1&s_sw=0&s_tids=1&s_vt=api-s&a=Abxkgdm5sIsJC3I9'
	    //'rtmps://live-api-s.facebook.com:443/rtmp/2988761334603513?s_bl=1&s_oil=2&s_psm=1&s_sw=0&s_tids=1&s_vt=api-s&a=Abwbo-PKcA2Fqc_f'
	    'rtmps://live-api-s.facebook.com:443/rtmp/2988774067935573?s_bl=1&s_oil=2&s_psm=1&s_sw=0&s_tids=1&s_vt=api-s&a=AbznslL2c2J0AF9q'
    ].concat();
	console.log( ffmpeg_args );
	console.log( "remove it on live" );
	// DEBUG!!!!
	ffmpeg_args = ['-version'];

    /*
            '-g', '24',
        '-protocol_whitelist', 'file,udp,rtp',

    '-vcodec', 'copy',
    '-acodec', 'copy',
*/
    var child = spawn('ffmpeg', ffmpeg_args);
    ws.send(JSON.stringify({
        id: 'rtmp',
        message: '/live/' + streamip + '_' + streamport
    }));
    //ignore stdout
    //this.child.stdout.on('data', this.emit.bind(this, 'data'));
    child.stderr.on('data', function (data) {
        var _len = data.length;
        var _str;
        if (data[_len - 1] == 13) {
            _str = data.toString().substring(0, _len - 1);
        } else {
            _str = data.toString();
        }
        ws.send(JSON.stringify({
            id: 'ffmpeg',
            message: _str
        }));
    });

    child.on('error', function (err) {
        if (err.code == 'ENOENT') {
            ws.send(JSON.stringify({
                id: 'ffmpeg',
                message: 'The server has not installed ffmpeg yet.'
            }));
        } else {
            ws.send(JSON.stringify({
                id: 'ffmpeg',
                message: err
            }));
        }
    });

    child.on('close', function (code) {
        if (code === 0) {
            ws.send(JSON.stringify({
                id: 'ffmpeg',
                message: streamip + '_' + streamport + ' closed'
            }));
        }
    });
    return child;
};

app.use(express.static(path.join(__dirname, 'static')));

var nms = new NodeMediaServer(rtmp_server_config);
nms.run();
process.on('uncaughtException', function (error) {
    console.log(error);
});
